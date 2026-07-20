## ADDED Requirements

### Requirement: Dashboard displays module header with title and description

The Dashboard page SHALL display a module header section at the top containing the module name, description, and action buttons.

#### Scenario: Module header shows title and description

- **WHEN** user navigates to the Dashboard page
- **THEN** the header SHALL display "Dashboard" as the module name (H1, 28px, font-semibold)
- **AND** the header SHALL display "ภาพรวมคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์" as the description (14px, text-tu-text-muted)

#### Scenario: Module header shows refresh button

- **WHEN** Dashboard page loads
- **THEN** a Refresh button (RefreshCw icon + "รีเฟรช") SHALL appear on the right side of the header
- **WHEN** user clicks the Refresh button
- **THEN** all dashboard data SHALL be re-fetched via SWR mutate
- **AND** the RefreshCw icon SHALL spin during loading

#### Scenario: Header layout adapts to mobile

- **WHEN** viewport width is below 768px
- **THEN** the header SHALL stack vertically (title + description first, action button below)

### Requirement: Module header colors reference globals.css design tokens only

All header text and button colors SHALL use CSS variables from `globals.css` via Tailwind `tu-*` utility classes.

#### Scenario: Header uses only --tu-* color tokens

- **WHEN** module header renders
- **THEN** title SHALL use `text-tu-text-primary` (maps to `--tu-text-primary`)
- **AND** description SHALL use `text-tu-text-muted` (maps to `--tu-text-muted`)
- **AND** Refresh button SHALL use `bg-tu-primary text-white hover:bg-tu-primary-hover`
- **AND** NO raw hex colors or Tailwind palette colors SHALL be used
