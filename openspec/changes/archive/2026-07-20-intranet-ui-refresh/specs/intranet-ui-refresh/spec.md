## ADDED Requirements

### Requirement: Intranet page layout starts with statistics cards
The Intranet page SHALL begin with 4 statistics cards (ประกาศทั้งหมด, ประกาศด่วน, กิจกรรมเดือนนี้, จำนวนหน่วยงาน) immediately after the tab navigation, without any Hero section.

#### Scenario: Page loads without Hero section
- **WHEN** user navigates to Intranet page
- **THEN** no Hero section is displayed
- **AND** statistics cards are visible at the top of the content area

### Requirement: Category badges use system data
หมวดหมู่ประกาศและกิจกรรม SHALL display using data from the system (API), not hardcoded values. Category name and color SHALL reflect the database configuration.

#### Scenario: Category name changes in system
- **WHEN** an admin changes a category name in the system
- **THEN** the category badge in the Intranet UI SHALL display the updated name

#### Scenario: Category color changes in system
- **WHEN** an admin changes a category color in the system
- **THEN** the category badge color in the Intranet UI SHALL reflect the updated color

### Requirement: Subscribe merged into Announcements tab
The subscription feature SHALL be displayed within the Announcements tab, below the category filter chips. There SHALL NOT be a separate Subscribe tab.

#### Scenario: User sees subscribe options
- **WHEN** user views the Announcements tab
- **THEN** subscribe toggle chips are visible below the category filter
- **AND** user can toggle subscription per category

### Requirement: Calendar displays events by actual date
The Calendar grid SHALL display event indicators based on the actual event date (day, month, year), not by matching day number alone.

#### Scenario: Event on specific date
- **WHEN** an event is scheduled for July 21, 2026
- **THEN** the calendar SHALL show the event indicator only on July 2026 grid
- **AND** SHALL NOT show the indicator on day 21 of any other month

#### Scenario: Multiple events in same month
- **WHEN** July 2026 has events on days 10, 15, and 22
- **THEN** the calendar grid SHALL highlight those three days
- **AND** other days SHALL not have event indicators

### Requirement: Department cards use new design
Each department contact card SHALL display icon, name, phone, email, and location with hover effects and shadow.

#### Scenario: User hovers on department card
- **WHEN** user hovers over a department card
- **THEN** the card SHALL show a hover effect (lift and shadow change)
- **AND** the border SHALL highlight

### Requirement: Modals use updated design without logic changes
Create/Edit modals for announcements and events SHALL use the new design system while preserving all existing validation, API calls, state management, and hooks unchanged.

#### Scenario: Create announcement modal
- **WHEN** user opens create announcement modal
- **THEN** modal displays with updated header, body, footer, form layout, buttons, and spacing
- **AND** all validation rules remain identical to current behavior
- **AND** submit calls the same API endpoint with same payload format
