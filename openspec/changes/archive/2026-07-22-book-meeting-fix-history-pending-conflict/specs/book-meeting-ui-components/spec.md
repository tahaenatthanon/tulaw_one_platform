## ADDED Requirements

### Requirement: Pending tab show new bookings immediately for approvers

The "รออนุมัติ" tab SHALL display newly created bookings with status `pending` immediately after the booking is successfully created, without requiring a page refresh.

#### Scenario: Approver sees new pending booking after creation

- **WHEN** a user with approval rights (`BOOK_MEETING_APPROVE` permission) views the "รออนุมัติ" tab
- **AND** another user creates a new booking with status `pending`
- **AND** the approver switches to or refreshes the "รออนุมัติ" tab
- **THEN** the newly created booking SHALL appear in the pending list
- **AND** SHALL display the booking title, room name, booker name, date, and time

#### Scenario: User sees only own pending bookings

- **WHEN** a user without approval rights (User role, level 30) views the "รออนุมัติ" tab
- **THEN** the list SHALL show only bookings where `userId` matches the current user's ID
- **AND** SHALL NOT show pending bookings from other users

#### Scenario: Pending tab refreshes after mutateBookings revalidation

- **WHEN** `mutateBookings()` is called after a successful POST to `/api/book-meeting`
- **THEN** the SWR cache SHALL be revalidated
- **AND** the "รออนุมัติ" tab SHALL reflect the latest bookings from the API

### Requirement: Conflict errors displayed inline in booking dialog

The Create/Edit Booking Dialog SHALL display time conflict errors from the API as inline error messages within the dialog, without automatically closing.

#### Scenario: API conflict error shows inline in dialog

- **WHEN** a user submits a booking with a time that overlaps an existing booking
- **AND** the API returns error code `CONFLICT` with message "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่"
- **THEN** the inline error message SHALL appear within the dialog showing the conflict message in red (`text-tu-error`)
- **AND** the dialog SHALL remain open so the user can adjust the time
- **AND** the submit button SHALL remain disabled until the conflict is resolved
- **AND** an `AlertTriangle` icon SHALL accompany the error message

#### Scenario: Client-side conflict check shows inline warning

- **WHEN** a user changes the room, date, start time, or end time in the dialog
- **AND** the local client-side check detects an overlap with existing bookings
- **THEN** the inline conflict warning SHALL display immediately (before submit)
- **AND** the warning SHALL show the same message: "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่"

#### Scenario: Non-conflict API errors show toast instead

- **WHEN** a user submits a booking and the API returns a non-conflict error (e.g., validation, unauthorized)
- **THEN** the error message SHALL appear as a toast notification (`toast.error`)
- **AND** the dialog SHALL remain open if the error is recoverable (e.g., validation)
