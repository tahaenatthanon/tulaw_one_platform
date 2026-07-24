## ADDED Requirements

### Requirement: Save Status Indicator States

The System Configuration page SHALL display a save status indicator that supports four states: No Changes, Unsaved Changes (with pending count), Saving, and Saved Successfully (with last saved time).

#### Scenario: No Changes state is displayed

- **WHEN** the user opens the page and has not made any edits
- **THEN** the save status indicator SHALL display "ไม่มีการเปลี่ยนแปลง" in muted text

#### Scenario: Unsaved Changes state is displayed with count

- **WHEN** the user has modified at least one form field
- **THEN** the save status indicator SHALL display "{count} การเปลี่ยนแปลงที่ยังไม่ได้บันทึก" with a warning icon
- **AND** the count SHALL reflect the number of distinct sections or fields that have been modified

#### Scenario: Saving state is displayed

- **WHEN** the save operation is in progress
- **THEN** the save status indicator SHALL display "กำลังบันทึก..." with a spinning loader icon
- **AND** the Save button SHALL be disabled

#### Scenario: Saved Successfully state is displayed

- **WHEN** the save operation completes successfully
- **THEN** the save status indicator SHALL display "บันทึกสำเร็จ" with a success checkmark icon
- **AND** the last saved time SHALL be shown (e.g., "บันทึกล่าสุด: 14:30 น.")

### Requirement: Pending Changes Count

The system SHALL track and display the number of pending (unsaved) changes as a UI-only counter. This count SHALL reset to 0 after a successful save or after the user discards all changes.

#### Scenario: Pending count increments on edit

- **WHEN** the user edits a value in any configuration field
- **THEN** the pending changes count SHALL increment by 1

#### Scenario: Pending count resets after save

- **WHEN** the user saves successfully
- **THEN** the pending changes count SHALL reset to 0

#### Scenario: Pending count resets after discard

- **WHEN** the user clicks Discard or Reset
- **THEN** the pending changes count SHALL reset to 0