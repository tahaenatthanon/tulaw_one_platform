## ADDED Requirements

### Requirement: Documents item visible in sidebar for authorized users
The system SHALL display a "เอกสาร" navigation item in the left sidebar's platform navigation section for users who have the `DOCUMENTS_VIEW` permission.

#### Scenario: User with DOCUMENTS_VIEW permission sees the documents item
- **WHEN** a user with `DOCUMENTS_VIEW` permission is authenticated
- **THEN** the sidebar SHALL display a "เอกสาร" item with the FolderOpen icon in the "เมนูหลัก" section

#### Scenario: User without DOCUMENTS_VIEW permission does not see the documents item
- **WHEN** a user without `DOCUMENTS_VIEW` permission is authenticated
- **THEN** the sidebar SHALL NOT display the "เอกสาร" item

### Requirement: Documents sidebar item navigates to Documents page
The system SHALL navigate the user to the Documents page when the "เอกสาร" sidebar item is clicked.

#### Scenario: Click on documents sidebar item
- **WHEN** user clicks the "เอกสาร" sidebar item
- **THEN** the system SHALL navigate to `/documents`

#### Scenario: Documents sidebar item shows active state
- **WHEN** the current pathname is `/documents` or starts with `/documents/`
- **THEN** the "เอกสาร" sidebar item SHALL be styled with the active state (yellow background, dark text)
