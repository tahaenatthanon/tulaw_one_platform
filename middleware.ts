import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLE_LEVELS, hasPermission, type RoleCode, type PermissionCode } from "@/lib/permissions";

function getHighestRoleLevel(roles: string[] | undefined): number {
  if (!roles?.length) return 0;
  return Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
}

function userHasPermission(roles: string[] | undefined, permission: PermissionCode): boolean {
  return hasPermission(roles, permission);
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const roles = (req.nextauth.token?.roles as string[] | undefined) ?? [];
    const level = getHighestRoleLevel(roles);
    // TODO: ปิด MFA admin ชั่วคราว — เอา comment MFA block + mfaVerified ออกเมื่อพร้อม
    // const mfaVerified = req.nextauth.token?.mfaVerified as boolean | undefined;

    // ─── MFA Enforcement for System Admin+ (level >= 80) ───
    // TODO: ปิดชั่วคราว — เปิดเมื่อไหร่ก็เอา comment ออก
    /*
    if (level >= 80 && mfaVerified === false) {
      if (
        pathname.startsWith("/settings/mfa-setup") ||
        pathname.startsWith("/api/mfa") ||
        pathname.startsWith("/api/auth") ||
        pathname === "/login"
      ) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/settings/mfa-setup", req.url));
    }
    */

    // ─── Users & Roles — Super Admin or System Admin only (level >= 80) ───
    if (pathname.startsWith("/users") && level < 80) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ─── Audit Log — Super Admin, System Admin, Dean, Dept Admin (level >= 50) ───
    if (pathname.startsWith("/audit-log") && level < 50) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ─── Settings — Super Admin or System Admin only (level >= 80) ───
    if (pathname.startsWith("/settings") && level < 80) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/application-hub/:path*",
    "/intranet/:path*",
    "/book-meeting/:path*",
    "/documents/:path*",
    "/projects/:path*",
    "/users/:path*",
    "/audit-log/:path*",
    "/settings/:path*",
  ],
};
