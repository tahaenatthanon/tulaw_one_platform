## MODIFIED Requirements

### Requirement: MFA Mandatory for System Admin+

The system SHALL require all users with role level ≥ 80 (System Admin and Super Admin) to set up and use MFA before accessing any authenticated page except `/settings/mfa-setup`, regardless of their authentication source (Credentials, LDAP, or Azure AD).

#### Scenario: System Admin without MFA logs in via Credentials

- **WHEN** a System Admin user logs in with valid credentials
- **AND** the user has not enabled MFA
- **THEN** the system SHALL issue a JWT with `mfaVerified: false`
- **AND** redirect the user to `/settings/mfa-setup`
- **AND** block access to all other authenticated pages

#### Scenario: System Admin without MFA logs in via Azure AD

- **WHEN** a System Admin user logs in via Microsoft Entra ID (Azure AD)
- **AND** the user has not enabled MFA in TULAW ONE Platform
- **THEN** the system SHALL issue a JWT with `mfaVerified: false`
- **AND** redirect the user to `/settings/mfa-setup`
- **AND** block access to all other authenticated pages

#### Scenario: System Admin with MFA logs in

- **WHEN** a System Admin user logs in with valid credentials or via Azure AD
- **AND** the user has MFA enabled
- **THEN** the system SHALL prompt for OTP verification before issuing full session

#### Scenario: Non-admin user logs in without MFA

- **WHEN** a User (level 30) logs in with valid credentials or via Azure AD
- **AND** the user has not enabled MFA
- **THEN** the system SHALL issue a normal JWT with `mfaVerified: true`
- **AND** redirect to Dashboard as usual

#### Scenario: Azure AD user with System Admin role logs in first time

- **WHEN** an Azure AD user whose group claims map to System Admin role logs in for the first time
- **AND** the user is auto-provisioned with `system_admin` role
- **THEN** the system SHALL detect role level ≥ 80
- **AND** require MFA setup before granting full access
