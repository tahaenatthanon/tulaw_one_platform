## ADDED Requirements

### Requirement: Create/Edit project modal has clean flat header and priority field

The Create and Edit project modal SHALL display a clean flat header (no gradient) and include a priority dropdown field.

#### Scenario: Modal header has no gradient

- **WHEN** the create or edit project modal is opened
- **THEN** the modal header SHALL display a flat border-b with no gradient background
- **AND** the title SHALL show "สร้างโครงการใหม่" (create) or "แก้ไขโครงการ" (edit)

#### Scenario: Priority field in form

- **WHEN** the modal is opened
- **THEN** a priority dropdown SHALL appear with options: Low, Medium, High, Urgent
- **AND** for edit mode, the current priority SHALL be pre-selected

#### Scenario: Form fields preserved in modal

- **WHEN** the modal is opened
- **THEN** the form SHALL include: project name (required), type dropdown, description textarea, start/end date inputs, members section with UserSearchCombobox
- **AND** for edit mode, a progress slider SHALL appear
- **AND** all fields SHALL use `rounded-[10px]` border styling

#### Scenario: Modal buttons styled consistently

- **WHEN** the modal is rendered
- **THEN** a "ยกเลิก" secondary button SHALL appear with `border border-tu-border bg-tu-surface`
- **AND** a primary "สร้างโครงการ" or "บันทึก" button SHALL appear with `bg-tu-primary text-white`
- **AND** buttons SHALL use `rounded-[10px]` and `h-9` height
