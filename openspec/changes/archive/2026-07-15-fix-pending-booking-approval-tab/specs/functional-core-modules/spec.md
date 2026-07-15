## MODIFIED Requirements

### Requirement: Book Meeting fetches real rooms and bookings

The Book Meeting page SHALL fetch meeting rooms and bookings from `GET /api/book-meeting` instead of `MOCK_ROOMS`/`MOCK_BOOKINGS`.

#### Scenario: Book Meeting loads rooms

- **WHEN** a user navigates to Book Meeting
- **THEN** the system SHALL fetch rooms from the API and display them with real-time availability

#### Scenario: Creating a booking

- **WHEN** a user submits a new booking
- **THEN** the system SHALL POST to `/api/book-meeting` and refresh the booking list

#### Scenario: Double-booking is prevented

- **WHEN** a user attempts to book an occupied time slot
- **THEN** the system SHALL display a conflict error from the API

#### Scenario: Pending tab visible to all users

- **WHEN** a user navigates to the "รออนุมัติ" tab
- **THEN** the system SHALL display pending bookings without requiring `BOOK_MEETING_APPROVE` permission
- **AND** for users WITH `BOOK_MEETING_APPROVE`, the tab SHALL show ALL pending bookings with confirm and cancel buttons
- **AND** for users WITHOUT `BOOK_MEETING_APPROVE`, the tab SHALL show only the current user's own pending bookings with NO action buttons

#### Scenario: Approver confirms pending booking

- **WHEN** a user with `BOOK_MEETING_APPROVE` clicks "ยืนยัน" on a pending booking in any tab
- **THEN** the system SHALL update the booking status to "confirmed"
- **AND** SHALL refresh all tabs so the booking moves from "รออนุมัติ" to "confirmed" in every view (including schedule/timetable grid)
- **AND** SHALL send a notification to the booking owner informing them of the approval
