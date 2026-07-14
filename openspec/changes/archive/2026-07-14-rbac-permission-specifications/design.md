## Context

The TULAW ONE PLATFORM already has an RBAC foundation: 6 roles defined in `prisma/schema.prisma`, permission codes mapped via `role_permissions` join table, JWT-based role storage, middleware for auth gating, and `PermissionGuard` / `usePermission` for UI-level checks. However, the exact permission rules per role per module exist only as prose in `claude.md` (sections 11.2–11.7) and are not consistently enforced across the codebase.

This design bridges the gap between the RBAC specification (what each role can do) and the implementation (how it's enforced in code).

## Goals / Non-Goals

**Goals:**
- Define the canonical RBAC specification as machine-readable spec files that serve as the source of truth
- Establish consistent permission code naming conventions mapped to the existing DB schema
- Define data scope rules that govern row-level filtering per role
- Provide clear implementation patterns for permission checks at middleware, API, and UI levels

**Non-Goals:**
- Changing the existing permission code names already used in production
- Modifying the Prisma schema (roles, permissions, role_permissions tables are already correct)
- Implementing the permission checks — this design focuses on specification, not implementation
- Changing the JWT structure or authentication flow

## Decisions

### Decision 1: Permission codes follow existing convention

**Choice:** Keep the existing permission code naming pattern already in use (`MODULE_ACTION`, e.g., `PROJECTS_VIEW`, `BOOK_MEETING_CREATE`).

**Rationale:** The current codes are already referenced in:
- `prisma/schema.prisma` enum values
- Sidebar specs (`sidebar-bookmeeting-navigation`, `sidebar-documents-navigation`, `projects-kanban-sidebar`)
- UI components (`PermissionGuard`, `usePermission`)

**Alternatives considered:** REST-style (`module.action`) or resource-style (`module:action`) — rejected because changing would require migrating all existing references.

### Decision 2: Data scope is enforced at the query layer, not as separate permission codes

**Choice:** Data scope rules (e.g., "Dept Admin sees only their department") are enforced by filtering database queries, not by adding separate permission codes.

**Rationale:** Data scope is orthogonal to action permissions. A Dept Admin has `PROJECTS_VIEW` — the _scope_ of what they see is determined by their `departmentId`, not by a separate permission code. This avoids permission code explosion.

**Implementation pattern:**
- API layer reads `role` and `departmentId` from JWT
- Repository/query layer applies scope filter: Super Admin/System Admin → no filter; Dean → all departments; Dept Admin/User → `WHERE departmentId = ?`; Viewer → public-only filter

### Decision 3: Specs define "what," not "how"

**Choice:** The RBAC spec files define requirements (who can do what), not implementation (which middleware to use, how to structure code).

**Rationale:** Keeps specs stable even if implementation approach changes. Implementation patterns are documented here in design.md.

### Decision 4: System Admin differentiator is enforced as runtime checks, not schema-level

**Choice:** System Admin restrictions (cannot delete Super Admin, cannot change Super Admin role, cannot clear audit log) are enforced via runtime checks in API handlers, not via the permission matrix alone.

**Rationale:** These are not "missing permissions" — they are explicit deny rules that override the otherwise-full-access permission set. The permission matrix specifies what each role CAN do; runtime guards enforce what they CANNOT.

## Risks / Trade-offs

- **[Risk] Permission matrix drift**: If the spec and implementation diverge over time → **Mitigation**: Specs serve as source of truth; implementation PRs must reference spec requirements
- **[Risk] Performance impact of data scope filtering**: Query-level `WHERE departmentId = ?` on every request → **Mitigation**: Department ID is indexed; scope filter is applied as a base condition, not a post-query filter
- **[Trade-off] Duplication between specs**: `rbac-role-definitions` and `rbac-module-permissions` overlap in places → **Accepted**: Role definitions provide the summary view; module permissions provide the detail. Each serves a different audience.
