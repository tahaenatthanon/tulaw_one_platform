# book-meeting-form-auto-organizer Specification

## Purpose
TBD - created by archiving change book-meeting-enhancements. Update Purpose after archive.
## Requirements
### Requirement: Organizer auto-populated from session user

The system SHALL automatically use the logged-in user's name as the organizer without requiring manual input.

#### Scenario: Create dialog shows user as organizer

- **WHEN** a user opens the create booking dialog
- **THEN** the system SHALL display the current user's name (firstNameTh lastNameTh) in the organizer field
- **AND** the organizer field SHALL be read-only or hidden
- **AND** no manual organizer input field SHALL be shown

#### Scenario: Booking list shows who booked

- **WHEN** a booking is displayed in any tab (my-bookings, pending, schedule, history)
- **THEN** the system SHALL display the booker's name from the user relation
- **AND** the name SHALL be shown alongside other booking details

#### Scenario: API stores userId as booker

- **WHEN** a booking is created via POST `/api/book-meeting`
- **THEN** the system SHALL set `userId` to the session user's ID automatically
- **AND** SHALL NOT accept organizer from the request body

