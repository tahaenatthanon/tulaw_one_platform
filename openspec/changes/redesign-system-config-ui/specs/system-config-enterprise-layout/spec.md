## ADDED Requirements

### Requirement: Enterprise Page Layout Structure

The System Configuration page SHALL use an Enterprise Page Layout consisting of: Page Header, Search Area, Category Navigation (Sidebar), Configuration Panel, and Sticky Action Bar, in that order from top to bottom.

#### Scenario: Full layout renders in correct order

- **WHEN** a system administrator navigates to the System Configuration page
- **THEN** the page SHALL render: Page Header with title and description, Search Area with search input, a two-column layout with Category Sidebar on the left and Configuration Panel on the right, and a Sticky Action Bar at the bottom

#### Scenario: Two-column layout on desktop

- **WHEN** the viewport width is 1024px or greater
- **THEN** the layout SHALL display a fixed-width sidebar (280px) on the left and a flexible content area on the right

### Requirement: Configuration Panel Header

Each configuration category SHALL display a panel header containing the category icon, title, and description when selected.

#### Scenario: Panel header shows category information

- **WHEN** a category is selected from the sidebar
- **THEN** the configuration panel SHALL display the category's icon, title, and description in a header section above the configuration form

#### Scenario: Panel header updates on category switch

- **WHEN** the user selects a different category
- **THEN** the panel header SHALL update to show the new category's icon, title, and description