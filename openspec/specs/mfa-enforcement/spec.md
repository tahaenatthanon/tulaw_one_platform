## ADDED Requirements

### Requirement: MFA Mandatory for System Admin+

The system SHALL require all users with role level ≥ 80 (System Admin and Super Admin) to set up and use MFA before accessing any authenticated page except `/settings/mfa-setup`.

#### Scenario: System Admin without MFA logs in

- **WHEN** a System Admin user logs in with valid credentials
- **AND** the user has not enabled MFA
- **THEN** the system SHALL issue a JWT with `mfaVerified: false`
- **AND** redirect the user to `/settings/mfa-setup`
- **AND** block access to all other authenticated pages

#### Scenario: System Admin with MFA logs in

- **WHEN** a System Admin user logs in with valid credentials
- **AND** the user has MFA enabled
- **THEN** the system SHALL prompt for OTP verification before issuing full session

#### Scenario: Non-admin user logs in without MFA

- **WHEN** a User (level 30) logs in with valid credentials
- **AND** the user has not enabled MFA
- **THEN** the system SHALL issue a normal JWT with `mfaVerified: true`
- **AND** redirect to Dashboard as usual

### Requirement: TOTP-Based MFA

The system SHALL implement Time-based One-Time Password (TOTP) as the MFA mechanism using the RFC 6238 standard.

#### Scenario: Generate TOTP secret and QR code

- **WHEN** a user initiates MFA setup
- **THEN** the system SHALL generate a unique TOTP secret using `otplib`
- **AND** return a QR code data URL containing the `otpauth://` URI
- **AND** return the secret key as plain text for manual entry

#### Scenario: Verify TOTP code during setup

- **WHEN** a user submits a 6-digit OTP code during MFA setup
- **THEN** the system SHALL verify the code against the pending TOTP secret
- **AND** mark MFA as enabled and verified if the code is valid
- **AND** return an error if the code is invalid or expired

#### Scenario: Verify TOTP code during login

- **WHEN** a user submits a 6-digit OTP code during the login MFA step
- **THEN** the system SHALL verify the code against the user's stored TOTP secret
- **AND** issue a JWT with `mfaVerified: true` if the code is valid
- **AND** return an error if the code is invalid or expired

### Requirement: Backup Codes for MFA Recovery

The system SHALL generate backup codes during MFA setup for account recovery when the Authenticator app is unavailable.

#### Scenario: Generate backup codes during MFA setup

- **WHEN** MFA setup is completed successfully
- **THEN** the system SHALL generate 8 unique backup codes (10 alphanumeric characters each)
- **AND** store SHA-256 hashes of the codes in the database
- **AND** display the plaintext codes to the user exactly once

#### Scenario: Use backup code for login

- **WHEN** a user enters a backup code instead of a TOTP code during login
- **THEN** the system SHALL hash the entered code and compare against stored hashes
- **AND** if matched, grant access and delete the used hash from the database
- **AND** if not matched, return an error

#### Scenario: Backup code is one-time use

- **WHEN** a backup code has been used successfully
- **THEN** the system SHALL remove its hash from the database
- **AND** the same code SHALL NOT be accepted again

### Requirement: MFA Middleware Enforcement

The system middleware SHALL redirect users with pending MFA to `/settings/mfa-setup` and block access to all other authenticated routes.

#### Scenario: MFA-pending user accesses Dashboard

- **WHEN** a user with `mfaVerified: false` in JWT tries to access `/dashboard`
- **THEN** the middleware SHALL redirect to `/settings/mfa-setup`

#### Scenario: MFA-pending user accesses MFA setup page

- **WHEN** a user with `mfaVerified: false` tries to access `/settings/mfa-setup`
- **THEN** the middleware SHALL allow access

#### Scenario: MFA-verified user accesses any page

- **WHEN** a user with `mfaVerified: true` tries to access any authenticated page
- **THEN** the middleware SHALL allow access normally

### Requirement: MFA Audit Logging

The system SHALL create immutable audit log entries for all MFA-related actions.

#### Scenario: MFA enabled

- **WHEN** a user successfully enables MFA
- **THEN** the system SHALL create an audit log entry with action `MFA_ENABLED`, user ID, and timestamp

#### Scenario: MFA disabled

- **WHEN** a user disables MFA (self) or an admin disables MFA for another user
- **THEN** the system SHALL create an audit log entry with action `MFA_DISABLED`, actor ID, target user ID, and timestamp

#### Scenario: Backup code used

- **WHEN** a user successfully authenticates using a backup code
- **THEN** the system SHALL create an audit log entry with action `MFA_BACKUP_CODE_USED`, user ID, and timestamp

#### Scenario: MFA reset by admin

- **WHEN** a Super Admin resets MFA for another user
- **THEN** the system SHALL create an audit log entry with action `MFA_RESET`, actor ID, target user ID, and timestamp

### Requirement: MFA Status in Auth Settings

The system SHALL allow System Admin+ to toggle MFA enforcement and view MFA status of all users.

#### Scenario: Toggle MFA enforcement

- **WHEN** an admin with `SETTINGS_MANAGE` toggles the MFA enforcement setting and saves
- **THEN** the system SHALL persist the setting to `SystemConfig` table
- **AND** all System Admin+ users SHALL be required to set up MFA on next login

#### Scenario: View user MFA status

- **WHEN** an admin views the user list in User Management
- **THEN** the system SHALL display each user's MFA status (Enabled, Disabled, Pending)

### Requirement: OTP Rate Limiting

The system SHALL limit OTP verification attempts to prevent brute-force attacks.

#### Scenario: Multiple failed OTP attempts

- **WHEN** a user fails OTP verification 5 times consecutively
- **THEN** the system SHALL lock MFA verification for 5 minutes
- **AND** return an error message indicating the lockout period

#### Scenario: Successful OTP resets counter

- **WHEN** a user successfully verifies OTP after failed attempts
- **THEN** the system SHALL reset the failed attempt counter to 0
