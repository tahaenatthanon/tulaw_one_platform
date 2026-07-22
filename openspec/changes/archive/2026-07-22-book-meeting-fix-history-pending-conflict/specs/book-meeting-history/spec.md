## ADDED Requirements

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
