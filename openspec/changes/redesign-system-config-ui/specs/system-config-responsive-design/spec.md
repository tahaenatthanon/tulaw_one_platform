## ADDED Requirements

### Requirement: Responsive Sidebar

The category sidebar SHALL adapt to different viewport sizes: on desktop (1024px+), display as a vertical fixed sidebar; on tablet (768px–1023px), display as a horizontal scrollable pill bar; on mobile (< 768px), display as a dropdown select.

#### Scenario: Desktop sidebar layout

- **WHEN** the viewport width is 1024px or greater
- **THEN** the sidebar SHALL render as a vertical navigation panel fixed at 280px width on the left side of the content area

#### Scenario: Tablet sidebar layout

- **WHEN** the viewport width is between 768px and 1023px
- **THEN** the categories SHALL render as horizontal scrollable pill buttons above the configuration panel
- **AND** the pill bar container SHALL use natural width (`w-fit`) — NOT stretch to full width
- **AND** each tab button SHALL be sized to fit its content (`shrink-0`)
- **AND** the active tab SHALL have no background fill; active state SHALL use primary text color + underline only

#### Scenario: Mobile sidebar layout

- **WHEN** the viewport width is below 768px
- **THEN** the categories SHALL render as a dropdown select element above the configuration panel

### Requirement: Responsive Configuration Cards

Configuration form sections SHALL adapt their grid layout responsively: two columns on desktop, single column on tablet and mobile.

#### Scenario: Two-column form grid on desktop

- **WHEN** the viewport is 640px or wider
- **THEN** form field pairs SHALL display in a two-column grid layout

#### Scenario: Single-column form grid on mobile

- **WHEN** the viewport is below 640px
- **THEN** form fields SHALL stack in a single column

### Requirement: Responsive API Key Display

The API Key list SHALL display as a table on desktop and as stacked cards on mobile.

#### Scenario: Table display on desktop

- **WHEN** the viewport is 768px or wider
- **THEN** API keys SHALL display in a table with columns for Name, API Key, Permissions, Status, Created, Last Used, and Actions

#### Scenario: Card display on mobile

- **WHEN** the viewport is below 768px
- **THEN** API keys SHALL display as stacked cards with all information shown in a vertical layout

### Requirement: Responsive Sticky Action Bar

The Sticky Action Bar SHALL adapt to mobile viewports by stacking the status text and action buttons vertically instead of horizontally.

#### Scenario: Horizontal layout on desktop

- **WHEN** the viewport is 640px or wider
- **THEN** the action bar SHALL display status text on the left and action buttons on the right in a horizontal row

#### Scenario: Stacked layout on mobile

- **WHEN** the viewport is below 640px
- **THEN** the action bar SHALL stack with status text on top and action buttons below, both full-width