## 1. Announcements — Fix create/edit persistence

- [x] 1.1 Wire Intranet CreateModal to call `POST /api/announcements` instead of local state
- [x] 1.2 Wire EditModal to call `PUT /api/announcements` and mutate SWR data
- [x] 1.3 Add SWR mutate to refresh announcement list after create/edit/delete

## 2. Book Meeting — Fix functionality

- [x] 2.1 Fix SWR data unwrapping — handle API response `{ data: [...] }` wrapper
- [x] 2.2 Wire create booking to `POST /api/book-meeting` with proper fields
- [x] 2.3 Wire confirm/cancel to `PUT/DELETE /api/book-meeting`
- [x] 2.4 Add null guards for rooms/bookings arrays in all tab components

## 3. Documents — Fix upload and delete restrictions

- [x] 3.1 Wire upload to real API `POST /api/documents` with file upload
- [x] 3.2 Restrict User delete to personal pool only — document hook checks `DOCUMENTS_DELETE` + pool ownership
- [x] 3.3 Add SWR mutate after upload/delete

## 4. Projects — Fix drag-drop and add delete

- [x] 4.1 Fix drag-drop to persist via `PUT /api/projects` with status change
- [x] 4.2 Auto-set progress to 100% when dropped on Completed column
- [x] 4.3 Add delete button for Admin/Dean/DeptAdmin on project cards
- [x] 4.4 Add `DELETE /api/projects` handler with soft-delete
- [x] 4.5 Add SWR mutate after all project mutations

## 5. System Config — Make settings actually save

- [x] 5.1 Wire settings save to `PUT /api/settings` per module
- [x] 5.2 Load settings from `GET /api/settings` on page mount

## 6. State persistence — All modules

- [x] 6.1 Ensure every CRUD operation calls `mutate()` to refresh SWR cache
- [x] 6.2 Verify URL state sync preserves tab/filter/search across navigation
