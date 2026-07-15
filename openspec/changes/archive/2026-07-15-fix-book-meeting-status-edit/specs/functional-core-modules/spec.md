## MODIFIED Requirements

### Requirement: Book Meeting fetches real rooms and bookings

The Book Meeting page SHALL fetch meeting rooms and bookings from `GET /api/book-meeting` instead of `MOCK_ROOMS`/`MOCK_BOOKINGS`.

#### Scenario: Book Meeting loads rooms

- **WHEN** a user navigates to Book Meeting
- **THEN** the system SHALL fetch rooms from the API and display them with real-time availability

#### Scenario: Room list shows real-time 3-level status

- **WHEN** a user navigates to the "รายการห้อง" tab
- **THEN** the system SHALL display all meeting rooms with one of three statuses: "ว่าง" (available, green), "กำลังใช้งาน" (in-use, yellow), or "ถูกจองแล้ว" (booked, red)
- **AND** SHALL determine "in-use" when the room has a confirmed or pending booking where `startTime <= now < endTime`
- **AND** SHALL determine "booked" when the room has any upcoming confirmed or pending booking (`startTime > now`, `endTime > now`)
- **AND** SHALL determine "available" when no future or active bookings exist for the room
- **AND** SHALL refresh room status automatically every 10 seconds via SWR polling
- **AND** SHALL immediately refresh room status after any mutation (create, confirm, cancel, edit) via `mutateRooms()`

#### Scenario: Creating a booking

- **WHEN** a user submits a new booking
- **THEN** the system SHALL POST to `/api/book-meeting` and refresh the booking list

#### Scenario: Double-booking is prevented

- **WHEN** a user attempts to book an occupied time slot
- **THEN** the system SHALL display a conflict error from the API

#### Scenario: Double-booking is prevented with real-time client-side check

- **WHEN** a user selects a room, date, and time range in the booking form
- **THEN** the system SHALL check for conflicts in real-time by converting both the stored booking times (ISO datetime) and the selected times (`"HH:mm"`) to minutes before comparison
- **AND** if a conflict is found, SHALL display an inline error message "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่" and disable the "จองห้อง" submit button
- **AND** the server SHALL perform an additional conflict check before creating the booking and return a `CONFLICT` error if the slot is taken

#### Scenario: Pending tab visible to all users

- **WHEN** a user navigates to the "รออนุมัติ" tab
- **THEN** the system SHALL display pending bookings without requiring `BOOK_MEETING_APPROVE` permission
- **AND** for users WITH `BOOK_MEETING_APPROVE`, the tab SHALL show ALL pending bookings with confirm and cancel buttons
- **AND** for users WITHOUT `BOOK_MEETING_APPROVE`, the tab SHALL show only the current user's own pending bookings with NO action buttons

#### Scenario: Approver confirms pending booking from pending tab only

- **WHEN** a user with `BOOK_MEETING_APPROVE` clicks "ยืนยัน" on a pending booking in the "รออนุมัติ" tab
- **THEN** the system SHALL update the booking status to "confirmed"
- **AND** SHALL refresh all tabs so the booking moves from "รออนุมัติ" to "confirmed" in every view (including schedule/timetable grid)
- **AND** SHALL send a notification to the booking owner informing them of the approval
- **AND** the "การจองของฉัน" tab SHALL NOT display a confirm button — only edit and cancel buttons

#### Scenario: Booking status updates immediately in UI when confirmed

- **WHEN** a user with `BOOK_MEETING_APPROVE` clicks "ยืนยัน"
- **THEN** the system SHALL apply an optimistic update to the SWR cache so the booking status shows "confirmed" immediately without waiting for server response
- **AND** SHALL send the PUT request to update status in the database
- **AND** SHALL force revalidate the SWR cache after PUT completes to ensure data consistency with the server
- **AND** SHALL also refresh room status cache (`mutateRooms`) so the RoomsTab reflects the change

#### Scenario: User edits own booking details

- **WHEN** a user clicks "แก้ไข" on their own booking in the "การจองของฉัน" tab
- **THEN** the system SHALL open an edit form pre-filled with the booking's current data (title, date, time, attendees, purpose, notes)
- **AND** SHALL allow the user to modify any field
- **AND** SHALL re-check for time conflicts when the user changes date, time, or room
- **AND** SHALL disable the save button if a conflict is detected

