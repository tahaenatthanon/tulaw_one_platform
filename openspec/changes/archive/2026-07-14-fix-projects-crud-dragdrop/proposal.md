## Why

The Projects Kanban Board implementation has critical bugs in its client-side API integration: drag-and-drop between columns causes `unhandledRejection` errors, creating a project shows no visual feedback, and approve/reject actions silently fail. These bugs render the core Kanban workflow unusable for all authenticated users.

## What Changes

- Fix drag-and-drop: wrap `fetchApi` calls in `handleDragEnd` with proper `try/catch` to prevent unhandled rejections, and ensure `mutate()` always runs after the API call (success or failure)
- Fix create project: ensure `mutate()` revalidates the SWR cache after `POST /api/projects` regardless of success/failure
- Fix approve/reject: ensure `handleApprove` and `handleReject` call `mutate()` after API call in both success and error paths
- Improve API error handling: use `Prisma.PrismaClientKnownRequestError` code `P2025` instead of fragile string matching for "record not found"; add `console.error` logging to all catch blocks for easier debugging
- **(No new specs needed)** — existing specs at `functional-core-modules` and `rbac-module-permissions` already define the correct behavior

## Capabilities

### New Capabilities
<!-- No new capabilities — this is a bug fix against existing specs -->

### Modified Capabilities
<!-- No spec-level requirement changes — only implementation fixes -->
- *(none)*

## Impact

- **Affected files**: `app/(dashboard)/projects/page.tsx` (client-side handlers), `app/api/projects/route.ts` (PUT/DELETE/POST handlers)
- **No DB schema changes**, no new dependencies
- **No breaking changes** — all fixes are backward-compatible
