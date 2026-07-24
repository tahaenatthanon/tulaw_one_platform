## MODIFIED Requirements

### Requirement: Save Button Visibility

The save button SHALL be rendered as part of a Sticky Action Bar at the bottom of the page. The Sticky Action Bar SHALL include: Pending Changes Indicator, Reset button, Discard button, and Save Changes button. The Save button SHALL be disabled when there are no unsaved changes or when a save operation is in progress.

#### Scenario: Save bar is sticky at bottom

- **WHEN** the user scrolls the configuration page
- **THEN** the Sticky Action Bar SHALL remain fixed at the bottom of the viewport with a backdrop blur effect

#### Scenario: Save button enabled when dirty

- **WHEN** the user edits any form field
- **THEN** the Save button in the Sticky Action Bar SHALL become enabled and display in primary color

#### Scenario: Save button disabled when not dirty

- **WHEN** there are no unsaved changes
- **THEN** the Save button SHALL appear disabled with muted styling

#### Scenario: Reset and Discard buttons visible when dirty

- **WHEN** the user has unsaved changes
- **THEN** both Reset (รีเซ็ต) and Discard (ทิ้งทั้งหมด) buttons SHALL appear in the Sticky Action Bar
- **AND** both buttons SHALL be disabled during a save operation

#### Scenario: Pending changes count is shown

- **WHEN** the user has unsaved changes
- **THEN** the Pending Changes Indicator in the Sticky Action Bar SHALL display the count of modified sections

### Requirement: Explicit Save — Changes Deferred Until Save

The system SHALL show a Save Confirmation Dialog before executing the save operation. This dialog SHALL display a summary of pending changes, an immediate effect warning, and confirm/cancel actions.

#### Scenario: Save confirmation dialog appears

- **WHEN** the user clicks the Save button in the Sticky Action Bar
- **THEN** a confirmation dialog SHALL appear with: a warning icon, "ยืนยันการบันทึกการเปลี่ยนแปลง" title, count of pending changes, summary of change impact, a warning that changes take effect immediately, and Confirm/Cancel buttons

#### Scenario: Confirming save executes the save

- **WHEN** the user clicks "ยืนยันการบันทึก" in the confirmation dialog
- **THEN** the dialog SHALL close and the save operation SHALL execute via the existing `onSave` handler

#### Scenario: Cancelling confirmation does not save

- **WHEN** the user clicks "ยกเลิก" or closes the confirmation dialog
- **THEN** the save operation SHALL NOT execute and unsaved changes SHALL remain in the form