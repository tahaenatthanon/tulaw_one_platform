import { NextResponse } from "next/server";
import crypto from "crypto";
import { generateAuthUrl } from "@/lib/azure-ad";

/**
 * GET /api/auth/azure/login
 *
 * Step 1-2 of OAuth flow:
 *   - Generate state token for CSRF protection
 *   - Set azure_auth_state cookie
 *   - Redirect user to Microsoft Entra ID authorization endpoint
 */
export async function GET() {
  // Support both old (NextAuth) and new env var names
  const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
  const tenantId = process.env.MICROSOFT_TENANT_ID || process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;
  const baseUrl = process.env.NEXTAUTH_URL || process.env.BASE_URL;

  if (!clientId || !tenantId || !baseUrl) {
    return NextResponse.redirect(
      new URL("/login?error=Configuration", baseUrl || "http://localhost:3000")
    );
  }

  const redirectUri = `${baseUrl}/api/auth/azure/callback`;

  // Generate CSRF state token
  const state = crypto.randomBytes(16).toString("hex");

  // Build authorization URL
  const authUrl = generateAuthUrl(tenantId, clientId, redirectUri, state);

  // Set state cookie and redirect
  const response = NextResponse.redirect(authUrl);

  response.cookies.set("azure_auth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
