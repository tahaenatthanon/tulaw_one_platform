## ADDED Requirements

### Requirement: Users & Roles pages use real API data

All Users & Roles sub-pages SHALL fetch data from `/api/users` instead of generating mock users with `generateUsers()` or hardcoded arrays.

User Management SHALL additionally support the following features:
- Action Bar with Import CSV, Export CSV, AD Sync, Bulk Actions
- Advanced Filters (Role, Status, Department, Authentication Source, MFA, Last Login)
- Bulk Actions (Assign Role, Enable, Disable, Unlock Account, Reset MFA, Export Selected)
- Action Menu per row with View, Edit (Local User only), Assign Role, Reset MFA, Unlock Account, Enable/Disable
- User Detail Drawer showing Profile, Roles, Permissions, Activity, Sessions
- Pagination options (10, 25, 50, 100 rows per page) with "Showing X–Y of Z users" format
- Bulk Selection with Select All and Clear Selection
- Authentication Source display (LDAP / Local)
- Real-time behavior for all modifications

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
- **AND** Edit SHALL only be available for Local Users (LDAP users edit via AD)

#### Scenario: CSV Import updates role

- **WHEN** an admin with `USERS_BULK_IMPORT` uploads a CSV file with email and role
- **THEN** the system SHALL update roles for matching users and show results
- **AND** SHALL not create new LDAP users via CSV

#### Scenario: CSV Export downloads user data

- **WHEN** an admin with `USERS_BULK_IMPORT` clicks Export CSV or Export Selected
- **THEN** the system SHALL download a CSV file with current user data

#### Scenario: AD Sync triggers sync

- **WHEN** an admin with `USERS_AD_SYNC` clicks AD Sync
- **THEN** the system SHALL trigger an Active Directory synchronization
- **AND** display sync status in real-time

#### Scenario: Bulk Assign Role updates multiple users

- **WHEN** an admin selects multiple users and chooses Assign Role from Bulk Actions
- **THEN** the system SHALL assign the selected role to all selected users immediately

#### Scenario: Bulk Enable/Disable toggles multiple users

- **WHEN** an admin selects multiple users and chooses Enable or Disable from Bulk Actions
- **THEN** the system SHALL update the status for all selected users immediately

#### Scenario: Single user Unlock Account

- **WHEN** an admin selects Unlock Account from a user's Action Menu or Bulk Actions
- **THEN** the system SHALL unlock the account immediately

#### Scenario: Single user Reset MFA

- **WHEN** an admin selects Reset MFA from a user's Action Menu or Bulk Actions
- **THEN** the system SHALL reset MFA for the user immediately
- **AND** the user SHALL be required to re-register MFA on next login

#### Scenario: User Detail Drawer opens

- **WHEN** an admin clicks a user's name in the table
- **THEN** the system SHALL open a right-side Drawer showing Profile, Roles, Permissions, Activity, and Sessions

#### Scenario: Search across all fields

- **WHEN** a user types in the search box
- **THEN** the system SHALL search across Name, Email, Role, Department, Status, Authentication Source, Last Login, and IP Address

#### Scenario: Pagination options

- **WHEN** a user changes the page size dropdown
- **THEN** the system SHALL reload with the selected page size (10, 25, 50, or 100)
- **AND** display "Showing X–Y of Z users"

#### Scenario: Tab menu remains intact

- **WHEN** an admin navigates to Users & Roles
- **THEN** the system SHALL display all four tabs: User Management, Role Management, Permission Management, AD Sync
- **AND** each tab SHALL navigate to its corresponding sub-page

#### Scenario: All Action Menu items call real backend

- **WHEN** an admin clicks any item in the Action Menu (⋮) — Enable, Disable, Unlock, Reset MFA, Assign Role, View, Edit
- **THEN** every item SHALL call the real API and update the system immediately
- **AND** no item SHALL be a placeholder or non-functional

#### Scenario: Search queries real database

- **WHEN** a user types in the search box
- **THEN** the system SHALL send the query to GET /api/users?search=... and display real results from the database
- **AND** the table SHALL update immediately
- **AND** clearing the search SHALL reload all users

#### Scenario: No mock data in User Management

- **WHEN** any user navigates to User Management
- **THEN** the system SHALL fetch all data from real API endpoints
- **AND** no mock data generators (e.g., generateUsers()) SHALL be used
- **AND** all buttons, filters, and dropdowns SHALL be functional

#### Scenario: Bulk Action filter updates table in real-time

- **WHEN** an admin selects a value in the Bulk Action dropdown (Role or Department)
- **THEN** the system SHALL filter the user table immediately based on the selected value
- **AND** the table SHALL refresh with filtered results from the API without clicking Apply

#### Scenario: Tab switch displays only active tab content

- **WHEN** an admin clicks a different tab (Role Management, Permission Management, AD Sync)
- **THEN** the system SHALL navigate to the corresponding sub-page immediately
- **AND** SHALL display only the content for the active tab
- **AND** the previous tab content SHALL be replaced

#### Scenario: Sidebar width is optimized for content area

- **WHEN** any admin views any Users & Roles sub-page
- **THEN** the left sidebar SHALL be rendered at approximately 220px width
- **AND** all menu items SHALL remain readable and clickable
- **AND** the main content area SHALL have increased horizontal space for the user table

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

#### Scenario: Login History displays real logins

- **WHEN** an admin navigates to Login History
- **THEN** the system SHALL fetch login history entries from the API

#### Scenario: Security Events displays real events

- **WHEN** an admin navigates to Security Events
- **THEN** the system SHALL fetch security-related audit log entries filtered by event type

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

---

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
