## ADDED Requirements

### Requirement: Intranet has inline announcement category management

The Intranet page SHALL provide a "จัดการประเภทประกาศ" button that opens a modal for administrators to manage announcement categories (name and color).

#### Scenario: Open category management modal

- **WHEN** a user with INTRANET_MANAGE permission clicks "จัดการประเภทประกาศ"
- **THEN** a modal SHALL open showing all announcement categories from Settings API
- **AND** each category SHALL display its name and color swatch

#### Scenario: Add new category

- **WHEN** the user enters a name and selects a color, then clicks "เพิ่ม"
- **THEN** the category SHALL be added to the Settings storage data
- **AND** the modal SHALL refresh to show the new category

#### Scenario: Edit category

- **WHEN** the user clicks edit on a category, changes the name or color, and clicks save
- **THEN** the category SHALL be updated in Settings

#### Scenario: Delete category

- **WHEN** the user clicks delete on a category and confirms
- **THEN** the category SHALL be removed from Settings

#### Scenario: Category changes sync in real-time across modules

- **WHEN** a category is added, edited, or deleted from the modal
- **THEN** the Intranet page SHALL revalidate its SWR cache via `mutate()`
- **AND** updated categories SHALL appear immediately in announcement forms without page refresh
- **AND** the Settings storage page SHALL reflect the same updated categories when navigated to
