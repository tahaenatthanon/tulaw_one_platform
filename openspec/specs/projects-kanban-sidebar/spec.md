# projects-kanban-sidebar Specification

## Purpose
Sidebar navigation item "โครงการ" providing direct access to the Projects Kanban Board with Drag & Drop, Progress Bars, 6 project types, and approval workflow.

## Requirements
### Requirement: Projects sidebar item visible for authorized users
The system SHALL display a "Projects" navigation item in the left sidebar's platform navigation section for users who have the `PROJECTS_VIEW` permission. The item SHALL navigate to `/projects` which hosts the full Kanban Board with 6 project types.

#### Scenario: User with PROJECTS_VIEW permission sees the projects item
- **WHEN** a user with `PROJECTS_VIEW` permission is authenticated
- **THEN** the sidebar SHALL display a "Projects" item with the FlaskConical icon in the platform navigation section

#### Scenario: User without PROJECTS_VIEW permission does not see the projects item
- **WHEN** a user without `PROJECTS_VIEW` permission is authenticated
- **THEN** the sidebar SHALL NOT display the "โครงการ" item

### Requirement: Projects sidebar item navigates to Projects Kanban Board
The system SHALL navigate the user to the Projects Kanban Board page (`/projects`) when the "Projects" sidebar item is clicked.

#### Scenario: Click on projects sidebar item
- **WHEN** user clicks the "Projects" sidebar item
- **THEN** the system SHALL navigate to `/projects`

#### Scenario: Projects sidebar item shows active state
- **WHEN** the current pathname is `/projects` or starts with `/projects/`
- **THEN** the "Projects" sidebar item SHALL be styled with the active state (yellow background, dark text)
