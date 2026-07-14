## 1. API — Rooms Endpoint

- [x] 1.1 Create `GET /api/book-meeting/rooms` route handler returning all active rooms from `MeetingRoom` table
- [x] 1.2 Compute room `status` from current bookings: check `roomId` + `confirmed` + `now` between `startTime`/`endTime` → "in-use", else "available"

## 2. API — Fix Bookings CRUD

- [x] 2.1 Fix `GET /api/book-meeting` response: map Prisma objects to flat `Booking` type (extract `date` from `startTime`, map `remark` → `purpose`/`notes`)
- [x] 2.2 Add `console.error` logging to all catch blocks in bookings route
- [x] 2.3 Update `POST /api/book-meeting` to accept `purpose` field and store as `remark`
- [x] 2.4 Add soft-delete filter (`status != "cancelled"`) to GET bookings query

## 3. Client — Fix Data Fetching & SWR

- [x] 3.1 Fix `apiBookings` unwrapping: remove `.data` access, use array directly
- [x] 3.2 Remove `MOCK_BOOKINGS` fallback; show empty state when no bookings
- [x] 3.3 Remove `MOCK_ROOMS` fallback; fetch rooms via `useSWR("/api/book-meeting/rooms")`
- [x] 3.4 Add `await` before `mutateBookings()` in `handleCreate`, `handleConfirm`, `handleCancel`

## 4. Client — Fix Booking Form

- [x] 4.1 Update `handleCreate` to send `purpose` and `notes` fields to API
- [x] 4.2 Fix `BookingModal` conflict check to use real bookings instead of mock data
- [x] 4.3 Update `handleCancel` to fix ownership check: use `userId` from session instead of `"me"` string comparison in `my-bookings` tab
- [x] 4.4 Gate confirm button: pass `canApprove` to `BookingsList`; only show confirm button in my-bookings tab if user has `BOOK_MEETING_APPROVE` permission; cancel button always shows for own bookings
- [x] 4.5 Booking approval workflow: bookings default to `"pending"`; show confirm button only when `status === "pending"`; Admin/Dean approval changes status to `"confirmed"` via PUT; all tabs update via `await mutateBookings()`

## 5. Verification

- [ ] 5.1 Verify rooms load from API and show correct status
- [ ] 5.2 Verify creating a booking succeeds and appears in all tabs
- [ ] 5.3 Verify confirming a pending booking moves it to confirmed
- [ ] 5.4 Verify cancelling a booking sets status to cancelled and removes from active tabs
- [ ] 5.5 Verify "my-bookings" tab shows only own bookings
- [ ] 5.6 Verify schedule tab updates after booking changes