#### Scenario: Editing time/date resets booking to pending

- **WHEN** a user edits a confirmed booking's `startTime`, `endTime`, `roomId`, or `date`
- **THEN** the system SHALL automatically set the booking status to "pending"
- **AND** SHALL require admin re-approval before the booking appears in the schedule again

#### Scenario: Editing non-critical fields does not change status

- **WHEN** a user edits only `title`, `attendeeCount`, or `purpose`/`notes` of a confirmed booking
- **THEN** the system SHALL keep the booking status as "confirmed"
- **AND** the updated details SHALL appear in all tabs immediately

#### Scenario: Schedule displays confirmed bookings with correct time conversion

- **WHEN** the schedule tab renders bookings for a selected date
- **THEN** the system SHALL convert each booking's `startTime` and `endTime` from ISO datetime to local time (using `new Date(iso).getHours()` / `.getMinutes()`) before comparing with time slot strings
- **AND** SHALL filter bookings to only those matching the selected date (`b.date === selectedDateStr`) and with `status === "confirmed"`
- **AND** SHALL NOT display pending bookings in the schedule grid

#### Scenario: Schedule updates in real-time when booking is approved

- **WHEN** a user with `BOOK_MEETING_APPROVE` confirms a pending booking
- **AND** the `mutateBookings()` call completes after PUT
- **THEN** the "ตารางเวลา" tab SHALL immediately refresh to show the newly confirmed booking without requiring a page reload
- **AND** the booking SHALL appear in the correct time slot for the booked room in the schedule grid
- **AND** the schedule SHALL be visible to ALL authenticated roles

#### Scenario: Confirmed booking visible in schedule for all roles

- **WHEN** a booking is confirmed (status = "confirmed")
- **THEN** the system SHALL display the booking in the "ตารางเวลา" tab for ALL authenticated roles (Super Admin, System Admin, Dean, Dept Admin, User, Viewer)
- **AND** the booking SHALL appear in its correct time slot for the booked room

#### Scenario: History tab shows past approved bookings with role-based scoping

- **WHEN** a user navigates to the "ประวัติ" tab
- **THEN** the system SHALL display past bookings that were approved (`confirmed` with `endTime < now`, `completed`) only
- **AND** SHALL NOT display cancelled bookings in the history tab
- **AND** for User role, SHALL show only the current user's own bookings with NO action buttons
- **AND** for Admin/Dean/Dept Admin roles, SHALL show all users' bookings with NO action buttons (read-only)
- **AND** SHALL sort entries by date descending (newest first)
- **AND** SHALL display status labels for each booking entry

#### Scenario: Cancel booking requires confirmation

- **WHEN** a user clicks the "ยกเลิก" button on any booking
- **THEN** the system SHALL display a confirmation dialog with the message "คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?"
- **AND** SHALL show a danger-styled "ยกเลิกการจอง" button and a "ยกเลิก" (cancel/close) button
- **WHEN** the user confirms by clicking "ยกเลิกการจอง"
- **THEN** the system SHALL send the cancel request to the API and refresh all views
- **WHEN** the user dismisses the dialog by clicking "ยกเลิก" (close)
- **THEN** the system SHALL NOT send any cancel request

#### Scenario: Full booking workflow is end-to-end functional

- **WHEN** a user with `BOOK_MEETING_CREATE` creates a booking
- **THEN** the booking SHALL appear in "การจองของฉัน" tab with status "รออนุมัติ"
- **AND** SHALL appear in "รออนุมัติ" tab for the user (view only) and for approvers (with action buttons)
- **WHEN** an approver confirms the booking
- **THEN** the booking SHALL move to "confirmed" status
- **AND** the "ตารางเวลา" tab SHALL refresh immediately via SWR revalidation to display the confirmed booking in its correct time slot
- **AND** SHALL appear in "ตารางเวลา" tab for all roles without page reload
- **AND** SHALL appear in "การจองของฉัน" tab with status "ยืนยัน"
- **AND** after the booking's `endTime` passes, SHALL appear in "ประวัติ" tab
