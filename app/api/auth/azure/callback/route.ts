import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForToken,
  getUserProfile,
  type AzureUserProfile,
} from "@/lib/azure-ad";

// ── Helpers ────────────────────────────────────────────────────────────────

function splitDisplayName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  const last = parts.pop()!;
  const first = parts.join(" ");
  return { first, last };
}

/**
 * Auto-provision or link an Azure AD user in the database.
 * Returns the user's ID, roles, and departmentId.
 */
async function provisionUser(profile: AzureUserProfile): Promise<{
  id: string;
  roles: string[];
  departmentId: number | null;
}> {
  const azureEmail = profile.email;
  const azureOid = profile.id;
  const displayName = profile.displayName;

  const existingUser = await prisma.user.findUnique({
    where: { email: azureEmail },
    include: {
      userRoles: {
        where: { isActive: true },
        include: { role: true },
      },
      adProfile: true,
    },
  });

  if (existingUser) {
    // ── Account Linking ──
    const shouldUpdateAuthSource =
      existingUser.authSource === "local" ||
      existingUser.authSource === "ldap";

    if (shouldUpdateAuthSource) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { authSource: "azure" },
      });
    }

    if (azureOid) {
      await prisma.userAdProfile.upsert({
        where: { id: existingUser.id },
        create: {
          id: existingUser.id,
          azureAdObjectId: azureOid,
          adUpn: azureEmail,
        },
        update: {
          azureAdObjectId: azureOid,
          ...(existingUser.adProfile?.adUpn
            ? {}
            : { adUpn: azureEmail }),
        },
      });
    }

    console.log(
      `[Auth] Azure AD account linked: ${azureEmail} (existing user)`
    );

    return {
      id: existingUser.id,
      roles: existingUser.userRoles.map((ur) => ur.role.roleCode),
      departmentId: existingUser.departmentId ?? null,
    };
  }

  // ── Auto-Provision New User ──
  const { first, last } = splitDisplayName(displayName);
  const defaultDeptId = parseInt(
    process.env.DEFAULT_DEPARTMENT_ID || "1",
    10
  );

  const roleRecords = await prisma.role.findMany({
    where: { roleCode: { in: ["user"] } },
  });

  const newUser = await prisma.user.create({
    data: {
      email: azureEmail,
      firstNameTh: first,
      lastNameTh: last,
      departmentId: defaultDeptId,
      authSource: "azure",
      status: "ACTIVE",
      userRoles: {
        create: roleRecords.map((role) => ({
          roleId: role.id,
          isActive: true,
        })),
      },
      adProfile: {
        create: {
          azureAdObjectId: azureOid ?? null,
          adUpn: azureEmail,
        },
      },
    },
  });

  console.log(
    `[Auth] Azure AD user auto-provisioned: ${azureEmail} with role [user]`
  );

  return {
    id: newUser.id,
    roles: ["user"],
    departmentId: defaultDeptId,
  };
}

// ── Route Handler ──────────────────────────────────────────────────────────

/**
 * GET /api/auth/azure/callback
 *
 * Steps 3-6 of OAuth flow:
 *   3. Validate state token (CSRF protection)
 *   4. Exchange authorization code for access_token
 *   5. Fetch user profile from Microsoft Graph API
 *   6. Auto-provision / account link → create JWT session → redirect
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL || "http://localhost:3000";
  // Support both old (NextAuth) and new env var names
  const tenantId = process.env.MICROSOFT_TENANT_ID || process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET;

  const errorRedirect = (error: string) =>
    NextResponse.redirect(new URL(`/login?error=${error}`, baseUrl));

  // ── Validate required env vars ──
  if (!tenantId || !clientId || !clientSecret) {
    console.error("[Azure Callback] Missing env vars");
    return errorRedirect("Configuration");
  }

  // ── Step 3: Validate state for CSRF protection ──
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // User denied consent or another error from Microsoft
  if (error) {
    console.error(
      `[Azure Callback] OAuth error: ${error} — ${errorDescription}`
    );
    if (error === "access_denied") {
      return errorRedirect("AccessDenied");
    }
    return errorRedirect("OAuthSignin");
  }

  if (!code || !state) {
    console.error("[Azure Callback] Missing code or state");
    return errorRedirect("OAuthSignin");
  }

  // Read state cookie
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get("azure_auth_state");

  if (!stateCookie || stateCookie.value !== state) {
    console.error("[Azure Callback] CSRF state mismatch");
    return errorRedirect("csrf");
  }

  const redirectUri = `${baseUrl}/api/auth/azure/callback`;

  try {
    // ── Step 4: Exchange code for token ──
    const tokenResponse = await exchangeCodeForToken(
      tenantId,
      clientId,
      clientSecret,
      code,
      redirectUri
    );

    // ── Step 5: Fetch user profile from Microsoft Graph ──
    const profile = await getUserProfile(tokenResponse.access_token);

    if (!profile.email) {
      console.error("[Azure Callback] No email in profile");
      return errorRedirect("OAuthCallback");
    }

    // ── Step 6a: Auto-provision / account link ──
    const userInfo = await provisionUser(profile);

    // ── Step 6b: Check MFA requirement for admin users ──
    const { ROLE_LEVELS } = await import("@/lib/permissions");
    const highestLevel = Math.max(
      0,
      ...userInfo.roles.map(
        (r) =>
          ROLE_LEVELS[
            r as
              | "super_admin"
              | "system_admin"
              | "dean"
              | "dept_admin"
              | "user"
              | "viewer"
          ] ?? 0
      )
    );

    let mfaVerified = true;
    // TODO: ปิด MFA admin ชั่วคราว — เอาออกเมื่อพร้อม
    /*
    if (highestLevel >= 80) {
      const mfa = await prisma.userMfa.findFirst({
        where: { userId: userInfo.id },
      });
      mfaVerified = Boolean(mfa?.isEnabled);
    }
    */

    // ── Step 6c: Create NextAuth JWT session ──
    const sessionMaxAge = Number(process.env.SESSION_MAX_AGE) || 28800;

    const token = await encode({
      token: {
        name: profile.displayName,
        email: profile.email,
        picture: null,
        sub: userInfo.id,
        id: userInfo.id,
        roles: userInfo.roles,
        departmentId: userInfo.departmentId,
        mfaVerified,
      } as unknown as Parameters<typeof encode>[0]["token"],
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: sessionMaxAge,
    });

    // ── Step 6d: Redirect to dashboard (or MFA setup) ──
    const targetPath =
      highestLevel >= 80 && !mfaVerified
        ? "/settings/mfa-setup"
        : "/dashboard";

    const response = NextResponse.redirect(new URL(targetPath, baseUrl));

    // Set the NextAuth session cookie
    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionMaxAge,
    });

    // Clear the state cookie
    response.cookies.set("azure_auth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    console.log(
      `[Azure Callback] Login successful: ${profile.email} → ${targetPath}`
    );

    return response;
  } catch (err) {
    console.error("[Azure Callback] Unhandled error:", err);
    return errorRedirect("OAuthCallback");
  }
}
