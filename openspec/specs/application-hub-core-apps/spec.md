# application-hub-core-apps Specification

## Purpose
Application Hub displays 5 core application groups (ERP, E-Office, Document Management, Academic Management, HR Management) with 4 real-time statistics, pin/unpin, online/offline indicators, instant search, and grid/list view toggle.

## Requirements
### Requirement: Application Hub displays only core application groups
The system SHALL display only 5 core application groups in the Application Hub: ERP, E-Office, Document Management (ระบบจัดเก็บ), Academic Management (ระบบงานวิชาการ), and HR Management (ระบบงานบุคคล).

#### Scenario: User views Application Hub
- **WHEN** an authenticated user navigates to `/application-hub`
- **THEN** the system SHALL display application cards for ERP, E-Office, Document Management, Academic Management, and HR Management only

#### Scenario: Removed applications are not displayed
- **WHEN** an authenticated user navigates to `/application-hub`
- **THEN** the system SHALL NOT display application cards for Research (งานวิจัย), Legal Clinic (คลินิกกฎหมาย), Book Meeting (จองห้องประชุม), or Support Services (บริการสนับสนุน)

### Requirement: Application Hub displays 4 real-time statistics based on displayed apps
The system SHALL display 4 statistics in the Application Hub: Total Systems, Active Users, Online Systems, and Systems Under Maintenance. The Total Systems, Online, and Maintenance counts SHALL be computed from the currently displayed application groups.

#### Scenario: Statistics reflect current app count
- **WHEN** Application Hub displays 5 application groups
- **THEN** the Total Systems stat SHALL display "5"
- **AND** Online Systems SHALL count only apps where `online: true`
- **AND** Under Maintenance SHALL count only apps where `online: false`

### Requirement: Application Hub supports pin/unpin of displayed apps
The system SHALL allow users to pin and unpin application cards. Pinned apps SHALL appear in a separate "ปักหมุด" section above unpinned apps. Pin state SHALL persist in localStorage.

#### Scenario: User pins an application
- **WHEN** user clicks the star icon on an application card
- **THEN** the application SHALL move to the "ปักหมุด" section
- **AND** the pin state SHALL persist after page reload

#### Scenario: User unpins an application
- **WHEN** user clicks the star icon on a pinned application card
- **THEN** the application SHALL move back to the "แอปพลิเคชันทั้งหมด" section

### Requirement: Application Hub shows online/offline status on app icons
The system SHALL display a green (online) or yellow (offline) status dot on each application icon.

#### Scenario: Online application status
- **WHEN** an application has `online: true`
- **THEN** the status dot SHALL be green (`bg-tu-success`)

#### Scenario: Offline application status
- **WHEN** an application has `online: false`
- **THEN** the status dot SHALL be yellow (`bg-tu-warning`)

### Requirement: Application Hub supports instant search and view mode toggle
The system SHALL provide an instant search input that filters applications by name, description, or submodule name. The system SHALL also provide a toggle between Grid View and List View.

#### Scenario: User searches for an application
- **WHEN** user types a search term in the search input
- **THEN** only applications matching the term (by name, description, or submodule) SHALL be displayed

#### Scenario: User toggles to List View
- **WHEN** user clicks the "List" button in the view mode toggle
- **THEN** all application cards SHALL render in list layout (horizontal)

#### Scenario: User toggles to Grid View
- **WHEN** user clicks the "Grid" button in the view mode toggle
- **THEN** all application cards SHALL render in grid layout (card style)
