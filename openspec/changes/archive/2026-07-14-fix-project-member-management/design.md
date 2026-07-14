## Context

The current project member management is broken at 3 levels:

1. **UI**: `ProjectFormModal` renders free-text `<input>` for "ชื่อ" and "บทบาท" — no connection to real users. The `Member` type is `{ name: string; role: string }` with no `userId`.
2. **Client-side**: `handleCreate` passes `members` in the body but `handleEdit` discards it (via destructured `progress` removal only).
3. **API**: `POST /api/projects` only extracts `{ name, type, description }` — completely ignores `members`. `PUT` ignores members.

The `ProjectMember` table already exists in the DB schema with `userId`, `projectId`, and `role` fields.

## Goals / Non-Goals

**Goals:**
- Add a searchable user picker in the create/edit project form that queries real users
- Add `GET /api/projects/users/search?q=` endpoint for lightweight user search
- Wire `POST /api/projects` to accept `memberIds: { userId: string; role: string }[]` and create `ProjectMember` records
- Wire `PUT /api/projects` to accept `memberIds` and sync members (delete removed, add new)
- Update `Member` type to `{ name: string; role: string; userId: string }`
- Display real member names on kanban cards

**Non-Goals:**
- No bulk member import
- No member permission management
- No member notification emails
- No changes to the `GET /api/projects` response structure (members already returned via `include`)

## Decisions

### Decision 1: Dedicated search endpoint over modifying existing `/api/users`

A new `GET /api/projects/users/search?q=` endpoint that searches `firstNameTh`, `lastNameTh`, and `email` and returns `{ id, firstNameTh, lastNameTh, email, departmentName }`.

**Rationale**: The existing `GET /api/users` requires `USERS_VIEW` permission and returns full user details including roles, etc. A lightweight search endpoint scoped to the projects module avoids permission escalation and returns only the fields needed for member selection.

**Alternative**: Adding `?compact=true` to existing `/api/users`. Rejected because permission check (`USERS_VIEW`) would block regular users from adding members.

### Decision 2: Sync-based member update (replace all) over incremental add/remove

`PUT /api/projects` accepts the full member list and syncs: deletes members not in the new list, adds members not in the existing list. No change to members that appear in both.

**Rationale**: Simpler client-server contract — the form always sends the full member list. Avoids complex add/remove tracking on the client.

### Decision 3: User picker — dropdown with search, not modal

A combobox-style dropdown rendered inline in the form, with search-as-you-type filtering against the API. Selecting a user adds them to the member list; each member row shows name + department + a role input + remove button.

**Rationale**: Keeps the form simple and scannable. A full modal user picker would add unnecessary complexity for what is essentially a search-and-select operation.

## Risks / Trade-offs

- **[Risk] User search returns too many results** → Limit to 10 results, debounce input by 300ms
- **[Risk] Sync deletes all members if empty array sent** → This is intended behavior; clearing all members is a valid action
- **[Risk] Duplicate member entries** → Deduplicate by `userId` on both client and server
