## Why

Multiple modules have broken CRUD operations — announcements disappear on refresh, Book Meeting doesn't work, Documents upload is non-functional, Projects drag-and-drop is broken, and Settings doesn't persist. This fix makes all modules truly functional end-to-end.

## What Changes

- **Announcements**: Wire create/edit to real API with SWR mutate
- **Book Meeting**: Fix SWR data extraction and wire create/confirm/cancel
- **Documents**: Real upload via API, restrict User delete to personal pool only
- **Projects**: Fix drag-drop persistence, auto-100% on complete column, add delete with role guard
- **System Config**: Wire save to `/api/settings`
- **All modules**: Add `mutate()` after every CRUD for real-time state sync

## Capabilities

### New Capabilities
- `fix-crud-all-modules`: Fix broken CRUD across announcements, book meeting, documents, projects, settings

### Modified Capabilities
_None._

## Impact

- **Pages**: Intranet, BookMeeting, Documents, Projects, Settings
- **APIs**: Announcements POST/PUT, Documents POST, Projects PUT/DELETE, Settings PUT
- **No breaking changes** — all fixes are additive
