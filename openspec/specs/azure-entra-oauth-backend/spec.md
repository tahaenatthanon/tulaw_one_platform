## ADDED Requirements

### Requirement: Microsoft Entra ID Authorization Endpoint

The system SHALL generate and redirect users to the Microsoft Entra ID OAuth 2.0 authorization endpoint with all required parameters, using `MICROSOFT_CLIENT_ID` and `MICROSOFT_TENANT_ID` environment variables.

#### Scenario: Generate authorization URL

- **WHEN** a user initiates Microsoft Entra ID login
- **THEN** the system SHALL construct the URL `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize` with query parameters:
  - `client_id`: from `MICROSOFT_CLIENT_ID` env var
  - `redirect_uri`: `{BASE_URL}/api/auth/azure/callback`
  - `response_type`: `code`
  - `scope`: `openid email profile User.Read`
  - `state`: a cryptographically random string (32 characters, hex-encoded) stored server-side for CSRF validation

#### Scenario: State token for CSRF protection

- **WHEN** the system generates an authorization URL
- **THEN** the system SHALL generate a unique `state` token using `crypto.randomBytes(16).toString("hex")`
- **AND** store the state token in an HTTP-only cookie named `azure_auth_state` with `SameSite=Lax`, `Secure=true` (in production), `Path=/`, and 10-minute expiry
- **AND** include the state token as the `state` query parameter in the redirect URL

#### Scenario: Redirect user to Microsoft

- **WHEN** the authorization URL is constructed
- **THEN** the system SHALL respond with HTTP 302 redirect to the Microsoft authorization URL
- **AND** the user's browser SHALL navigate to `https://login.microsoftonline.com/...` for authentication and consent

### Requirement: Microsoft Entra ID Token Exchange

The system SHALL exchange the authorization code received from Microsoft for an access token using the OAuth 2.0 token endpoint.

#### Scenario: Receive authorization code

- **WHEN** Microsoft redirects the user back to `/api/auth/azure/callback?code=...&state=...`
- **THEN** the system SHALL extract the `code` and `state` query parameters

#### Scenario: Validate state token

- **WHEN** the system receives the callback
- **THEN** the system SHALL compare the `state` parameter from the query string against the `azure_auth_state` cookie value
- **AND** if they do NOT match, the system SHALL reject the request with HTTP 400 and redirect to `/login?error=csrf`
- **AND** clear the `azure_auth_state` cookie

#### Scenario: Exchange code for token

- **WHEN** the state token is validated successfully
- **THEN** the system SHALL send a POST request to `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token` with:
  - `client_id`: from `MICROSOFT_CLIENT_ID` env var
  - `client_secret`: from `MICROSOFT_CLIENT_SECRET` env var
  - `code`: the authorization code from query string
  - `redirect_uri`: `{BASE_URL}/api/auth/azure/callback`
  - `grant_type`: `authorization_code`
- **AND** parse the JSON response to extract `access_token`

#### Scenario: Token exchange failure

- **WHEN** the token exchange request fails (invalid code, expired code, wrong secret)
- **THEN** the system SHALL redirect to `/login?error=OAuthCallback`
- **AND** log the error details server-side for debugging

### Requirement: Microsoft Graph API User Profile

The system SHALL call the Microsoft Graph API to retrieve the authenticated user's profile information.

#### Scenario: Call Microsoft Graph API

- **WHEN** the system has a valid `access_token`
- **THEN** the system SHALL send a GET request to `https://graph.microsoft.com/v1.0/me` with header `Authorization: Bearer {access_token}`
- **AND** parse the JSON response to extract:
  - `id`: the user's Azure AD Object ID
  - `userPrincipalName` or `mail`: the user's email
  - `displayName`: the user's full name

#### Scenario: Microsoft Graph API failure

- **WHEN** the Microsoft Graph API call fails (invalid token, network error)
- **THEN** the system SHALL redirect to `/login?error=OAuthCallback`
- **AND** log the error details server-side

### Requirement: Session Creation After Azure AD Authentication

The system SHALL create a NextAuth session for the user after successful Azure AD authentication.

#### Scenario: Auto-provision and create session

- **WHEN** the system has user profile data from Microsoft Graph API
- **THEN** the system SHALL auto-provision the user in the database (same logic as existing `signIn` callback in `lib/auth.ts`)
- **AND** programmatically create a NextAuth session using `signIn("credentials")` with the user's identity
- **AND** redirect the user to `/dashboard`

#### Scenario: User already exists in database

- **WHEN** the user email from Microsoft Graph API matches an existing user in the database
- **THEN** the system SHALL link the accounts if needed (same account linking logic from existing code)
- **AND** create a NextAuth session for the existing user
- **AND** redirect the user to `/dashboard`
