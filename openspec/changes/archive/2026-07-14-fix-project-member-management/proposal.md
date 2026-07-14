## Why

The Projects module's member management is non-functional: the create/edit form has free-text input for member names and roles that does not link to actual user records, and the API handlers (`POST`/`PUT /api/projects`) completely ignore members data. Users cannot add real colleagues to projects, making collaboration impossible.

## What Changes

- Add a lightweight `GET /api/users/search` endpoint for searching users by name or department (authenticated, no `USERS_VIEW` permission required)
- Replace free-text member input in the create/edit form with a searchable user dropdown that queries real users
- Update `POST /api/projects` to accept `memberIds` and create `ProjectMember` records
- Update `PUT /api/projects` to accept `memberIds` and sync `ProjectMember` records
- Update `Member` type to include `userId` so the kanban card can link to real users

## Capabilities

### New Capabilities
- `project-user-search`: Lightweight user search endpoint for project member selection — authenticated users search by name, returns id + name + department

### Modified Capabilities
<!-- No existing spec-level requirement changes -->

## Impact

- **Affected files**: `app/api/projects/route.ts` (POST/PUT handlers), `app/api/users/route.ts` (new search endpoint or separate), `app/(dashboard)/projects/page.tsx` (member picker UI)
- **No DB schema changes** — `ProjectMember` table already exists
- **No new dependencies**
- **No breaking changes** — backward compatible
