## MODIFIED Requirements

### Requirement: Settings page persists configuration

The Settings page SHALL persist all configuration changes to a backend API instead of local state only.

The Settings page SHALL support 8 sections, each persisting to the database via API:
- **Authentication** (auth settings, session timeout, JWT expiry, max login attempts, MFA enforcement)
- **SSO/LDAP** (LDAP URL, Base DN, Domain, Sync Interval, Enabled)
- **UI Branding** (logo upload, primary color, secondary color, display settings)
- **Storage** (per-user quota, allowed file types)
- **API Keys** (create, rotate, disable, delete)
- **Categories** (announcement categories, project categories — add, edit, delete, color)
- **Meeting Rooms** (add, edit room info including location)
- **App Status** (toggle active/maintenance per application)

All changes SHALL take effect immediately without page refresh.

#### Scenario: Saving auth settings

- **WHEN** an admin modifies authentication settings and clicks Save
- **THEN** the system SHALL PUT to `/api/settings?section=auth` and show a success toast

#### Scenario: Saving SSO/LDAP configuration

- **WHEN** an admin modifies SSO settings and clicks Save
- **THEN** the system SHALL persist the configuration via the API

#### Scenario: Saving branding settings

- **WHEN** an admin modifies system branding (name, color) and clicks Save
- **THEN** the system SHALL persist the branding via the API
- **AND** CSS variables SHALL update immediately

#### Scenario: Uploading logo

- **WHEN** an admin uploads a new logo file
- **THEN** the system SHALL upload via API and display the new logo immediately

#### Scenario: Managing API keys

- **WHEN** an admin creates, rotates, disables, or deletes an API key
- **THEN** the system SHALL persist the change via the API
- **AND** the change SHALL take effect immediately

#### Scenario: Managing categories

- **WHEN** an admin adds, edits, or deletes a category (announcement or project)
- **THEN** the system SHALL persist the change to the database

#### Scenario: Managing meeting rooms

- **WHEN** an admin adds or edits a meeting room
- **THEN** the room SHALL appear in Book Meeting immediately

#### Scenario: Managing app status

- **WHEN** an admin sets an application to "maintenance" or "active"
- **THEN** the application icon in Application Hub SHALL show the correct status badge immediately

### Requirement: Audit Log pages use real API data

All Audit Log sub-pages SHALL fetch data from `/api/audit-logs` instead of `generateLogs()` or hardcoded event arrays.

The Audit Log SHALL support:
- Multi-filter (User, Event Type, Module, Severity, Date Range)
- Sort by any column
- View Details (User, Timestamp, IP Address, Module, Action, Before/After)
- Export as CSV and Excel
- Date range filtering for display and export
- At minimum these Event Types: DOC_UPLOAD, CONFIG_UPDATE, PROJECT_APPROVE, AD_SYNC, USER_LOGIN, USER_LOGIN_FAILED, DASHBOARD_VIEW, ROLE_CREATE and other system events
- Immutable / append-only — no modify or delete through the system

#### Scenario: Activity Log loads with pagination

- **WHEN** a user with `AUDIT_LOG_VIEW` permission navigates to Activity Log
- **THEN** the system SHALL fetch logs from `GET /api/audit-logs` with pagination, module filter, and action filter
- **AND** SHALL respect data scope (Dept Admin sees only their department's logs)

#### Scenario: Multi-filter search

- **WHEN** a user applies multiple filters simultaneously (User + Event Type + Date Range)
- **THEN** the system SHALL filter logs using all selected criteria

#### Scenario: View audit log details

- **WHEN** a user clicks on an audit log entry
- **THEN** the system SHALL display: User, Timestamp, IP Address, Module, Action, Old Value, New Value

#### Scenario: Export as CSV

- **WHEN** a user with `AUDIT_LOG_EXPORT` clicks Export CSV
- **THEN** the system SHALL download a CSV file with filtered audit log data

#### Scenario: Export as Excel

- **WHEN** a user with `AUDIT_LOG_EXPORT` clicks Export Excel
- **THEN** the system SHALL download an Excel file with filtered audit log data

#### Scenario: Audit log immutability

- **WHEN** any role attempts to modify or delete an individual audit log entry
- **THEN** the system SHALL reject the operation — audit log entries are append-only and immutable

#### Scenario: Before/After change tracking

- **WHEN** a significant configuration or user data change occurs
- **THEN** the system SHALL record oldValue and newValue in the AuditLog entry

#### Scenario: No mock data in audit log

- **WHEN** any user navigates to Audit Log
- **THEN** the system SHALL fetch all data from real API endpoints
- **AND** no mock data generators (e.g., generateLogs()) SHALL be used

#### Scenario: Data persists after refresh and logout

- **WHEN** an admin modifies any Settings or data, saves, refreshes the page, or logs out and back in
- **THEN** all modified data SHALL still be present from the database
- **AND** no data SHALL revert to mock or default values

#### Scenario: All editable fields update real backend

- **WHEN** an admin changes any value in an editable field and saves
- **THEN** the system SHALL send the change via API to the database
- **AND** SHALL NOT only update local state or screen display

#### Scenario: Latest data shown immediately after save

- **WHEN** an admin successfully saves any configuration change
- **THEN** the system SHALL display the latest data immediately in all affected views
