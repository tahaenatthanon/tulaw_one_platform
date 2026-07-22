# book-meeting-edit-cancel Specification

## Purpose
TBD - created by archiving change book-meeting-enhancements. Update Purpose after archive.
## Requirements
### Requirement: Edit booking from My Bookings tab

The system SHALL allow users to edit their own bookings from the "การจองของฉัน" tab.

#### Scenario: User edits own booking

- **WHEN** a user views the "การจองของฉัน" tab
- **AND** clicks the "แก้ไข" button on one of their bookings
- **THEN** the system SHALL open the CreateBookingDialog in edit mode
- **AND** pre-fill all fields with the current booking data
- **AND** on submit, SHALL PUT to `/api/book-meeting` with the updated fields
- **AND** if time/room changed, SHALL auto-set status to `pending` for re-approval

#### Scenario: Non-owner cannot edit

- **WHEN** a user sees bookings in "การจองของฉัน"
- **THEN** only bookings where `userId` matches the current user SHALL have the "แก้ไข" button visible

### Requirement: Cancel booking from My Bookings tab

The system SHALL allow users to cancel their own bookings from the "การจองของฉัน" tab.

#### Scenario: User cancels own booking

- **WHEN** a user clicks the "ยกเลิก" button on one of their bookings
- **THEN** the system SHALL show a confirmation dialog
- **AND** on confirm, SHALL PUT to `/api/book-meeting` with `{ id, status: "cancelled" }`
- **AND** SHALL optimistically update the UI to remove the booking from the list

#### Scenario: Optimistic cancel with rollback

- **WHEN** the cancel API call fails
- **THEN** the system SHALL revert the optimistic update via SWR revalidation
- **AND** display an error message

