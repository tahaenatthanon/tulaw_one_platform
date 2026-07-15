## MODIFIED Requirements

### Requirement: System Configuration stores settings in database

The system SHALL persist all configuration settings to the database using a key-value store model instead of in-memory storage.

#### Scenario: Settings survive server restart

- **WHEN** an admin updates authentication settings and saves
- **THEN** the system SHALL persist the settings to the `SystemConfig` table
- **AND** the settings SHALL be available after server restart

#### Scenario: Settings fetched from database

- **WHEN** the settings page loads
- **THEN** the system SHALL fetch all settings from `GET /api/settings` which reads from the database

### Requirement: Authentication settings take effect immediately

The system SHALL apply authentication configuration (session timeout, JWT expiry, max login attempts, MFA enforcement) from the database in real-time.

#### Scenario: Session timeout updated

- **WHEN** an admin changes session timeout from 28800 to 14400 and saves
- **THEN** the system SHALL read the new value from the database
- **AND** new sessions SHALL use the updated timeout

#### Scenario: MFA enforcement configured

- **WHEN** an admin enables MFA enforcement for Admin roles
- **THEN** the system SHALL require MFA setup for users with role level >= 80 on next login

### Requirement: SSO/LDAP configuration takes effect

The system SHALL apply SSO/LDAP configuration (LDAP URL, base DN, domain, sync interval, enabled status) from the database.

#### Scenario: LDAP enabled after configuration

- **WHEN** an admin enables LDAP and configures connection parameters
- **THEN** the system SHALL use the database-stored LDAP settings for authentication

### Requirement: Branding changes apply system-wide via CSS variables

The system SHALL update CSS custom properties when branding colors are changed in settings.

#### Scenario: Primary color change affects all components

- **WHEN** an admin changes the primary brand color from `#A31D1D` to `#2563EB`
- **THEN** all UI components using `--tu-primary` SHALL reflect the new color
- **AND** the change SHALL persist across page reloads and server restarts

### Requirement: Storage quota is enforced in document uploads

The system SHALL enforce per-user storage quotas configured in system settings.

#### Scenario: Upload blocked when quota exceeded

- **WHEN** a user attempts to upload a document that would exceed their storage quota
- **THEN** the system SHALL reject the upload and display the remaining quota

### Requirement: API Keys can be created, revoked, and validated

The system SHALL provide API key management with creation, listing, revocation, and validation.

#### Scenario: Create API key

- **WHEN** an admin creates a new API key with a name and scopes
- **THEN** the system SHALL generate a unique API key and display it once for copying
- **AND** SHALL store only the SHA-256 hash of the key

#### Scenario: Revoke API key

- **WHEN** an admin revokes an existing API key
- **THEN** the system SHALL mark the key as revoked
- **AND** subsequent requests using that key SHALL be rejected

### Requirement: Categories can be managed

The system SHALL allow admins to create, edit, and delete announcement categories and document categories.

#### Scenario: Add announcement category

- **WHEN** an admin creates a new announcement category "ข่าวด่วน"
- **THEN** the category SHALL be available in the announcement creation form

#### Scenario: Delete unused category

- **WHEN** an admin deletes a category with no associated announcements
- **THEN** the system SHALL remove the category
- **AND** the category SHALL no longer appear in dropdown menus

### Requirement: Meeting rooms can be managed from settings

The system SHALL provide a "Meeting Rooms" tab in settings for admins to create, edit, and delete meeting rooms.

#### Scenario: Add meeting room

- **WHEN** an admin creates a new meeting room with name and capacity
- **THEN** the room SHALL appear in the Book Meeting module immediately

#### Scenario: Edit meeting room

- **WHEN** an admin changes a meeting room's capacity
- **THEN** the change SHALL be reflected in all views immediately

### Requirement: Application status can be managed

The system SHALL provide an "Application Status" tab to toggle applications between online, offline, and maintenance modes.

#### Scenario: Set app to maintenance mode

- **WHEN** an admin sets an application to "maintenance"
- **THEN** the application icon in Application Hub SHALL show a maintenance badge
- **AND** users SHALL see a maintenance notice when accessing the application

#### Scenario: App offline hidden from users

- **WHEN** an admin sets an application to "offline"
- **THEN** non-admin users SHALL not see the application in their Application Hub
