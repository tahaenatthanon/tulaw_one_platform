## Why

The Book Meeting module is completely non-functional for real use: rooms are hardcoded mock data never fetched from the DB, bookings fall back to mock data when the API returns real results (SWR unwrap bug), `mutateBookings()` is not awaited causing stale UI after create/update/delete, and the booking form has a schema mismatch (sends `date` + times separately but DB stores `startTime`/`endTime` as DateTime). All 5 tabs share data but none of them refresh correctly after operations.

## What Changes

- Add `GET /api/book-meeting/rooms` endpoint to return real `MeetingRoom` records from the DB
- Fix SWR data unwrapping for bookings: remove `.data` access and `MOCK_BOOKINGS` fallback
- Add `await` before `mutateBookings()` in `handleCreate`, `handleConfirm`, `handleCancel`
- Fix `POST /api/book-meeting` to accept `purpose` and `notes` fields alongside existing `startTime`/`endTime`
- Fix `GET /api/book-meeting` response mapping to return flat booking objects matching frontend types
- Replace `MOCK_ROOMS` with SWR-fetched rooms from API; update `RoomsTab` to show real room status
- Update all 5 tabs to use consistently shaped data from API (rooms + bookings)
- Gate confirm button in "my-bookings" tab: only users with `BOOK_MEETING_APPROVE` permission can confirm bookings (API already enforces this)
- Implement proper approval workflow: user bookings default to `"pending"` status; visible in my-bookings with cancel only; Admin/Dean approves from pending tab → status changes to `"confirmed"` → reflected in schedule and history tabs
- Add `console.error` logging to all API catch blocks

## Capabilities

### New Capabilities
- `book-meeting-rooms-api`: GET endpoint to fetch meeting rooms with real-time availability status

### Modified Capabilities
<!-- No spec-level requirement changes -->

## Impact

- **Affected files**: `app/(dashboard)/book-meeting/page.tsx` (SWR, mutate, remove mocks), `app/api/book-meeting/route.ts` (POST fields, GET mapping, error logging), `app/api/book-meeting/rooms/route.ts` (new)
- **No DB schema changes** — `MeetingRoom` and `RoomBooking` models already exist
- **No new dependencies**
- **No breaking changes**
