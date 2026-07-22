## ADDED Requirements

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
