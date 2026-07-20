## ADDED Requirements

### Requirement: Sidebar has expanded width of 280px

The left sidebar SHALL have a width of 280px when expanded and 72px when collapsed.

#### Scenario: Sidebar shows expanded width on desktop

- **WHEN** user views the platform on desktop (≥1024px) with sidebar expanded
- **THEN** the sidebar SHALL render at exactly 280px width
- **AND** all navigation labels SHALL be fully visible without text truncation

#### Scenario: Sidebar collapses to 72px

- **WHEN** user clicks the collapse toggle button (PanelLeftClose icon) in the header
- **THEN** the sidebar SHALL animate to 72px width
- **AND** only icons SHALL remain visible (no labels)
- **AND** a tooltip SHALL appear on hover over each icon showing the label

#### Scenario: Sidebar collapse state persists across page loads

- **WHEN** user collapses the sidebar and refreshes the page
- **THEN** the sidebar SHALL remain in collapsed state (72px)
- **AND** the collapse preference SHALL be read from localStorage key `sidebar-collapsed`

#### Scenario: Sidebar expands back to 280px

- **WHEN** user clicks the expand toggle button (PanelLeftOpen icon) while sidebar is collapsed
- **THEN** the sidebar SHALL animate to 280px width
- **AND** all labels SHALL reappear with a fade-in transition

### Requirement: Sidebar navigation items have improved hover and active states

Navigation items in the sidebar SHALL have distinct hover and active visual states that are clear and accessible.

#### Scenario: Active item shows secondary color background

- **WHEN** the current route matches a navigation item
- **THEN** the active item SHALL have `bg-tu-secondary` background and `text-tu-text-primary` text color
- **AND** the active item SHALL have a left border indicator (3px solid `--tu-secondary`)

#### Scenario: Hover state shows subtle highlight

- **WHEN** user hovers over a non-active navigation item
- **THEN** the item SHALL show `bg-white/10` background with a smooth 150ms transition
- **AND** the text SHALL change from `text-white/70` to `text-white`

#### Scenario: Icon and label are properly spaced

- **WHEN** sidebar is expanded (280px)
- **THEN** each navigation item SHALL have 16px gap between icon and label
- **AND** icon size SHALL be 20px
- **AND** label SHALL use 14px font size with medium weight

### Requirement: Sidebar has clear section headings

The sidebar SHALL display section headings to separate platform modules from administrative modules.

#### Scenario: Platform section heading is visible

- **WHEN** sidebar is expanded
- **THEN** a "เมนูหลัก" section heading SHALL appear above platform navigation items
- **AND** the heading SHALL use `text-[11px] font-semibold uppercase tracking-wider text-white/50`
- **AND** the heading SHALL have top/bottom padding of 8px and left padding of 16px

#### Scenario: Admin section heading is visible

- **WHEN** current user has admin roles (super_admin, system_admin, dean, dept_admin)
- **AND** sidebar is expanded
- **THEN** a "ดูแลระบบ" section heading SHALL appear above admin navigation items
- **AND** a subtle divider line SHALL separate platform and admin sections

#### Scenario: Section headings are hidden when collapsed

- **WHEN** sidebar is collapsed (72px)
- **THEN** section headings SHALL NOT be visible

### Requirement: Sidebar colors reference globals.css design tokens only

All sidebar background, text, border, and state colors SHALL use CSS variables from `globals.css` via Tailwind `tu-*` utility classes.

#### Scenario: Sidebar uses only --tu-* color tokens

- **WHEN** sidebar renders
- **THEN** sidebar background SHALL use `bg-tu-primary-active` (maps to `--tu-primary-active`)
- **AND** active nav item SHALL use `bg-tu-secondary text-tu-text-primary`
- **AND** inactive nav text SHALL use `text-white/70` and `hover:text-white`
- **AND** NO raw hex colors or Tailwind palette colors (e.g., `bg-red-900`, `bg-gray-800`) SHALL be used
