## ADDED Requirements

### Requirement: Dashboard Module Permissions

The system SHALL enforce the following Dashboard permissions per role:

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View all dashboards | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View department dashboard | ✅ | ✅ | ✅ | ✅ (own dept) | ✅ (if enabled) | 👁 |
| View personal dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 |
| Switch view modes (Overview/Weekly/Trend/Proportion/Comparison) | ✅ | ✅ | ✅ | ✅ | ✅ (excl. Comparison) | 👁 |
| Advanced Search | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Department filter | ✅ | ✅ | ✅ | ✅ (own dept) | ❌ | ❌ |

Permission codes: `DASHBOARD_VIEW`, `DASHBOARD_MANAGE`

#### Scenario: User switches between dashboard views

- **WHEN** a User switches dashboard views
- **THEN** the Comparison view SHALL be hidden or disabled for Users; all other views SHALL be available

#### Scenario: Department Admin views dashboard

- **WHEN** a Department Admin views the dashboard
- **THEN** the system SHALL show only their department's data and SHALL enable filtering within their department

---

### Requirement: Application Hub Module Permissions

The system SHALL enforce the following Application Hub permissions per role:

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| Access Application Hub | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Use all applications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pin/Unpin apps | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Add application | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Remove application | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change app category | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Toggle Grid/List view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Permission codes: `APPLICATION_HUB_VIEW`, `APPLICATION_HUB_MANAGE`, `APPLICATION_HUB_PIN`

#### Scenario: Super Admin adds a new application

- **WHEN** a Super Admin adds a new application to the hub
- **THEN** the system SHALL persist the application and display it to all users with appropriate access

#### Scenario: Viewer attempts to pin an app

- **WHEN** a Viewer clicks the pin action on an application
- **THEN** the system SHALL ignore the action or show the UI element as disabled

---

### Requirement: Intranet Module Permissions

The system SHALL enforce the following Intranet permissions per role:

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View public announcements | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View department announcements | ✅ | ✅ | ✅ | ✅ (own dept) | ✅ (own dept) | ✅ (if authorized) |
| Create announcement | ✅ | ✅ | ✅ | ✅ (own dept) | ✅ (if policy allows) | ❌ |
| Edit announcement | ✅ | ✅ | ✅ (own only) | ✅ (own dept) | ❌ | ❌ |
| Delete announcement | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Publish announcement | ✅ | ✅ | ✅ | ✅ (own dept) | ❌ | ❌ |
| Subscribe to categories | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage all department news | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Define target audience groups | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

Permission codes: `INTRANET_VIEW`, `INTRANET_CREATE`, `INTRANET_EDIT`, `INTRANET_DELETE`, `INTRANET_PUBLISH`

#### Scenario: Department Admin publishes news for own department

- **WHEN** a Department Admin publishes an announcement for their department
- **THEN** the announcement SHALL be visible to users in that department and users with cross-department access

#### Scenario: Dean edits another department's announcement

- **WHEN** a Dean attempts to edit an announcement owned by another department
- **THEN** the system SHALL allow editing (Dean has cross-department edit rights)

---

### Requirement: Book Meeting Module Permissions

The system SHALL enforce the following Book Meeting permissions per role:

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View all rooms & bookings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create booking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Confirm booking | ✅ | ✅ | ✅ | ✅ (own dept rooms) | ❌ | ❌ |
| Cancel own booking | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cancel any booking | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit any booking | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage all rooms | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage department rooms | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View booking history | ✅ | ✅ | ✅ | ✅ | ✅ (own only) | ❌ |

Permission codes: `BOOK_MEETING_VIEW`, `BOOK_MEETING_CREATE`, `BOOK_MEETING_EDIT`, `BOOK_MEETING_DELETE`, `BOOK_MEETING_APPROVE`

#### Scenario: User cancels own booking

- **WHEN** a User cancels their own meeting room booking
- **THEN** the system SHALL cancel the booking and release the time slot

#### Scenario: User attempts to cancel another user's booking

- **WHEN** a User attempts to cancel a booking made by another user
- **THEN** the system SHALL reject the operation

#### Scenario: Double-booking prevention is role-agnostic

- **WHEN** any role attempts to book a room at an already-reserved time
- **THEN** the system SHALL reject the booking regardless of the user's role

---

### Requirement: Documents Module Permissions

The system SHALL enforce the following Documents permissions per role across three storage pools:

**Central Pool:**

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (public only) |
| Download | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (public only) |
| Upload | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Move | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change Permission | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Department Pool:**

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View own dept | ✅ | ✅ | ✅ | ✅ | ✅ (if granted) | ✅ (if read access) |
| View other dept | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Download | ✅ | ✅ | ✅ | ✅ | ✅ (if granted) | ✅ (if read access) |
| Upload | ✅ | ✅ | ✅ (all depts) | ✅ (own dept) | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Move | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Change Permission | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |

