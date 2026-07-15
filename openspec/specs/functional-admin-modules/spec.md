## ADDED Requirements

### Requirement: Users & Roles pages use real API data

All Users & Roles sub-pages SHALL fetch data from `/api/users` instead of generating mock users with `generateUsers()` or hardcoded arrays.

#### Scenario: User Management loads users

- **WHEN** an admin navigates to User Management
- **THEN** the system SHALL fetch users from `GET /api/users` with pagination, search, and filter
- **AND** SHALL respect data scope (Dept Admin sees only their department)

#### Scenario: Adding a user

- **WHEN** an admin with `USERS_CREATE` submits the add user form
- **THEN** the system SHALL POST to `/api/users` and refresh the list

#### Scenario: Editing a user

- **WHEN** an admin with `USERS_EDIT` modifies a user
- **THEN** the system SHALL PUT to `/api/users` and refresh

#### Scenario: Deleting a user

- **WHEN** an admin with `USERS_DELETE` deletes a user
- **THEN** the system SHALL soft-delete via `/api/users` and show a success toast

#### Scenario: System Admin cannot delete Super Admin

- **WHEN** a System Admin attempts to delete a Super Admin user
- **THEN** the API SHALL return a 403 error with an appropriate message

#### Scenario: Role Management loads roles

- **WHEN** an admin navigates to Role Management
- **THEN** the system SHALL fetch roles with user counts from the API

#### Scenario: Permission Management loads permissions

- **WHEN** an admin navigates to Permission Management
- **THEN** the system SHALL fetch permission groups and their role assignments from the API

#### Scenario: AD Sync displays real sync status

- **WHEN** an admin navigates to AD Sync
- **THEN** the system SHALL fetch the last sync status, user counts, and sync interval from the API

---

### Requirement: Audit Log pages use real API data

All Audit Log sub-pages SHALL fetch data from `/api/audit-logs` instead of `generateLogs()` or hardcoded event arrays.

#### Scenario: Activity Log loads with pagination

- **WHEN** a user with `AUDIT_LOG_VIEW` permission navigates to Activity Log
- **THEN** the system SHALL fetch logs from `GET /api/audit-logs` with pagination, module filter, and action filter
- **AND** SHALL respect data scope (Dept Admin sees only their department's logs)

#### Scenario: Login History displays real logins

- **WHEN** an admin navigates to Login History
- **THEN** the system SHALL fetch login history entries from the API

#### Scenario: Security Events displays real events

- **WHEN** an admin navigates to Security Events
- **THEN** the system SHALL fetch security-related audit log entries filtered by event type

#### Scenario: Export Logs downloads CSV

- **WHEN** a user with `AUDIT_LOG_EXPORT` clicks Export
- **THEN** the system SHALL download a CSV file from `/api/audit-logs?format=csv`

---

### Requirement: Settings page persists configuration

The Settings page SHALL persist all configuration changes to a backend API instead of local state only.

#### Scenario: Saving auth settings

- **WHEN** an admin modifies authentication settings and clicks Save
- **THEN** the system SHALL PUT to `/api/settings` and show a success toast

#### Scenario: Saving SSO/LDAP configuration

- **WHEN** an admin modifies SSO settings and clicks Save
- **THEN** the system SHALL persist the configuration via the API

#### Scenario: Saving branding settings

- **WHEN** an admin modifies system branding (name, color) and clicks Save
- **THEN** the system SHALL persist the branding via the API

#### Scenario: Managing API keys

- **WHEN** an admin creates or revokes an API key
- **THEN** the system SHALL persist the change via the API

---

### Requirement: System Configuration stores settings in database

The system SHALL persist all configuration settings to the database.

#### Scenario: Settings survive server restart

- **WHEN** an admin updates settings and saves
- **THEN** the system SHALL persist settings to the `SystemConfig` table
- **AND** settings SHALL be available after server restart

### Requirement: Branding changes apply system-wide via CSS variables

#### Scenario: Primary color change affects all components

- **WHEN** an admin changes the primary brand color
- **THEN** all UI components using `--tu-primary` SHALL reflect the new color
- **AND** the change SHALL persist across server restarts

### Requirement: Meeting rooms can be managed from settings

#### Scenario: Add meeting room

- **WHEN** an admin creates a new meeting room with name and capacity
- **THEN** the room SHALL appear in Book Meeting immediately

### Requirement: Application status can be managed from settings

#### Scenario: Set app to maintenance mode

- **WHEN** an admin sets an application to "maintenance"
- **THEN** the application icon in Application Hub SHALL show a maintenance badge
