## ADDED Requirements

### Requirement: Pending tab scoped by user role

The system SHALL filter pending bookings based on the user's approval rights.

#### Scenario: Regular user sees only own pending bookings

- **WHEN** a user without `BOOK_MEETING_APPROVE` permission views the "รออนุมัติ" tab
- **THEN** the system SHALL display only pending bookings where `userId` matches the current user's ID
- **AND** SHALL NOT show approve/reject buttons

#### Scenario: Approver sees all pending bookings

- **WHEN** a user with `BOOK_MEETING_APPROVE` permission (Dept Admin+) views the "รออนุมัติ" tab
- **THEN** the system SHALL display all pending bookings regardless of `userId`
- **AND** SHALL show "ยืนยัน" and "ยกเลิก" buttons for each booking

### Requirement: Booker name displayed in pending list

The system SHALL display the name of the user who made each booking in the pending list.

#### Scenario: Booker name shown in pending

- **WHEN** a user views the "รออนุมัติ" tab
- **THEN** each booking entry SHALL display the booker's name (firstNameTh lastNameTh from the user relation)
- **AND** the name SHALL be shown alongside room name and time

### Requirement: Approval creates booking history

The system SHALL record a history entry when a booking is approved or rejected.

#### Scenario: Approve creates history entry

- **WHEN** an approver clicks "ยืนยัน" on a pending booking
- **THEN** the system SHALL create a history record with fields: bookingId, action ("approved"), previousStatus ("pending"), newStatus ("confirmed"), performedBy, timestamp
- **AND** the booking's status SHALL change to "confirmed"

#### Scenario: Reject creates history entry

- **WHEN** an approver clicks "ยกเลิก" on a pending booking
- **THEN** the system SHALL create a history record with fields: bookingId, action ("rejected"), previousStatus ("pending"), newStatus ("cancelled"), performedBy, timestamp
- **AND** the booking's status SHALL change to "cancelled"

#### Scenario: History appears in booking detail

- **WHEN** a user views a booking's detail sheet
- **THEN** the system SHALL display the approval history timeline showing each status change with who performed it and when
