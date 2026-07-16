## MODIFIED Requirements

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

#### Scenario: Adding a user

- **WHEN** an admin with `USERS_CREATE` submits the add user form
- **THEN** the system SHALL POST to `/api/users` and refresh the list

#### Scenario: Editing a user

- **WHEN** an admin with `USERS_EDIT` modifies a user
- **THEN** the system SHALL PUT to `/api/users` and refresh
- **AND** Edit SHALL only be available for Local Users (LDAP users edit via AD)

#### Scenario: Deleting a user

- **WHEN** an admin with `USERS_DELETE` deletes a user
- **THEN** the system SHALL soft-delete via `/api/users` and show a success toast

#### Scenario: System Admin cannot delete Super Admin

- **WHEN** a System Admin attempts to delete a user with Super Admin role
- **THEN** the API SHALL return a 403 error with an appropriate message

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

#### Scenario: Role Management loads roles

- **WHEN** an admin navigates to Role Management
- **THEN** the system SHALL fetch roles with user counts from the API

#### Scenario: Permission Management loads permissions

- **WHEN** an admin navigates to Permission Management
- **THEN** the system SHALL fetch permission groups and their role assignments from the API

#### Scenario: AD Sync displays real sync status

- **WHEN** an admin navigates to AD Sync
- **THEN** the system SHALL fetch the last sync status, user counts, and sync interval from the API

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
