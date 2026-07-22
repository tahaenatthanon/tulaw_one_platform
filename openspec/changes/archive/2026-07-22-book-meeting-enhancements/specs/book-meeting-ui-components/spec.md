## MODIFIED Requirements

### Requirement: Schedule Table with Date Picker

The system SHALL display a grid table schedule — rooms as rows, time slots (08:00-18:00 half-hourly) as columns — with bookings shown as colored blocks. Date is selectable via left/right navigation.

#### Scenario: Display schedule grid

- **WHEN** a user selects the "ตารางเวลา" tab
- **THEN** the system SHALL render a grid table with rooms as rows and half-hourly time slots (08:00-18:00) as columns
- **AND** the last time slot SHALL be 17:30–18:00
- **AND** show a date picker header with left/right navigation and Thai date label

#### Scenario: Navigate dates

- **WHEN** a user clicks the left/right arrow buttons
- **THEN** the system SHALL navigate to the previous/next day
- **AND** display the date in Thai format (e.g., "วันจันทร์ที่ 21 กรกฎาคม 2569")

#### Scenario: Booking blocks in cells

- **WHEN** bookings exist for the selected date and room
- **THEN** the system SHALL display a colored block (`bg-tu-primary`) with the booking title in the start time cell
- **AND** the block SHALL be clickable to open booking details

#### Scenario: Empty schedule

- **WHEN** no bookings exist for the selected date
- **THEN** the grid SHALL still render with empty cells