**Personal Pool:**

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View own | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View others' | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Download own | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete own | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

Permission codes: `DOCUMENTS_VIEW`, `DOCUMENTS_UPLOAD`, `DOCUMENTS_EDIT`, `DOCUMENTS_DELETE`, `DOCUMENTS_SHARE`, `DOCUMENTS_MANAGE_POOL`

#### Scenario: Department Admin uploads to own department pool

- **WHEN** a Department Admin uploads a document to their department pool
- **THEN** the system SHALL accept the upload and store it in the correct department pool

#### Scenario: Department Admin attempts to upload to another department pool

- **WHEN** a Department Admin attempts to upload a document to another department's pool
- **THEN** the system SHALL reject the upload

#### Scenario: User deletes own document from Personal Pool

- **WHEN** a User deletes a document from their Personal Pool
- **THEN** the system SHALL soft-delete the document

#### Scenario: Storage quota enforcement

- **WHEN** any user uploads a document that exceeds their personal storage quota (5 GB for User)
- **THEN** the system SHALL reject the upload and display remaining quota information

---

### Requirement: Projects Module Permissions

The system SHALL enforce the following Projects permissions per role:

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View all projects | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View own department projects | ✅ | ✅ | ✅ | ✅ | ✅ (if member) | ✅ (if authorized) |
| Create project | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit project | ✅ | ✅ | ✅ | ✅ (own dept) | ✅ (own projects) | ❌ |
| Delete project | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Drag & Drop (Kanban) | ✅ | ✅ | ✅ | ✅ (own dept) | ✅ (own projects) | ❌ |
| Approve project | ✅ | ✅ | ✅ | ✅ (own dept) | ❌ | ❌ |
| Reject project | ✅ | ✅ | ✅ | ✅ (own dept) | ❌ | ❌ |
| Add comment | ✅ | ✅ | ✅ | ✅ | ✅ (own projects) | ❌ |
| Update progress | ✅ | ✅ | ✅ | ✅ (own dept) | ✅ (own projects) | ❌ |
| Manage all projects | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

Permission codes: `PROJECTS_VIEW`, `PROJECTS_CREATE`, `PROJECTS_EDIT`, `PROJECTS_DELETE`, `PROJECTS_APPROVE`, `PROJECTS_MANAGE_ALL`

#### Scenario: User creates a new project

- **WHEN** a User creates a project
- **THEN** the project SHALL be associated with the user's department and the user SHALL be set as the project creator

#### Scenario: Dean approves a project

- **WHEN** a Dean approves a project from any department
- **THEN** the project status SHALL change to "Approved" and the approver SHALL be recorded

#### Scenario: User attempts to approve a project

- **WHEN** a User clicks the approve action on any project
- **THEN** the system SHALL not display the approve action for Users

---

### Requirement: Users & Roles Module Permissions

The system SHALL enforce the following Users & Roles permissions per role:

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View all users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View department users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View user details | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add user | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Edit user | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Delete user | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Reset password | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Reset MFA | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Unlock Account | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Manage roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage permissions | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| AD Sync | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Import CSV | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export CSV | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Bulk Assign Role | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Bulk Enable | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Bulk Disable | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Bulk Unlock Account | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Bulk Reset MFA | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| Export Selected | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

*\* System Admin cannot delete Super Admin users, change Super Admin role, or perform Bulk Actions on Super Admin users.*

Permission codes: `USERS_VIEW`, `USERS_CREATE`, `USERS_EDIT`, `USERS_DELETE`, `USERS_MANAGE_ROLES`, `USERS_MANAGE_PERMISSIONS`, `USERS_AD_SYNC`, `USERS_BULK_IMPORT`, `USERS_BULK_ASSIGN_ROLE`, `USERS_BULK_ENABLE`, `USERS_BULK_DISABLE`, `USERS_UNLOCK_ACCOUNT`, `USERS_RESET_MFA`, `USERS_EXPORT_SELECTED`

#### Scenario: Department Admin adds a user to their department

- **WHEN** a Department Admin creates a new user
- **THEN** the new user SHALL automatically be assigned to the admin's department

#### Scenario: Department Admin views User Management

- **WHEN** a Department Admin opens User Management
- **THEN** the system SHALL only display users from their department; Role Management, Permission Management, and AD Sync tabs SHALL be hidden

#### Scenario: Dean views Users & Roles

- **WHEN** a Dean opens Users & Roles
- **THEN** the system SHALL display all users in read-only mode; Add, Edit, Delete, Import, AD Sync, and Bulk Actions SHALL be hidden

