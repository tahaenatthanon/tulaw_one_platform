## Context

The Book Meeting page (`app/(dashboard)/book-meeting/page.tsx`, ~470 lines) has 5 tabs: rooms, schedule, my-bookings, pending, history. It uses `useSWR` for bookings but falls back to `MOCK_BOOKINGS`. Rooms are always `MOCK_ROOMS` — never fetched from the DB, making the entire module non-functional for real data.

Three critical bugs:

1. **Rooms are mock-only**: No API endpoint to fetch `MeetingRoom` records. The DB has the table but it's never queried.
2. **Bookings SWR unwrap + mock fallback**: Same pattern as previous modules — `apiAnnouncements?.data` returns `undefined` → always falls back to `MOCK_BOOKINGS`. The API actually returns data correctly.
3. **mutateBookings() not awaited**: After create/confirm/cancel, `mutateBookings()` runs fire-and-forget → UI doesn't update.

Additional issues:
- POST body doesn't send `purpose`/`notes` fields though the form collects them
- Booking types mismatch: frontend expects `date`, `startTime`, `endTime` as separate strings but DB stores combined `startTime`/`endTime` as DateTime
- Silent error handling in all catch blocks

## Goals / Non-Goals

**Goals:**
- Add `GET /api/book-meeting/rooms` endpoint
- Remove all mock data fallbacks; use real API data
- Fix SWR data unwrapping for bookings
- `await mutateBookings()` in all mutation handlers
- Fix POST to accept `purpose` and `notes`
- Fix GET response mapping to return flat objects matching frontend `Booking` type
- Add `console.error` logging to API catch blocks
- Update `RoomsTab` to show real room data with status from current bookings
- Gate confirm button in my-bookings tab by `BOOK_MEETING_APPROVE` permission; cancel button always available for own bookings

**Non-Goals:**
- No DB schema changes
- No new UI components
- No MS Teams integration changes
- No email notification on booking

## Decisions

### Decision 1: Separate `/api/book-meeting/rooms` endpoint

A dedicated `GET /api/book-meeting/rooms` that returns all active rooms with a computed `status` field based on current bookings.

```typescript
// Returns { id, name, capacity, location, status }
// status: "available" | "in-use" — derived from current bookings
```

**Rationale**: Keeps the bookings endpoint clean. Room data has different caching needs (rarely changes). The rooms list is small (university-scale: maybe 5-10 rooms).

### Decision 2: Fix booking response mapping

Map Prisma `RoomBooking` to flat `Booking` type matching frontend expectations:

```typescript
const mapped = data.map((b) => ({
  id: b.id,
  roomId: b.roomId,
  title: b.title,
  purpose: b.remark ?? "",      // remark → purpose
  date: b.startTime.toISOString().split("T")[0],  // extract date
  startTime: b.startTime.toISOString(),
  endTime: b.endTime.toISOString(),
  attendeeCount: b.attendeeCount ?? 0,
  msTeamsLink: b.msTeamsLink ?? "",
  notes: b.remark ?? "",
  status: b.status,
  userId: b.userId,
}));
```

### Decision 3: Room status derived from current bookings

For each room in GET /api/book-meeting/rooms, check if there's an active booking (`status: "confirmed"` and `startTime <= now < endTime`). This gives real-time "available" vs "in-use" status.

### Decision 4: Fix SWR + remove mocks

Same pattern as intranet and projects fixes:
```typescript
// Before
const { data: apiBookings } = useSWR("/api/book-meeting", swrFetcher);
const raw = (apiBookings as unknown as { data?: Booking[] })?.data;
const bookings = Array.isArray(raw) ? raw : MOCK_BOOKINGS;

// After
const { data: apiBookings } = useSWR("/api/book-meeting", swrFetcher);
const bookings: Booking[] = Array.isArray(apiBookings) ? apiBookings : [];
```

## Risks / Trade-offs

- **[Risk] Rooms DB table may be empty** → Seed script or admin UI needs to populate rooms. Add a seed file if needed.
- **[Risk] Room status query is per-request** → With <10 rooms and <50 bookings, this is negligible. Can add caching if needed.
- **[Risk] Empty state after mock removal** → Show "ไม่มีห้องประชุม" / "ไม่มีการจอง" empty states (already in template)

### Decision 5: Gate confirm button by approval permission

The confirm button in "my-bookings" tab calls `PUT /api/book-meeting` which requires `BOOK_MEETING_APPROVE`. Regular users pressing confirm get a silent 403. Fix: pass `canApprove` to `BookingsList`; show confirm button only when user has approval permission. Cancel button always shows for own bookings (`DELETE` has ownership check).

### Decision 6: Booking approval workflow (pending → confirmed)

New bookings default to `"pending"` status instead of `"confirmed"`. The form sends `status: "pending"` and `POST /api/book-meeting` accepts an optional `status` field (defaults to `"confirmed"` for backward compatibility). The approval workflow:

```
User → จองห้อง → POST (status: "pending")
  → "การจองของฉัน" tab: แสดง pending, ปุ่มยกเลิกอย่างเดียว
Admin/Dean → "รออนุมัติ" tab → กด "ยืนยัน"
  → PUT /api/book-meeting { status: "confirmed" }
  → await mutateBookings()
  → ทุก tab อัปเดต: schedule แสดง booking, history แสดงเมื่อ completed/cancelled
```

The confirm button only appears when `booking.status === "pending"` AND the user has `BOOK_MEETING_APPROVE` permission (or is viewing the pending tab which is already permission-gated).
