## Purpose

The Book Meeting UI Components provide a complete user interface for managing meeting room bookings, including room cards with visual status, a schedule table grid, search and filter controls, upcoming booking lists, booking detail sheets, and a create/edit dialog for submitting and modifying bookings.
## Requirements
### Requirement: Room Cards with Visual Status

The system SHALL display meeting rooms as visually appealing cards showing room image, status badge, capacity, next booking time, and equipment tags.

#### Scenario: Display available rooms

- **WHEN** a user visits the "รายการห้อง" tab
- **AND** rooms data is loaded from `/api/book-meeting/rooms`
- **THEN** the system SHALL render each room as a `RoomCard` with gradient banner, status badge (ว่าง/กำลังใช้งาน/ถูกจองแล้ว), floor name, capacity, next booking time, and equipment tags
- **AND** each card SHALL have a "จองห้องประชุม" button that opens the create booking dialog

#### Scenario: Room status colors

- **WHEN** a room is `available` (ว่าง)
- **THEN** the status badge SHALL show green background with "ว่าง" label and the booking button SHALL be enabled
- **WHEN** a room is `in-use` or `booked`
- **THEN** the button SHALL show "ไม่พร้อมให้จอง" and be disabled

### Requirement: Schedule Table with Date Picker

The system SHALL display a grid table schedule — rooms as rows, time slots (08:00-18:00 half-hourly) as columns — with bookings shown as colored blocks. Date is selectable via left/right navigation.

#### Scenario: Display schedule grid

- **WHEN** a user selects the "ตารางเวลา" tab
- **THEN** the system SHALL render a grid table with rooms as rows and half-hourly time slots (08:00-18:00) as columns
- **AND** the last time slot SHALL be 17:30–18:00
- **AND** show a date picker header with left/right navigation and Thai date label

#### Scenario: Navigate dates

- **WHEN** a user clicks the left/right arrow buttons
- **THEN** the system SHALL navigate to the previous/next day
- **AND** display the date in Thai format (e.g., "วันจันทร์ที่ 21 กรกฎาคม 2569")

#### Scenario: Booking blocks in cells

- **WHEN** bookings exist for the selected date and room
- **THEN** the system SHALL display a colored block (`bg-tu-primary`) with the booking title in the start time cell
- **AND** the block SHALL be clickable to open booking details

#### Scenario: Empty schedule

- **WHEN** no bookings exist for the selected date
- **THEN** the grid SHALL still render with empty cells

### Requirement: Search and Filter Bar

The system SHALL provide a search input and filter dropdowns for filtering room listings.

#### Scenario: Filter rooms by building

- **WHEN** a user selects a building from the "อาคาร" dropdown
- **THEN** the room list SHALL show only rooms in that building

#### Scenario: Filter rooms by capacity

- **WHEN** a user selects a capacity range (e.g., "11 – 30 คน")
- **THEN** the room list SHALL show only rooms within that capacity range

#### Scenario: Search rooms by keyword

- **WHEN** a user types in the search input
- **THEN** the room list SHALL filter by room name, building, or equipment matching the keyword

### Requirement: Upcoming Bookings Sidebar

The system SHALL display a list of upcoming bookings sorted by date/time in a sidebar card.

#### Scenario: View upcoming bookings

- **WHEN** a user views the Schedule tab
- **THEN** the system SHALL display an "Upcoming Bookings" card beside the calendar
- **AND** bookings SHALL be sorted by date + start time ascending
- **AND** each item SHALL show title, room name, organizer, status badge, date and time

#### Scenario: Click upcoming booking

- **WHEN** a user clicks an upcoming booking item
- **THEN** the booking SHALL be highlighted as selected
- **AND** the calendar SHALL navigate to that booking's date

### Requirement: Booking Detail Sheet

The system SHALL display booking details in a slide-out sheet when a booking is selected.

#### Scenario: Open booking detail

- **WHEN** a user clicks a booking in the timeline or upcoming list
- **THEN** the system SHALL open a Sheet showing the booking details: title, date, time range, room, organizer, participants, equipment, notes

### Requirement: Create Booking Dialog

The system SHALL provide a dialog form for creating new meeting room bookings.

#### Scenario: Open create dialog from room card

- **WHEN** a user clicks "จองห้องประชุม" on a room card
- **THEN** the system SHALL open a Dialog with the room pre-selected in the dropdown

#### Scenario: Fill booking form

- **WHEN** the dialog is open
- **THEN** the form SHALL include: title, room dropdown, organizer, date picker, start/end time pickers, participants, equipment checkboxes, notes textarea

#### Scenario: Submit booking

- **WHEN** the user fills all required fields and clicks "บันทึกการจอง"
- **THEN** the system SHALL POST to `/api/book-meeting` and close the dialog

### Requirement: Statistics Cards

The system SHALL display 4 statistics at the top of the page summarizing room availability.

#### Scenario: Display statistics

- **WHEN** the page loads
- **THEN** the system SHALL display: total rooms count, available rooms today, bookings today, bookings this week
- **AND** each stat SHALL show an icon, value, label, optional trend percentage, and sub-label

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

