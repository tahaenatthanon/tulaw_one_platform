# dashboard-org-statistics Specification

## Purpose
TBD - created by archiving change sidebar-dashboard-redesign. Update Purpose after archive.
## Requirements
### Requirement: Organization statistics display as 4-column grid of large cards

The Dashboard SHALL display 4 organization statistics in a responsive grid with equal-sized, enhanced cards.

#### Scenario: Stats grid shows 4 columns on desktop

- **WHEN** viewport width is ≥1024px
- **THEN** the statistics SHALL display in a 4-column grid
- **AND** all 4 cards SHALL have equal width and height

#### Scenario: Stats grid adapts to tablet and mobile

- **WHEN** viewport width is between 768px and 1023px
- **THEN** the statistics SHALL display in a 2-column grid
- **WHEN** viewport width is below 768px
- **THEN** the statistics SHALL display in a single column

#### Scenario: Each stat card shows prominent value with icon and label

- **WHEN** Dashboard loads
- **THEN** each stat card SHALL display a large numeric value (text-4xl, font-bold, tabular-nums)
- **AND** the value SHALL be formatted with Thai locale (e.g., "2,500")
- **AND** each card SHALL display an icon in the top-right corner inside a colored rounded box
- **AND** each card SHALL display a label below the value (text-sm, text-tu-text-muted)

#### Scenario: Stat card shows trend indicator

- **WHEN** Dashboard loads with trend data
- **THEN** each stat card SHALL display a sub-text line showing the trend (e.g., "+12% จากเดือนก่อน")
- **AND** positive trends SHALL use `text-tu-success` color
- **AND** negative trends SHALL use `text-tu-error` color
- **AND** the trend SHALL include a small arrow icon (TrendingUp or TrendingDown)

### Requirement: Stat cards have hover animation

Each stat card SHALL animate smoothly on hover.

#### Scenario: Card lifts on hover

- **WHEN** user hovers over a stat card
- **THEN** the card SHALL transition with `hover:shadow-md` and a subtle scale effect (scale-[1.02])
- **AND** the transition duration SHALL be 200ms with ease-out timing
- **AND** the card SHALL respect `prefers-reduced-motion` (no animation)

### Requirement: Stat cards follow new card design system

Stat cards SHALL use the updated card design tokens.

#### Scenario: Card uses updated styling

- **WHEN** stat cards render
- **THEN** each card SHALL have `border-radius: 16px` (rounded-2xl)
- **AND** each card SHALL have `border: 1px solid var(--tu-border)`
- **AND** each card SHALL have `shadow-sm` for subtle depth
- **AND** background SHALL be `bg-tu-surface`

### Requirement: Organization statistics show 4 specific metrics

The 4 stat cards SHALL display: personnel count, online systems, active projects, and student count.

#### Scenario: Correct metrics are displayed

- **WHEN** Dashboard loads
- **THEN** card 1 SHALL show "จำนวนบุคลากร" with Users icon and `text-tu-primary` color
- **AND** card 2 SHALL show "ระบบออนไลน์" with Activity icon and `text-tu-info` color
- **AND** card 3 SHALL show "โครงการ" with FlaskConical icon and `text-tu-success` color
- **AND** card 4 SHALL show "จำนวนนักศึกษา" with GraduationCap icon and `text-tu-warning` color

### Requirement: Organization statistics section contains only 4 stat cards

The Organization Statistics section SHALL contain exactly 4 stat cards in the grid — no separate breakdown widgets, personnel proportion bars, or redundant stat displays outside the grid.

#### Scenario: Only 4 stat cards are displayed

- **WHEN** Dashboard renders the organization statistics section
- **THEN** only the 4 stat cards (บุคลากร, ระบบออนไลน์, โครงการ, นักศึกษา) SHALL be displayed
- **AND** no separate PersonnelBreakdown, proportion bar, or additional stat widgets SHALL appear in this section
- **AND** detailed personnel breakdown SHALL be accessible via the Department Dashboard tabs instead

### Requirement: Stat card colors reference globals.css design tokens only

All stat card background, text, border, icon, and trend colors SHALL use CSS variables from `globals.css` via Tailwind `tu-*` utility classes.

#### Scenario: Stat cards use only --tu-* color tokens

- **WHEN** stat cards render
- **THEN** card background SHALL use `bg-tu-surface` (maps to `--tu-surface`)
- **AND** card border SHALL use `border-tu-border` (maps to `--tu-border`)
- **AND** metric labels SHALL use `text-tu-text-muted` (maps to `--tu-text-muted`)
- **AND** positive trends SHALL use `text-tu-success` (maps to `--tu-success`)
- **AND** negative trends SHALL use `text-tu-error` (maps to `--tu-error`)
- **AND** NO raw hex colors or Tailwind palette colors (e.g., `bg-white`, `text-green-500`) SHALL be used

