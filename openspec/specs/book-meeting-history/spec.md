## Purpose

The Book Meeting History module provides users with a personal archive of past meeting room bookings, scoped by role-based access control. Regular users see only their own booking history, while administrators can view all past bookings across the organization.
## Requirements
### Requirement: History tab shows bookings scoped by user role

The Book Meeting history tab SHALL display past bookings filtered by the current user's role and data scope.

#### Scenario: User role sees only own history

- **WHEN** a user with User role (level 30) navigates to the "ประวัติ" tab
- **THEN** the system SHALL display only bookings where `userId` matches the current user's ID
- **AND** SHALL include bookings with status `confirmed` (where `endTime` is in the past), `completed`, and `cancelled`
- **AND** SHALL NOT display any action buttons (view only)

#### Scenario: Admin role sees all history (read-only)

- **WHEN** a user with System Admin or Super Admin role navigates to the "ประวัติ" tab
- **THEN** the system SHALL display all past bookings regardless of `userId`
- **AND** SHALL include bookings with status `confirmed` (where `endTime` is in the past), `completed`, and `cancelled`
- **AND** SHALL NOT display any action buttons (read-only)

#### Scenario: Dean role sees all history (read-only)

- **WHEN** a user with Dean role (level 70) navigates to the "ประวัติ" tab
- **THEN** the system SHALL display all past bookings regardless of `userId`
- **AND** SHALL NOT display any action buttons (read-only)

#### Scenario: Dept Admin role sees all history (read-only)

- **WHEN** a user with Dept Admin role (level 50) navigates to the "ประวัติ" tab
- **THEN** the system SHALL display all past bookings regardless of `userId`
- **AND** SHALL NOT display any action buttons (read-only)

### Requirement: History tab includes past confirmed bookings

The history tab SHALL include bookings with `confirmed` status whose `endTime` has passed, in addition to `completed` and `cancelled` bookings.

#### Scenario: Confirmed booking appears in history after end time passes

- **WHEN** a confirmed booking's `endTime` is earlier than the current time
- **AND** the user navigates to the "ประวัติ" tab
- **THEN** the system SHALL include that booking in the history list
- **AND** SHALL display the booking status label as "ยืนยัน" (confirmed)

#### Scenario: Future confirmed booking does NOT appear in history

- **WHEN** a confirmed booking's `endTime` is still in the future
- **THEN** the system SHALL NOT include that booking in the history tab
- **AND** the booking SHALL remain visible only in "การจองของฉัน" and "ตารางเวลา" tabs

### Requirement: History tab is sorted by date descending

The history tab SHALL display bookings sorted by date from newest to oldest.

#### Scenario: History shows newest bookings first

- **WHEN** a user navigates to the "ประวัติ" tab
- **THEN** the system SHALL sort bookings by `date` (descending) and `startTime` (descending)
- **AND** the most recent past booking SHALL appear at the top of the list

### Requirement: History tab shows booking status labels

The history tab SHALL display a status badge for each booking entry.

#### Scenario: Status labels displayed in history

- **WHEN** a user views the "ประวัติ" tab
- **THEN** each booking entry SHALL display its current status label using the standard `BOOKING_STATUS` mapping
- **AND** `confirmed` entries SHALL show "ยืนยัน" with success color
- **AND** `cancelled` entries SHALL show "ยกเลิก" with muted color
- **AND** `completed` entries SHALL show "เสร็จสิ้น" with info color

### Requirement: Client-side history filter scopes by user role

The client-side `HistoryTable` component SHALL filter history tab results by the current user's ID for roles below Admin level, mirroring the scoping rules defined in the server-side spec.

#### Scenario: User role sees only own history in client

- **WHEN** a user with User role (level 30) navigates to the "ประวัติ" tab
- **THEN** the `HistoryTable` component SHALL filter bookings to only those where `userId` matches the session user's ID
- **AND** SHALL include bookings with status `completed`, `cancelled`, and `confirmed` (where `endTime` is in the past)

#### Scenario: Admin role sees all history in client

- **WHEN** a user with System Admin or Super Admin role (level ≥ 80) navigates to the "ประวัติ" tab
- **THEN** the `HistoryTable` component SHALL display all past bookings regardless of `userId`
- **AND** SHALL NOT apply any userId filter

#### Scenario: Dept Admin and Dean roles see all history in client

- **WHEN** a user with Dean (level 70) or Dept Admin (level 50) role navigates to the "ประวัติ" tab
- **THEN** the `HistoryTable` component SHALL display all past bookings regardless of `userId`
- **AND** SHALL NOT apply any userId filter

#### Scenario: Cancelled bookings appear in history

- **WHEN** a user views the "ประวัติ" tab
- **THEN** the `HistoryTable` component SHALL include bookings with status `cancelled`
- **AND** SHALL display the status label as "ยกเลิก" with muted color

### Requirement: History tab displays as a table view

The "ประวัติ" (History) tab SHALL display past bookings as a structured HTML table with the following columns, sorted by date and time in descending order (newest first).

#### Scenario: History table renders with all required columns

- **WHEN** a user navigates to the "ประวัติ" tab
- **THEN** the system SHALL render a `<table>` with columns: วัน/เวลา (timestamp), หัวข้อ, ห้อง, จำนวน, รายละเอียด, ช่วงเวลา, ผู้จอง
- **AND** each row SHALL display: the booking date/time in Thai format, booking title, room name, attendee count with "คน" suffix, purpose/notes (truncated if long), time range (HH:MM – HH:MM), and booker name
- **AND** rows SHALL be sorted by `date` descending then `startTime` descending (newest first)

#### Scenario: History table shows status badge

- **WHEN** a user views the "ประวัติ" tab
- **THEN** each row SHALL display a status badge using `BOOKING_STATUS` mapping
- **AND** `confirmed` SHALL show "ยืนยัน" with success color
- **AND** `cancelled` SHALL show "ยกเลิก" with muted color
- **AND** `completed` SHALL show "เสร็จสิ้น" with info color

#### Scenario: History table shows empty state

- **WHEN** no history bookings exist for the current user
- **THEN** the system SHALL display "ไม่พบประวัติการจอง" as an empty state message
- **AND** the table structure SHALL still render with column headers visible

#### Scenario: History table is responsive

- **WHEN** a user views the "ประวัติ" tab on a mobile or tablet device
- **THEN** the table SHALL be horizontally scrollable via `overflow-x-auto`
- **AND** no columns SHALL be hidden or removed

### Requirement: Booking history tracks status changes

The system SHALL record every status change (approve, reject, cancel) in the booking history with who performed it and when.

#### Scenario: Status change recorded in history

- **WHEN** a booking's status changes from "pending" → "confirmed" or "pending" → "cancelled"
- **THEN** the system SHALL store a record in the `BookingHistory` table or embed a `statusLog` JSON array with: action, previousStatus, newStatus, performedBy, performedAt
- **AND** the history SHALL be displayed in the booking detail sheet as a timeline

#### Scenario: History visible in booking detail

- **WHEN** a user opens the BookingDetailSheet for any booking
- **THEN** the system SHALL display the full status change timeline
- **AND** each entry SHALL show: action label (ยืนยัน/ยกเลิก/แก้ไข), performer name, and timestamp

