## ADDED Requirements

### Requirement: Sign in with Microsoft Button on Login Page

The system SHALL display a prominent "Sign in with Microsoft" button on the login page (`/login`) that initiates the Microsoft Entra ID OAuth flow via the explicit Route Handler.

#### Scenario: User clicks Sign in with Microsoft

- **WHEN** a user visits the login page
- **AND** the Microsoft Entra ID provider is configured (env vars are set)
- **THEN** the system SHALL display a "Sign in with Microsoft" button below the credentials form
- **AND** the button SHALL redirect to `/api/auth/azure/login` when clicked

#### Scenario: Microsoft Entra ID not configured

- **WHEN** the Microsoft Entra ID environment variables are not set
- **THEN** the system SHALL hide the "Sign in with Microsoft" button
- **AND** display only the credentials login form

### Requirement: Azure AD Auto-Provision on First Login

The system SHALL automatically create a user record in the database when a new user logs in via Microsoft Entra ID for the first time.

#### Scenario: New Azure AD user logs in

- **WHEN** a user successfully authenticates via Microsoft Entra ID
- **AND** no user with the same email exists in the database
- **THEN** the system SHALL create a new User record with:
  - `email`: from Azure AD `email` claim
  - `firstNameTh` and `lastNameTh`: from Azure AD `name` claim (split by space)
  - `authSource`: `"azure"`
  - `status`: `"ACTIVE"`
  - `departmentId`: default department (configurable via env)
- **AND** assign the default role `"user"` via `UserRole`
- **AND** issue a JWT with the assigned roles

#### Scenario: Existing Azure AD user logs in again

- **WHEN** a user who has already been auto-provisioned logs in via Microsoft Entra ID again
- **THEN** the system SHALL find the existing user by email
- **AND** issue a JWT with the user's current roles from the database
- **AND** update `lastLoginAt` timestamp

### Requirement: Azure AD Account Linking

The system SHALL link an existing local/LDAP user account with an Azure AD identity when the email matches.

#### Scenario: Azure AD email matches existing local user

- **WHEN** a user authenticates via Microsoft Entra ID
- **AND** a user with the same email already exists with `authSource` `"local"` or `"ldap"`
- **THEN** the system SHALL update the user's `authSource` to `"azure"`
- **AND** store the Azure AD Object ID (`oid` claim) in the user's AD profile record
- **AND** preserve the user's existing roles (do not override)
- **AND** issue a JWT with the existing roles

#### Scenario: Azure AD email matches already-linked user

- **WHEN** a user authenticates via Microsoft Entra ID
- **AND** the user already has `authSource` `"azure"` and a matching Azure AD Object ID
- **THEN** the system SHALL proceed with normal login
- **AND** issue a JWT with the user's current roles

### Requirement: Azure AD Group Claims to Role Mapping

The system SHALL map Azure AD group membership claims to system roles based on configurable mapping.

#### Scenario: User belongs to mapped Azure AD group

- **WHEN** a user authenticates via Microsoft Entra ID
- **AND** the Azure AD token includes group claims
- **AND** one or more group IDs match the configured `AUTH_MICROSOFT_ENTRA_ID_GROUP_MAP`
- **THEN** the system SHALL assign the corresponding role(s) to the user
- **AND** add the mapped roles in addition to the default `"user"` role

#### Scenario: No group claims in Azure AD token

- **WHEN** a user authenticates via Microsoft Entra ID
- **AND** the Azure AD token does not include group claims
- **THEN** the system SHALL assign only the default `"user"` role
- **AND** log a warning about missing group claims

#### Scenario: Group claims present but no mapping matches

- **WHEN** a user authenticates via Microsoft Entra ID
- **AND** group claims are present but none match the configured mapping
- **THEN** the system SHALL assign only the default `"user"` role

### Requirement: Microsoft Entra ID OAuth Error Handling

The system SHALL display clear, localized error messages when Microsoft Entra ID authentication fails.

#### Scenario: OAuth sign-in error

- **WHEN** the OAuth flow fails (e.g., user denies consent, configuration error)
- **THEN** the system SHALL redirect back to `/login?error=...` with an error code
- **AND** display a user-friendly Thai error message on the login page

#### Scenario: Azure AD account is disabled or deleted

- **WHEN** a user's Azure AD account is disabled or deleted
- **THEN** the system SHALL reject the login attempt
- **AND** display the message "บัญชี Microsoft นี้ถูกระงับหรือไม่มีอยู่ในระบบ"

#### Scenario: Azure AD token expired during session

- **WHEN** the Azure AD access token expires during an active session
- **THEN** the system SHALL use the NextAuth refresh token mechanism to obtain a new access token
- **AND** if refresh fails, redirect to login page

### Requirement: Auth Source Differentiation for Azure AD Users

The system SHALL differentiate Azure AD users from LDAP and local users via the `authSource` field.

#### Scenario: Azure AD user record creation

- **WHEN** a user is auto-provisioned via Microsoft Entra ID
- **THEN** the user record SHALL have `authSource` set to `"azure"`

#### Scenario: Auth source display in user management

- **WHEN** an admin views the user list
- **THEN** the system SHALL display "Azure AD" as the auth source label for users with `authSource: "azure"`

#### Scenario: Edit restrictions for Azure AD users

- **WHEN** an admin attempts to edit an Azure AD user's core profile (email, name)
- **THEN** the system SHALL restrict editing since the source of truth is Azure AD
- **AND** allow editing of supplementary fields (department, roles)
