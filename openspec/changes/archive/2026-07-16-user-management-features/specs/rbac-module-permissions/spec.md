## ADDED Requirements

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

## MODIFIED Requirements

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
