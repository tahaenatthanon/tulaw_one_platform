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
