## ADDED Requirements

### Requirement: Grouped Category Sidebar

The System Configuration page SHALL display categories organized into logical groups: Core Settings (Authentication, SSO/LDAP), Appearance (Branding), Storage, and Integration (API Keys).

#### Scenario: Group headers are displayed

- **WHEN** the page renders
- **THEN** the sidebar SHALL show group headers "Core Settings", "Appearance", "Storage", and "Integration" with their respective category items listed beneath each header

#### Scenario: Category item shows icon, label, and description

- **WHEN** a category item is displayed
- **THEN** each item SHALL show its icon, label in Thai/English, and a brief description below the label

#### Scenario: Active category has highlighted state

- **WHEN** a category is selected
- **THEN** the active category SHALL display with a distinct visual treatment (primary color background or accent indicator) to differentiate it from inactive categories

#### Scenario: Only 5 categories are shown

- **WHEN** the sidebar renders
- **THEN** only the following categories SHALL be displayed: Authentication, SSO/LDAP, Branding, Storage, Integration/API Keys
- **AND** Meeting Room, Application Status, Categories, Security, and Audit SHALL NOT appear in the sidebar

### Requirement: Category Navigation via Sidebar

Users SHALL navigate between configuration categories by clicking items in the sidebar. The active category determines which configuration panel content is displayed.

#### Scenario: Clicking a category changes the configuration panel

- **WHEN** the user clicks a category in the sidebar
- **THEN** the configuration panel SHALL update to show the settings form for the selected category
- **AND** the previous category's state (including unsaved changes) SHALL be preserved

#### Scenario: Unsaved changes persist across category switches

- **WHEN** the user edits a value in one category and switches to another without saving
- **THEN** upon returning to the original category, the edited values SHALL still be present in the form fields

### Requirement: Natural Width Tabs for Tablet/Mobile

On tablet and mobile viewports, the category tabs (horizontal pill bar) SHALL display with natural width (Fit Content). The tab container SHALL NOT stretch to full width. The active tab SHALL have no background color — active state SHALL be indicated only by text color change and a bottom border (underline).

#### Scenario: Tabs use natural width (Fit Content)

- **WHEN** the horizontal pill bar is displayed on tablet (768px–1023px)
- **THEN** each tab button SHALL be sized to fit its content (`w-fit` or `shrink-0`)
- **AND** the container holding the tabs SHALL NOT stretch to full width

#### Scenario: Active tab has no background fill

- **WHEN** a tab is in active (selected) state on tablet or mobile
- **THEN** the active tab SHALL NOT have a background color (no `bg-tu-primary` fill)
- **AND** the active state SHALL be indicated by primary text color and a bottom border (underline)

#### Scenario: Inactive tabs have muted styling

- **WHEN** a tab is not selected on tablet or mobile
- **THEN** the tab SHALL display in muted text color (`text-tu-text-muted` or `text-tu-text-secondary`)
- **AND** the tab SHALL have no background fill and no bottom border
