## ADDED Requirements

### Requirement: Book Meeting has inline meeting room management

The Book Meeting page SHALL provide a "จัดการห้องประชุม" button that opens a modal for administrators to manage meeting rooms (name, capacity, location).

#### Scenario: Open room management modal

- **WHEN** a user with BOOK_MEETING_APPROVE permission clicks "จัดการห้องประชุม"
- **THEN** a modal SHALL open showing all meeting rooms with their current details
- **AND** each room SHALL display name, capacity, and location

#### Scenario: Add new room

- **WHEN** the user enters name, capacity, and location, then clicks "เพิ่ม"
- **THEN** a new room SHALL be created via POST `/api/book-meeting/rooms`

#### Scenario: Edit room

- **WHEN** the user clicks edit on a room, modifies fields, and clicks save
- **THEN** the room SHALL be updated via PUT `/api/book-meeting/rooms`

#### Scenario: Delete room

- **WHEN** the user clicks delete on a room and confirms
- **THEN** the room SHALL be deleted via DELETE `/api/book-meeting/rooms`

#### Scenario: Room changes sync in real-time

- **WHEN** a room is added, edited, or deleted from the modal
- **THEN** the Book Meeting page SHALL revalidate its SWR cache via `mutateRooms()`
- **AND** updated room cards SHALL appear immediately without page refresh
- **AND** the Settings meeting rooms section SHALL reflect the same data when accessed
