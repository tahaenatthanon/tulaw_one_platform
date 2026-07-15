## ADDED Requirements

### Requirement: Authenticated user can view meeting rooms with real-time status

The system SHALL provide an endpoint to fetch all active meeting rooms with their current availability status derived from active bookings.

#### Scenario: Rooms listed with status
- **WHEN** a user visits the rooms tab
- **THEN** the system displays all meeting rooms with name, capacity, location, and status (available/in-use)

#### Scenario: Room marked in-use when booked
- **WHEN** a confirmed booking exists for a room covering the current time
- **THEN** that room's status is "in-use"

#### Scenario: Room marked available when free
- **WHEN** no confirmed booking exists for a room at the current time
- **THEN** that room's status is "available"

### Requirement: Bookings SHALL be fetched and displayed from the database

The system SHALL fetch real booking records from the database and display them across all tabs without mock data fallback.

#### Scenario: Bookings load on page mount
- **WHEN** a user opens the book meeting page
- **THEN** all bookings are fetched from the API and displayed in their respective tabs

#### Scenario: Empty bookings shows empty state
- **WHEN** no bookings exist in the system
- **THEN** tabs display "ไม่มีการจอง" or similar empty state message

### Requirement: Booking form SHALL persist purpose and notes

The system SHALL accept and store the purpose and notes fields when creating a booking.

#### Scenario: Create booking with purpose
- **WHEN** a user creates a booking with a purpose text
- **THEN** the purpose is saved as the booking's remark

#### Scenario: Create booking without purpose
- **WHEN** a user creates a booking without a purpose
- **THEN** the booking is created with an empty remark
