## Why

The Intranet module has 4 critical bugs that make key features non-functional: creating announcements shows no feedback (SWR cache not refreshed), subscription state is not persisted (local-only), all users can see edit/delete buttons on others' announcements (frontend doesn't enforce ownership), and the calendar cannot navigate months (navigation buttons have no handlers).

## What Changes

- Fix announcement create/edit/delete handlers: add `await` before `onMutate()` to ensure SWR cache is refreshed before re-render; remove `MOCK_ANNOUNCEMENTS` fallback causing wrong data
- Wire subscription API: load subscriptions on mount via `GET /api/intranet/subscriptions`, toggle via `POST /api/intranet/subscriptions` on click
- Create notification when announcement is published: when a user creates an announcement in a category, create `Notification` + `NotificationRead` records for all users subscribed to that category
- Enforce ownership visibility on frontend: only show edit/delete buttons when `publisherUserId` matches current user (backend already enforces this)
- Add month navigation to calendar: replace module-scope `const` with `useState` for current month/year, wire ChevronLeft/ChevronRight onClick handlers
- Replace native `confirm()` with `ConfirmDialog` in delete flow
- Add `console.error` logging to announce API catch blocks for debugging

## Capabilities

### New Capabilities
- `subscription-notification`: When an announcement is published, subscribers to its category receive notifications in the Notification system

### Modified Capabilities
<!-- No spec-level requirement changes -->
- *(none)*

## Impact

- **Affected files**: `app/(dashboard)/intranet/page.tsx` (handlers, subscribe, calendar), `app/api/announcements/route.ts` (error logging)
- **No DB schema changes**, no new dependencies
- **No breaking changes**
