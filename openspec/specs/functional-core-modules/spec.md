## ADDED Requirements

### Requirement: Intranet fetches real data from API

The Intranet page SHALL fetch announcements, calendar events, department contacts, and organization statistics from their respective API endpoints instead of using hardcoded `MOCK_*` arrays.

#### Scenario: Intranet loads announcements

- **WHEN** a user navigates to Intranet and selects the "ประกาศ" tab
- **THEN** the system SHALL fetch announcements from `GET /api/announcements` and display them
- **AND** SHALL show a loading skeleton while fetching
- **AND** SHALL show an empty state message when no announcements exist
- **AND** SHALL show an error toast if the API call fails

#### Scenario: Intranet loads calendar

- **WHEN** a user selects the "ปฏิทิน" tab
- **THEN** the system SHALL fetch events from the calendar API

#### Scenario: Intranet loads contacts

- **WHEN** a user selects the "ติดต่อหน่วยงาน" tab
- **THEN** the system SHALL fetch departments from the departments API

#### Scenario: Creating an announcement

- **WHEN** a user with `INTRANET_CREATE` permission submits a new announcement
- **THEN** the system SHALL POST to `/api/announcements` and refresh the list

---

### Requirement: Book Meeting fetches real rooms and bookings

The Book Meeting page SHALL fetch meeting rooms and bookings from `GET /api/book-meeting` instead of `MOCK_ROOMS`/`MOCK_BOOKINGS`.

#### Scenario: Book Meeting loads rooms

- **WHEN** a user navigates to Book Meeting
- **THEN** the system SHALL fetch rooms from the API and display them with real-time availability

#### Scenario: Creating a booking

- **WHEN** a user submits a new booking
- **THEN** the system SHALL POST to `/api/book-meeting` and refresh the booking list

#### Scenario: Double-booking is prevented

- **WHEN** a user attempts to book an occupied time slot
- **THEN** the system SHALL display a conflict error from the API

---

### Requirement: Documents fetches real documents

The Documents page SHALL fetch documents from `GET /api/documents` instead of `MOCK_DOCS`.

#### Scenario: Documents page loads

- **WHEN** a user navigates to Documents
- **THEN** the system SHALL fetch documents respecting the user's data scope (pool access)

#### Scenario: Uploading a document

- **WHEN** a user with `DOCUMENTS_UPLOAD` permission uploads a file
- **THEN** the system SHALL POST to `/api/documents` and refresh the list

#### Scenario: Deleting a document

- **WHEN** a user with `DOCUMENTS_DELETE` permission deletes a document
- **THEN** the system SHALL DELETE via `/api/documents` and remove the item from the list

---

### Requirement: Projects fetches and persists kanban board

The Projects page SHALL fetch projects from `GET /api/projects` and persist all mutations (create, edit, drag-drop, approve, reject) via the API.

#### Scenario: Projects kanban loads

- **WHEN** a user navigates to Projects
- **THEN** the system SHALL fetch projects from the API and display them in kanban columns filtered by status

#### Scenario: Drag-and-drop updates status

- **WHEN** a user drags a project card to a different column
- **THEN** the system SHALL PUT to `/api/projects` with the new status and refresh

#### Scenario: Creating a project

- **WHEN** a user with `PROJECTS_CREATE` creates a new project
- **THEN** the system SHALL POST to `/api/projects` and add it to the planning column

#### Scenario: Approving a project

- **WHEN** a user with `PROJECTS_APPROVE` approves a project
- **THEN** the system SHALL update the project status via API and move it to the completed column
