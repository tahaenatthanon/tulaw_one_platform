## Why

The platform needs a single source of truth for Role-Based Access Control (RBAC) that precisely defines what each of the 6 roles can and cannot do across all 9 modules. Currently, RBAC rules are scattered across `claude.md`, middleware, and individual components with no formal specification — leading to inconsistencies in implementation and gaps in access control enforcement.

## What Changes

- Formalize the complete 6-role hierarchy: Super Admin (100), System Admin (80), Dean (70), Department Admin (50), User (30), Viewer (10)
- Define **Data Scope** rules — which data each role can see (all departments, own department only, self only, public only)
- Specify **Module-level permissions** for all 9 modules: Dashboard, Application Hub, Intranet, Book Meeting, Documents, Projects, Users & Roles, Audit Log, System Configuration
- Define detailed **CRUD + Special Actions** (Approve, Reject, Publish, Subscribe, Pin, Export, etc.) per role per module
- Document the **differentiator rules** between similar roles (e.g., Super Admin vs System Admin, Dean vs Dept Admin)

## Capabilities

### New Capabilities

- `rbac-role-definitions`: Role hierarchy (6 roles with numeric levels), data scope boundaries, and summary access matrix across all modules
- `rbac-module-permissions`: Detailed per-module CRUD + special action permissions for all 6 roles across all 9 modules, including fine-grained rules (e.g., which pools a role can access in Documents, which projects a role can approve)

### Modified Capabilities

_None._ This change is purely additive — it formalizes existing implied RBAC rules without changing the permission codes already referenced by existing specs (`PROJECTS_VIEW`, `BOOK_MEETING_VIEW`, `DOCUMENTS_VIEW`).

## Impact

- **Specs**: Creates 2 new spec files under `openspec/specs/rbac-role-definitions/` and `openspec/specs/rbac-module-permissions/`
- **Source of truth**: `claude.md` sections 11.2-11.7 will reference these specs as the authoritative source
- **Implementation**: All permission checks, middleware, API guards, and UI visibility controls must align with the defined matrix
- **Existing specs**: No requirement changes — existing specs continue using the same permission codes
