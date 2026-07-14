### Requirement: Authenticated user can search for other users to add as project members

The system SHALL provide a search endpoint that allows any authenticated user to search for other users by name for the purpose of adding them as project members.

#### Scenario: Search by first name
- **WHEN** a user types a partial first name in the member search field
- **THEN** the system returns up to 10 matching users with their id, firstNameTh, lastNameTh, email, and department name

#### Scenario: Search by last name
- **WHEN** a user types a partial last name in the member search field
- **THEN** the system returns up to 10 matching users with their id, firstNameTh, lastNameTh, email, and department name

#### Scenario: Search by email
- **WHEN** a user types a partial email in the member search field
- **THEN** the system returns up to 10 matching users with their id, firstNameTh, lastNameTh, email, and department name

#### Scenario: No results found
- **WHEN** a user searches for a name that matches no users
- **THEN** the system returns an empty array and the UI displays a "ไม่พบผู้ใช้" message

#### Scenario: Unauthenticated access denied
- **WHEN** an unauthenticated request is made to the search endpoint
- **THEN** the system returns 401 with an error message

### Requirement: Project create form SHALL support selecting real users as members

The system SHALL allow users with `PROJECTS_CREATE` permission to select real users as project members when creating a project, instead of free-text name input.

#### Scenario: Add member via search
- **WHEN** a user searches for and selects a user in the create form
- **THEN** the selected user appears in the member list with their real name, department, and a role input

#### Scenario: Remove member before save
- **WHEN** a user clicks the remove button on a member row in the create form
- **THEN** the member is removed from the list

#### Scenario: Save project with members
- **WHEN** a user creates a project with selected members and clicks save
- **THEN** the project is created and the selected members are saved as ProjectMember records with their specified roles

### Requirement: Project edit form SHALL support managing real user members

The system SHALL allow users with `PROJECTS_EDIT` permission to manage project members when editing a project.

#### Scenario: Edit existing members
- **WHEN** a user opens the edit form for a project with existing members
- **THEN** the existing members are displayed with their real names and roles

#### Scenario: Add new member during edit
- **WHEN** a user searches for and adds a new member in the edit form and saves
- **THEN** the new member is added to the project's member list

#### Scenario: Remove member during edit
- **WHEN** a user removes an existing member in the edit form and saves
- **THEN** the member is removed from the project

### Requirement: Project members SHALL be persisted via the API

The system SHALL accept member data in POST and PUT /api/projects and create/update ProjectMember records accordingly.

#### Scenario: POST creates member records
- **WHEN** a POST request includes memberIds with userId and role
- **THEN** ProjectMember records are created for each member linked to the project

#### Scenario: PUT syncs member records
- **WHEN** a PUT request includes an updated memberIds list
- **THEN** members not in the new list are removed and new members are added

#### Scenario: PUT with empty members clears all members
- **WHEN** a PUT request includes an empty memberIds array
- **THEN** all existing ProjectMember records for the project are removed
