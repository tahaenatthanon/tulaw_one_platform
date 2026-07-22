# projects-ui-kanban Specification

## Purpose
TBD - created by archiving change projects-ui-redesign. Update Purpose after archive.
## Requirements
### Requirement: Projects page has enterprise filter bar

The Projects page SHALL provide a filter bar with a search input and four dropdown filters: status, priority, department, and category.

#### Scenario: Filter by status

- **WHEN** a user selects a status from the dropdown (Planning/In Progress/Pending Approval/Completed)
- **THEN** only projects in that column SHALL be displayed

### Requirement: Projects page has Kanban/List view toggle

The Projects page SHALL provide a view toggle between Kanban board and List view using the platform standard pill selector pattern.

#### Scenario: Toggle to list view

- **WHEN** a user clicks the "List" toggle button
- **THEN** the view SHALL switch to a responsive table showing projects with columns: project name/code/priority, status, progress, team, deadline
- **AND** the toggle button SHALL show active state (bg-tu-primary text-white)

### Requirement: Kanban columns have gradient accent headers

Each Kanban column SHALL display a gradient header with its accent color, a dot indicator, column title, and project count badge.

#### Scenario: Column header renders with gradient

- **WHEN** the Kanban board is rendered
- **THEN** each column header SHALL show a gradient background (`bg-gradient-to-b from-[accent]/20 to-transparent`)
- **AND** a colored dot indicator SHALL appear next to the column title
- **AND** the project count SHALL appear as a badge

### Requirement: Project cards display data from API only

Each project card SHALL display only fields present in the API data: code (when present), priority badge, title, description, labels (when present), progress bar, deadline (overdue in red), avatar stack, owner name, and approve/reject buttons for pending approval cards.

#### Scenario: Card does not generate fake data

- **WHEN** a project has no `code` field
- **THEN** the code badge SHALL NOT render
- **AND** no fake code (e.g., "TU-LAW-XXXX") SHALL be generated

#### Scenario: Overdue projects show red deadline

- **WHEN** a project's deadline has passed and its status is not "completed"
- **THEN** the deadline text SHALL render in `text-tu-error`

### Requirement: Kanban supports drag overlay animation

When a card is being dragged, a ghost overlay SHALL appear with a slight rotation.

#### Scenario: Drag overlay shown during drag

- **WHEN** a user starts dragging a project card
- **THEN** the original card SHALL become semi-transparent
- **AND** a DragOverlay SHALL appear with the card rendered at 300px width with 2-degree rotation

