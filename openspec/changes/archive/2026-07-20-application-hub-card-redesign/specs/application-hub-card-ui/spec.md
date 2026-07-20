## ADDED Requirements

### Requirement: Application Hub stat cards use platform-consistent design
Stat cards SHALL use the same design as Intranet/Dashboard: label left-top, icon right, large number (`text-4xl`), no sub-text.

#### Scenario: Stat cards match intranet style
- **WHEN** Application Hub page loads
- **THEN** 4 stat cards SHALL render with label on left, icon on right
- **AND** each card SHALL use `rounded-2xl border shadow-sm` with hover scale effect

### Requirement: Application cards use rounded-2xl with shadow
All application cards (Grid and List) SHALL use `rounded-2xl border shadow-sm hover:shadow-md hover:scale-[1.02]`.

#### Scenario: Grid card hover
- **WHEN** user hovers over a grid card
- **THEN** the card SHALL scale up and show shadow

### Requirement: User count removed from app cards
AppGroup interface and card rendering SHALL NOT include user count.

#### Scenario: No user count displayed
- **WHEN** Application Hub renders cards
- **THEN** no user count text SHALL appear

### Requirement: Grid/List toggle uses dashboard-style container
The view mode toggle SHALL use `inline-flex p-1 rounded-xl bg-tu-bg/70 border border-tu-border`.

#### Scenario: Toggle matches dashboard
- **WHEN** Application Hub renders
- **THEN** the Grid/List toggle SHALL match the dashboard view selector style
- **AND** active state SHALL use `bg-tu-primary text-white shadow-sm`