#### Scenario: Bulk Actions hidden for unauthorized roles

- **WHEN** a Dean or User opens User Management
- **THEN** the Bulk Actions bar and Action Menu items for Enable/Disable/Reset MFA/Unlock Account SHALL be hidden

#### Scenario: System Admin cannot Bulk operate on Super Admin

- **WHEN** a System Admin selects a Super Admin user in any bulk operation
- **THEN** the system SHALL exclude the Super Admin user and show a warning notification

---

### Requirement: Bulk Action Permissions

ระบบ SHALL กำหนด Permission Codes เพิ่มเติมสำหรับ Bulk Actions ใน Users & Roles module:

| Permission Code | คำอธิบาย | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|---|
| `USERS_BULK_ASSIGN_ROLE` | กำหนด Role ให้ผู้ใช้หลายรายพร้อมกัน | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| `USERS_BULK_ENABLE` | เปิดใช้งานบัญชีผู้ใช้หลายรายพร้อมกัน | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| `USERS_BULK_DISABLE` | ปิดใช้งานบัญชีผู้ใช้หลายรายพร้อมกัน | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| `USERS_UNLOCK_ACCOUNT` | ปลดล็อกบัญชีผู้ใช้ที่ถูกล็อก | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| `USERS_RESET_MFA` | รีเซ็ต MFA ของผู้ใช้ | ✅ | ✅ | ❌ | ✅ (own dept) | ❌ | ❌ |
| `USERS_EXPORT_SELECTED` | ส่งออกข้อมูลผู้ใช้ที่เลือกเป็น CSV | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

#### Scenario: Super Admin performs Bulk Assign Role

- **WHEN** Super Admin selects multiple users and performs Bulk Assign Role
- **THEN** the system SHALL allow the operation and assign the role to all selected users

#### Scenario: Department Admin performs Bulk Enable in own department

- **WHEN** Department Admin selects users from their own department and performs Bulk Enable
- **THEN** the system SHALL allow the operation

#### Scenario: Department Admin attempts Bulk Enable for other department users

- **WHEN** Department Admin attempts to perform Bulk Enable on users from another department
- **THEN** the system SHALL reject the operation with a 403 error

#### Scenario: Dean cannot access Bulk Actions

- **WHEN** Dean navigates to User Management
- **THEN** Bulk Action buttons SHALL be hidden or disabled
- **AND** `USERS_BULK_ASSIGN_ROLE`, `USERS_BULK_ENABLE`, `USERS_BULK_DISABLE`, `USERS_UNLOCK_ACCOUNT`, `USERS_RESET_MFA`, `USERS_EXPORT_SELECTED` permission checks SHALL return false for Dean

#### Scenario: System Admin cannot Bulk Enable/Disable Super Admin

- **WHEN** System Admin selects a Super Admin user in a bulk operation
- **THEN** the system SHALL skip the Super Admin user and show a warning
- **AND** the operation SHALL proceed for remaining non-Super-Admin users

---

### Requirement: Audit Log Module Permissions

The system SHALL enforce the following Audit Log permissions per role:

| Action | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| View all audit logs | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View department audit logs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export CSV | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Filter by user/action/module/date | ✅ | ✅ | ✅ | ✅ (own dept) | ❌ | ❌ |
| Clear audit log | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage audit policies | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

Permission codes: `AUDIT_LOG_VIEW`, `AUDIT_LOG_EXPORT`, `AUDIT_LOG_MANAGE`

#### Scenario: Department Admin exports audit logs

- **WHEN** a Department Admin exports audit logs to CSV
- **THEN** the exported data SHALL contain only logs related to their department

#### Scenario: Audit log immutability

- **WHEN** any role (including Super Admin) attempts to modify or delete an individual audit log entry
- **THEN** the system SHALL reject the operation — audit log entries are append-only and immutable

---

### Requirement: System Configuration Module Permissions

The system SHALL enforce the following System Configuration permissions per role:

| Submodule | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| Auth Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Microsoft SSO Config | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Security Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| API Integration | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| System Branding | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Notification Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

*\* System Admin has limited branding access (System Admin may not change certain branding elements).*

Permission codes: `SETTINGS_VIEW`, `SETTINGS_MANAGE`, `SETTINGS_API_KEYS`, `SETTINGS_BRANDING`, `SETTINGS_NOTIFICATION`, `SETTINGS_SSO`

#### Scenario: Dean accesses System Configuration

- **WHEN** a Dean navigates to `/settings`
- **THEN** the system SHALL deny access — System Configuration is not available to the Dean role

#### Scenario: Non-admin roles and settings sidebar visibility

- **WHEN** a Dean, Department Admin, User, or Viewer views the sidebar
- **THEN** the System Configuration menu item SHALL be hidden
