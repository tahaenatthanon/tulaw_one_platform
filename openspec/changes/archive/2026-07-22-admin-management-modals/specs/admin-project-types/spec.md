## ADDED Requirements

### Requirement: Projects has inline project type management

The Projects page SHALL provide a "จัดการประเภทโครงการ" button that opens a modal for administrators to manage project types (name).

#### Scenario: Open project type modal

- **WHEN** a user with PROJECTS_MANAGE_ALL permission clicks "จัดการประเภทโครงการ"
- **THEN** a modal SHALL open showing all project types
- **AND** each type SHALL display its name

#### Scenario: Add new project type

- **WHEN** the user enters a name and clicks "เพิ่ม"
- **THEN** the type SHALL be added via POST `/api/projects/types`

#### Scenario: Edit project type

- **WHEN** the user clicks edit on a type, changes the name, and clicks save
- **THEN** the type SHALL be updated via PUT `/api/projects/types`

#### Scenario: Delete project type

- **WHEN** the user clicks delete on a type and confirms
- **THEN** the type SHALL be deleted via DELETE `/api/projects/types`

#### Scenario: Project type changes sync in real-time

- **WHEN** a project type is added, edited, or deleted from the modal
- **THEN** the Projects page SHALL revalidate its SWR cache via `mutate()`
- **AND** updated types SHALL appear immediately in the project create/edit dropdowns without page refresh
- **AND** the Settings storage page SHALL reflect the same updated types when navigated to
