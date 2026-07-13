# sidebar-bookmeeting-navigation Specification

## Purpose
TBD - created by archiving change move-research-and-bookmeeting-to-sidebar. Update Purpose after archive.
## Requirements
### Requirement: Book Meeting item visible in sidebar for authorized users
The system SHALL display a "จองห้องประชุม" navigation item in the left sidebar's platform navigation section for users who have the `BOOK_MEETING_VIEW` permission.

#### Scenario: User with BOOK_MEETING_VIEW permission sees the book meeting item
- **WHEN** a user with `BOOK_MEETING_VIEW` permission is authenticated
- **THEN** the sidebar SHALL display a "จองห้องประชุม" item with the CalendarCheck icon in the "เมนูหลัก" section

#### Scenario: User without BOOK_MEETING_VIEW permission does not see the book meeting item
- **WHEN** a user without `BOOK_MEETING_VIEW` permission is authenticated
- **THEN** the sidebar SHALL NOT display the "จองห้องประชุม" item

### Requirement: Book Meeting sidebar item navigates to Book Meeting page
The system SHALL navigate the user to the Book Meeting page when the "จองห้องประชุม" sidebar item is clicked.

#### Scenario: Click on book meeting sidebar item
- **WHEN** user clicks the "จองห้องประชุม" sidebar item
- **THEN** the system SHALL navigate to `/book-meeting`

#### Scenario: Book meeting sidebar item shows active state
- **WHEN** the current pathname is `/book-meeting` or starts with `/book-meeting/`
- **THEN** the "จองห้องประชุม" sidebar item SHALL be styled with the active state (yellow background, dark text)

