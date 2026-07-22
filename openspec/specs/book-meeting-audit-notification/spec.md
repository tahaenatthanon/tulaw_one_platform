# book-meeting-audit-notification Specification

## Purpose
TBD - created by archiving change book-meeting-enhancements. Update Purpose after archive.
## Requirements
### Requirement: Audit log for booking actions

The system SHALL create immutable audit log entries for all booking lifecycle actions.

#### Scenario: Audit log on booking creation

- **WHEN** a user creates a new booking via POST `/api/book-meeting`
- **THEN** the system SHALL create an AuditLog entry with module "BOOK_MEETING", action "CREATE", entityType "RoomBooking", entityId = booking.id, and userId = session user

#### Scenario: Audit log on booking edit

- **WHEN** a user edits a booking via PUT `/api/book-meeting`
- **THEN** the system SHALL create an AuditLog entry with action "UPDATE", oldValue = previous state, newValue = updated state

#### Scenario: Audit log on booking cancel

- **WHEN** a user cancels a booking via PUT `/api/book-meeting` with status "cancelled"
- **THEN** the system SHALL create an AuditLog entry with action "CANCEL"

#### Scenario: Audit log on approve

- **WHEN** an approver approves a booking
- **THEN** the system SHALL create an AuditLog entry with action "APPROVE", entityId = booking.id

#### Scenario: Audit log on reject

- **WHEN** an approver rejects a booking
- **THEN** the system SHALL create an AuditLog entry with action "REJECT", entityId = booking.id

#### Scenario: Audit log failure does not block operation

- **WHEN** audit log creation fails
- **THEN** the booking operation SHALL still complete successfully
- **AND** the error SHALL be logged to console only

### Requirement: Notification on approve and reject

The system SHALL send in-app notifications when a booking is approved or rejected.

#### Scenario: Notification on approve

- **WHEN** an approver approves a pending booking
- **THEN** the system SHALL create a Notification with title "การจองห้องประชุมได้รับการอนุมัติ" and message containing the booking title
- **AND** SHALL create a NotificationRead entry for the booking's user

#### Scenario: Notification on reject

- **WHEN** an approver rejects a pending booking (status "cancelled")
- **THEN** the system SHALL create a Notification with title "การจองห้องประชุมถูกปฏิเสธ" and message containing the booking title
- **AND** SHALL create a NotificationRead entry for the booking's user

#### Scenario: Notification failure does not block operation

- **WHEN** notification creation fails
- **THEN** the booking status change SHALL still complete successfully
- **AND** the error SHALL be logged to console only

