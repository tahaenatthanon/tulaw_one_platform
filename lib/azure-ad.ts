/**
 * Azure AD (Microsoft Entra ID) OAuth 2.0 Authorization Code Flow utilities.
 *
 * Flow:
 *   1. generateAuthUrl() → redirect user to Microsoft
 *   2. User authenticates + consents
 *   3. Microsoft redirects back with ?code=
 *   4. exchangeCodeForToken() → get access_token
 *   5. getUserProfile() → fetch user info from Microsoft Graph
 */

const AUTH_BASE = "https://login.microsoftonline.com";
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export interface AzureTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface AzureUserProfile {
  id: string;
  email: string;
  displayName: string;
}

/**
 * Step 1: Build the Microsoft Entra ID authorization URL.
 */
export function generateAuthUrl(
  tenantId: string,
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile User.Read",
    state,
  });

  return `${AUTH_BASE}/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

/**
 * Step 4: Exchange authorization code for access token.
 */
export async function exchangeCodeForToken(
  tenantId: string,
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<AzureTokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(
    `${AUTH_BASE}/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Step 5: Fetch authenticated user profile from Microsoft Graph API.
 */
export async function getUserProfile(
  accessToken: string
): Promise<AzureUserProfile> {
  const res = await fetch(`${GRAPH_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Microsoft Graph API failed (${res.status}): ${errText}`);
  }

  const data = await res.json();

  return {
    id: data.id as string,
    email: (data.mail as string) || (data.userPrincipalName as string) || "",
    displayName: (data.displayName as string) || "",
  };
}
