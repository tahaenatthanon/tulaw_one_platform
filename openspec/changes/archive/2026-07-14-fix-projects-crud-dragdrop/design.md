## Context

The Projects Kanban Board (`app/(dashboard)/projects/page.tsx`) is a client-side React component that fetches projects via SWR from `GET /api/projects` and writes changes via `fetchApi()` to `POST`, `PUT`, and `DELETE` endpoints. The API route handlers (`app/api/projects/route.ts`) use Prisma ORM against PostgreSQL.

Three bugs exist in the client-side API integration pattern:

1. **Drag-and-drop `unhandledRejection`**: `handleDragEnd` uses `fetchApi(...).finally(() => mutate())` without `.catch()`. When the API returns an error (e.g., DB error, permission denied), the rejected promise is never caught → browser-level `unhandledRejection` crash.

2. **Create project shows no feedback**: `handleCreate` uses `try { await fetchApi(...) } catch {}` which catches the error but the `catch` block is empty — no `mutate()`, no toast, nothing. If the API succeeds, `mutate()` runs. If it fails, it silently swallows.

3. **Approve/reject doesn't update**: `handleApprove` and `handleReject` have same pattern as create. In addition, `handleApprove` sends `description` as the approval reason in the body, but the API's `PUT /api/projects` writes `description` directly to the project's `description` field (not to a separate approval/rejection reason field), which is non-destructive but semantically wrong.

The API error handling in `PUT /api/projects` uses brittle string matching (`msg.includes("Record to update not found")`) instead of Prisma's error code system (`Prisma.PrismaClientKnownRequestError` with `code === "P2025"`).

## Goals / Non-Goals

**Goals:**
- Fix all three client-side API call patterns to always call `mutate()` after API completion (success or error)
- Eliminate `unhandledRejection` from `handleDragEnd`
- Add `console.error` logging to API catch blocks for easier debugging
- Use Prisma error codes instead of string matching in API route handlers

**Non-Goals:**
- No new DB schema changes
- No new UI components or visual changes
- No new permission/authorization rules
- No new API endpoints
- No changes to drag-and-drop library (`@dnd-kit`)
- No changes to SWR configuration

## Decisions

### Decision 1: Fix pattern — `try/catch` with `mutate()` outside both blocks

All four handlers (`handleDragEnd`, `handleCreate`, `handleApprove`, `handleReject`) follow the same broken pattern. The fix is uniform:

```typescript
// Before (broken)
fetchApi(...).finally(() => mutate());          // handleDragEnd — no catch
try { await fetchApi(...); } catch {}           // create/approve/reject — catch swallows error with no mutate
mutate();

// After (fixed)
try { await fetchApi(...); } catch {} mutate();
```

**Rationale**: `mutate()` should always revalidate SWR cache regardless of API outcome — the API response may be stale by the time SWR gets the data, or a partial update may have succeeded. The `catch {}` swallow is acceptable here because:
- The SWR cache still has the previous valid state
- Network errors are transient — next user action will retry
- We don't want to block the UI with error handling in a drag-drop context

**Alternative considered**: Showing toast errors on failure. Rejected because: (a) adds scope creep — needs a toast system that may not be built yet, (b) drag-drop errors are mostly recoverable by retrying.

### Decision 2: Prisma error code over string matching

```typescript
// Before
const msg = (e as Error)?.message ?? '';
if (msg.includes("Record to update not found")) ...

// After
import { Prisma } from "@prisma/client";
if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") ...
```

**Rationale**: Prisma error codes are stable across versions. String matching on English error messages is fragile across Prisma versions and locales.

### Decision 3: Add `console.error` to all API catch blocks

Every `catch` in `app/api/projects/route.ts` gets `console.error("[METHOD /api/projects]", e)`. This gives server-side visibility into failures without requiring a logging framework.

## Risks / Trade-offs

- **[Risk] Silently swallowing API errors** → The `catch {}` pattern means users won't see error feedback. **Mitigation**: The SWR cache preserves the last-known-good state, so the UI won't corrupt. For a future iteration, consider adding toast notifications.
- **[Risk] `handleApprove` sends description as approval reason** → This overwrites the project's description. **Mitigation**: Not addressed in this fix — tracked separately if needed. Current behavior is non-breaking for the approve flow.
