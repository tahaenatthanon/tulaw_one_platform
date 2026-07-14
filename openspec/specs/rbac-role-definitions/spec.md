## ADDED Requirements

### Requirement: Role Hierarchy

The system SHALL define six (6) authorization roles with numeric levels in descending authority order:

| Role | Level | Description |
|---|---|---|
| Super Admin | 100 | Full system access, all modules, all data |
| System Admin | 80 | System care, user management, AD Sync; cannot modify Super Admin |
| Dean | 70 | View all data, approve/reject, no system configuration |
| Department Admin | 50 | Manage own department data only |
| User | 30 | Personal + department-aware access |
| Viewer | 10 | Read-only access to public and authorized data |

#### Scenario: Role levels define authority ordering

- **WHEN** a permission check compares two roles
- **THEN** a higher numeric level SHALL always have equal or greater access than a lower level for the same permission code

### Requirement: Data Scope per Role

Each role SHALL have a defined data scope that limits which records they can access:

| Role | Data Scope |
|---|---|
| Super Admin | All departments, all users, all records |
| System Admin | All departments, all users, all records |
| Dean | All departments (view only for system config) |
| Department Admin | Own department only |
| User | Own records + department data (as permitted) |
| Viewer | Public + explicitly authorized data only |

#### Scenario: Department Admin queries projects

- **WHEN** a Department Admin requests the projects list
- **THEN** the system SHALL return only projects belonging to the admin's department

#### Scenario: Dean queries projects

- **WHEN** a Dean requests the projects list
- **THEN** the system SHALL return projects from all departments

#### Scenario: User queries projects

- **WHEN** a User requests the projects list
- **THEN** the system SHALL return projects where the user is a member OR projects in their department (if department access is enabled)

### Requirement: Summary Module Access Matrix

The system SHALL enforce the following high-level module access per role:

| Module | Super Admin | System Admin | Dean | Dept Admin | User | Viewer |
|---|---|---|---|---|---|---|
| Dashboard | ✅ Full | ✅ Full | ✅ Full | ✅ Dept | ✅ Self+Dept | 👁 Read |
| Application Hub | ✅ Full | ✅ Full | ✅ Use+Pin | ✅ Use+Pin | ✅ Use+Pin | 👁 Read |
| Intranet | ✅ Full | ✅ Full | ✅ CRUD+Publish | ✅ Dept CRUD | ✅ View+Subscribe | 👁 Read |
| Book Meeting | ✅ Full | ✅ Full | ✅ Book+View | ✅ Dept Manage | ✅ Self Book | 👁 View |
| Documents | ✅ Full | ✅ Full | ✅ View+Download | ✅ Dept Manage | ✅ Self Manage | 👁 Download |
| Projects | ✅ Full | ✅ Full | ✅ View+Approve | ✅ Dept Manage | ✅ Self CRUD | 👁 View |
| Users & Roles | ✅ Full | ✅ Full* | 👁 View | ✅ Dept Users | ❌ None | ❌ None |
| Audit Log | ✅ Full | ✅ Full | 👁 View+Export | 👁 Dept View | ❌ None | ❌ None |
| System Config | ✅ Full | ✅ Full | ❌ None | ❌ None | ❌ None | ❌ None |

*\* System Admin cannot delete Super Admin, change Super Admin role, change immutable policies, or clear audit log.*

#### Scenario: Viewer accesses Users & Roles

- **WHEN** a Viewer navigates to `/users`
- **THEN** the system SHALL deny access and show an access-denied message

#### Scenario: User accesses Dashboard

- **WHEN** a User navigates to Dashboard
- **THEN** the system SHALL show personal dashboard and department dashboard (if department access is enabled)

### Requirement: System Admin Differentiator Rules

The System Admin role SHALL have all Super Admin permissions EXCEPT the following explicit restrictions:

1. Cannot delete a Super Admin user account
2. Cannot change the role of a Super Admin user
3. Cannot modify immutable audit log policies
4. Cannot clear or truncate the audit log

#### Scenario: System Admin attempts to delete Super Admin

- **WHEN** a System Admin attempts to delete a user with Super Admin role
- **THEN** the system SHALL reject the operation with an error message

#### Scenario: System Admin attempts to change Super Admin role

- **WHEN** a System Admin attempts to change the role of a Super Admin user
- **THEN** the system SHALL reject the operation with an error message

### Requirement: Department Admin Scope Boundary

The Department Admin role SHALL be restricted to their own department across all modules. They MUST NOT access, view, or modify data belonging to other departments, with the exception of shared resources (Central Pool documents, public announcements, meeting room availability).

#### Scenario: Department Admin tries to view another department's documents

- **WHEN** a Department Admin from Department A requests documents from Department B's pool
- **THEN** the system SHALL return an empty result set or access-denied error

#### Scenario: Department Admin manages own department users

- **WHEN** a Department Admin accesses User Management
- **THEN** the system SHALL only show users belonging to their department
