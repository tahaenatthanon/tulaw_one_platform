## ADDED Requirements

### Requirement: Research item visible in sidebar for authorized users
The system SHALL display a "งานวิจัย" navigation item in the left sidebar's platform navigation section for users who have the `RESEARCH_VIEW` permission.

#### Scenario: User with RESEARCH_VIEW permission sees the research item
- **WHEN** a user with `RESEARCH_VIEW` permission is authenticated
- **THEN** the sidebar SHALL display a "งานวิจัย" item with the FlaskConical (flask) icon in the "เมนูหลัก" section

#### Scenario: User without RESEARCH_VIEW permission does not see the research item
- **WHEN** a user without `RESEARCH_VIEW` permission is authenticated
- **THEN** the sidebar SHALL NOT display the "งานวิจัย" item

### Requirement: Research sidebar item navigates to Research Management
The system SHALL navigate the user to the Research Management page when the "งานวิจัย" sidebar item is clicked.

#### Scenario: Click on research sidebar item
- **WHEN** user clicks the "งานวิจัย" sidebar item
- **THEN** the system SHALL navigate to `/application-hub/research-management`

#### Scenario: Research sidebar item shows active state
- **WHEN** the current pathname is `/application-hub/research-management` or starts with `/application-hub/research-management/`
- **THEN** the "งานวิจัย" sidebar item SHALL be styled with the active state (yellow background, dark text)
