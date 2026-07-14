## 1. Database & Seed Data

- [x] 1.1 Review and update `prisma/schema.prisma` — ensure all permission codes from the RBAC spec exist as enum values in the `Permission` enum
- [x] 1.2 Update `prisma/seed.ts` to seed all 6 roles with correct permission mappings per `rbac-module-permissions` spec
- [x] 1.3 Add seed data for role hierarchy levels (numeric levels 10–100) if not already in schema

## 2. Core Permission Infrastructure

- [x] 2.1 Update `lib/permissions.ts` — ensure all permission code constants match the spec (add any missing codes)
- [x] 2.2 Implement `checkPermission(user, permissionCode)` utility that combines role-level check with data scope awareness
- [x] 2.3 Update `lib/auth-guard.ts` — add role-level route protection that reads from JWT and validates against required permission codes
- [x] 2.4 Update `middleware.ts` to include role information in session/JWT (ensure `role` and `departmentId` are always available)

## 3. Data Scope Implementation

- [x] 3.1 Create `lib/data-scope.ts` utility that returns the appropriate `WHERE` clause for a given role and department
- [x] 3.2 Apply data scope filtering to Dashboard API routes (`app/api/dashboard/`) — filter stats by department for Dept Admin and User roles
- [x] 3.3 Apply data scope filtering to Documents API routes (`app/api/documents/`) — enforce Central/Department/Personal pool access rules
- [x] 3.4 Apply data scope filtering to Projects API routes (`app/api/projects/`) — filter by department or membership
- [x] 3.5 Apply data scope filtering to Users API routes (`app/api/users/`) — Dept Admin sees only their department users
- [x] 3.6 Apply data scope filtering to Audit Log API routes (`app/api/audit-logs/`) — filter by department for Dept Admin

## 4. UI Permission Controls

- [x] 4.1 Update `hooks/use-permission.ts` to check against the full permission matrix from the spec
- [x] 4.2 Update `hooks/use-action-permissions.ts` to return granular action-level permissions (create, edit, delete, approve, etc.) per module
- [x] 4.3 Update `components/shared/permission-guard.tsx` to support action-level guards (not just view-level)
- [x] 4.4 Audit and update sidebar navigation — ensure all items respect the role visibility rules from the spec (hide Users & Roles, Audit Log, Settings for non-admin roles)
- [x] 4.5 Audit and update Dashboard page — hide Comparison view for Users, hide Advanced Search for non-admin roles
- [x] 4.6 Audit and update Application Hub — hide Add/Remove/Category actions for non-admin roles, hide Pin for Viewer
- [x] 4.7 Audit and update Intranet pages — hide Create/Edit/Delete/Publish based on role
- [x] 4.8 Audit and update Book Meeting pages — hide Confirm/Edit Any/Cancel Any/Manage Rooms based on role
- [x] 4.9 Audit and update Documents pages — enforce pool access and hide Upload/Delete/Move/Permission actions per role
- [x] 4.10 Audit and update Projects pages — hide Approve/Reject/Delete based on role
- [x] 4.11 Audit and update Users & Roles pages — hide tabs (Role Mgmt, Permission Mgmt, AD Sync) and actions (Add, Delete, Import) based on role
- [x] 4.12 Audit and update Audit Log pages — hide Export/Filter actions for unauthorized roles
- [x] 4.13 Audit and update Settings pages — deny access entirely for Dean, Dept Admin, User, Viewer

## 5. System Admin Differentiator Rules

- [x] 5.1 Implement runtime guard in User Management API — prevent System Admin from deleting Super Admin users
- [x] 5.2 Implement runtime guard in User Management API — prevent System Admin from changing the role of Super Admin users
- [x] 5.3 Implement runtime guard in Audit Log API — prevent System Admin from clearing/truncating audit logs
- [x] 5.4 Implement runtime guard in Settings API — restrict System Admin branding access where specified

## 6. Documentation & Verification

- [x] 6.1 Update `claude.md` sections 11.2–11.7 to reference `openspec/specs/rbac-role-definitions/` and `openspec/specs/rbac-module-permissions/` as the authoritative source
- [x] 6.2 Verify each API route has appropriate permission checks — walk through all route handlers and confirm guards are in place
- [ ] 6.3 Manual QA: test each role (log in as each role) and verify UI visibility and API access match the spec
