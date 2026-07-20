## ADDED Requirements

### Requirement: Department dashboard has dept tabs above view selector

The Dashboard BI section SHALL display department tabs (ฝ่ายวิชาการ, ฝ่ายเทคโนโลยีสารสนเทศ, ฝ่ายสนับสนุน) above the 5-view segmented control, below the section description.

#### Scenario: Layout order is header → dept tabs → view selector → chart

- **WHEN** Dashboard renders the "Dashboard แยกรายฝ่าย" section
- **THEN** the section header ("Dashboard แยกรายฝ่าย" + "ข้อมูล BI แสดงผลตามมุมมองที่เลือก") SHALL appear first
- **AND** department tabs (ฝ่ายวิชาการ / ฝ่ายเทคโนโลยีสารสนเทศ / ฝ่ายสนับสนุน) SHALL appear below the header
- **AND** the 5-view segmented control (Overview/Weekly/Trend/Proportion/Comparison) SHALL appear below the department tabs
- **AND** the Chart Area (Recharts) SHALL appear at the bottom

#### Scenario: Department tabs use pill-style

- **WHEN** department tabs render
- **THEN** tabs SHALL follow the standard pattern from Section 5.4a: `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`
- **AND** active tab SHALL use `bg-tu-primary text-white shadow-sm`
- **AND** inactive tabs SHALL use `text-tu-text-secondary`

#### Scenario: Selecting a department changes chart data

- **WHEN** user clicks "ฝ่ายเทคโนโลยีสารสนเทศ" tab
- **THEN** the chart data SHALL update to show IT department metrics
- **AND** the selected department SHALL persist in the active view
- **WHEN** user then switches views (e.g., to "Weekly")
- **THEN** the chart SHALL show IT department weekly data

### Requirement: Department tab is persisted in URL

The selected department SHALL be persisted via URL query parameter.

#### Scenario: Department tab persists in URL

- **WHEN** user selects "ฝ่ายวิชาการ"
- **THEN** the URL query parameter `?dept=academic` SHALL be set
- **AND** refreshing the page SHALL restore the selected department

### Requirement: Each department supports 5 view modes

Each department SHALL support 5 view modes: Overview, Weekly, Trend, Proportion, and Comparison.

#### Scenario: Segmented control shows 5 view options

- **WHEN** a department tab is active
- **THEN** a segmented control (pill-style) SHALL display with 5 options: "Overview", "Weekly", "Trend", "Proportion", "Comparison"
- **AND** each option SHALL show its associated icon (TrendingUp, BarChart3, TrendingUp, PieChart, Activity)
- **AND** icon size SHALL be 14px

#### Scenario: View mode is persisted in URL

- **WHEN** user selects a view mode
- **THEN** the URL query parameter `?view=weekly` SHALL be set
- **AND** refreshing the page SHALL restore the selected view

### Requirement: Comparison view is role-gated

The Comparison view SHALL only be visible to users with role level ≥ 70 (Dean and above).

#### Scenario: Comparison hidden for low-level users

- **WHEN** a user with role level below 70 (User, Viewer, Dept Admin) views the dashboard
- **THEN** the "Comparison" option SHALL NOT appear in the segmented control

### Requirement: Charts use Recharts with globals.css color tokens

All department dashboard charts SHALL use Recharts with colors from `globals.css` design tokens.

#### Scenario: Charts render with Recharts and --tu-* colors

- **WHEN** any department chart renders
- **THEN** the chart SHALL use Recharts components (AreaChart, BarChart, LineChart, PieChart)
- **AND** chart colors SHALL be derived from `--tu-*` CSS variables via `useChartPalette` hook
- **AND** NO hardcoded hex colors SHALL be used directly in chart components

### Requirement: Department dashboard UI colors reference globals.css

All tab, segmented control, and chart container colors SHALL use CSS variables from `globals.css` via Tailwind `tu-*` utility classes.

#### Scenario: Department UI uses only --tu-* color tokens

- **WHEN** department dashboard renders
- **THEN** tab container SHALL use `bg-tu-surface border border-tu-border`
- **AND** active tab/pill SHALL use `bg-tu-primary text-white shadow-sm`
- **AND** inactive tab/pill SHALL use `text-tu-text-secondary`
- **AND** chart card SHALL use `bg-tu-surface border border-tu-border rounded-2xl shadow-sm`
- **AND** NO raw hex colors or Tailwind palette colors SHALL be used

### Requirement: Department dashboard has tabs for 3 departments

The Dashboard SHALL display department-specific dashboards accessible via tabs: ทั้งหมด, ฝ่ายวิชาการ, ฝ่ายเทคโนโลยีสารสนเทศ, and ฝ่ายสนับสนุน.

#### Scenario: Department tabs are visible at the top of dashboard content

- **WHEN** Dashboard page loads
- **THEN** 4 tabs SHALL display: "ทั้งหมด", "ฝ่ายวิชาการ", "ฝ่ายเทคโนโลยีสารสนเทศ", "ฝ่ายสนับสนุน"
- **AND** "ทั้งหมด" SHALL be selected by default
- **AND** tabs SHALL follow the standard tab selector pattern (Section 5.4a): `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`

#### Scenario: Selecting a department tab changes the dashboard data

- **WHEN** user clicks "IT" tab
- **THEN** the dashboard content SHALL update to show IT department statistics and charts
- **AND** the "IT" tab SHALL be styled as active (bg-tu-primary text-white)
- **WHEN** user clicks "ทั้งหมด"
- **THEN** the dashboard SHALL show aggregate data from all departments

#### Scenario: Department tab is persisted in URL

- **WHEN** user selects a department tab
- **THEN** the URL query parameter `?dept=it` SHALL be set
- **AND** refreshing the page SHALL restore the selected department

### Requirement: Each department view has 5 view modes via segmented control

Each department dashboard SHALL support 5 view modes: Overview, Weekly, Trend, Proportion, and Comparison — controlled by a segmented pill control.

#### Scenario: Segmented control shows 5 view options

- **WHEN** a department tab is active
- **THEN** a segmented control (pill-style) SHALL display with 5 options: "Overview", "Weekly", "Trend", "Proportion", "Comparison"
- **AND** each option SHALL show its associated icon (TrendingUp, BarChart3, TrendingUp, PieChart, Activity)
- **AND** the control SHALL follow the standard pattern from Section 5.4a
- **AND** icon size SHALL be 14px

#### Scenario: Selecting a view mode changes the displayed charts

- **WHEN** user clicks "Weekly" in the segmented control
- **THEN** the chart area SHALL switch to show Weekly view (bar chart by day)
- **AND** the active pill SHALL use `bg-tu-primary text-white shadow-sm`
- **AND** inactive pills SHALL use `text-tu-text-secondary`

#### Scenario: View mode is persisted in URL

- **WHEN** user selects a view mode
- **THEN** the URL query parameter `?view=weekly` SHALL be set
- **AND** refreshing the page SHALL restore the selected view

### Requirement: Department dashboard charts use Recharts with BI color guidelines

All department dashboard charts SHALL use Recharts with semantic colors appropriate for business intelligence visualization, not restricted to brand colors.

#### Scenario: Charts use semantic color palette

- **WHEN** any department chart renders
- **THEN** chart colors SHALL be derived from a BI semantic palette including: `--tu-primary`, `--tu-info`, `--tu-success`, `--tu-warning`, `--tu-error` plus derived lighter/darker shades
- **AND** multiple data series SHALL use distinct, distinguishable colors
- **AND** colors SHALL NOT be overly saturated or garish
- **AND** color-blind friendly alternatives SHALL be preferred where possible

#### Scenario: Chart color palette provides adequate variety

- **WHEN** a chart with 5+ data series renders
- **THEN** the color palette SHALL support at least 8 distinct semantic colors
- **AND** each color SHALL have sufficient contrast ratio against the card background (≥ 3:1)

### Requirement: Charts are responsive within their containers

All department dashboard charts SHALL resize to fit their container.

#### Scenario: Charts resize on viewport change

- **WHEN** browser window is resized or sidebar is toggled
- **THEN** all charts SHALL resize smoothly using Recharts `ResponsiveContainer`
- **AND** chart aspect ratios SHALL be maintained (minHeight for charts: Overview 300px, Weekly 350px, Trend 350px, Proportion 300px, Comparison 350px)

### Requirement: Department dashboard UI colors reference globals.css design tokens only

All tab, segmented control, chart container, and layout colors SHALL use CSS variables from `globals.css` via Tailwind `tu-*` utility classes.

#### Scenario: Department UI uses only --tu-* color tokens

- **WHEN** department dashboard renders
- **THEN** tab container SHALL use `bg-tu-surface border border-tu-border`
- **AND** active tab/pill SHALL use `bg-tu-primary text-white shadow-sm`
- **AND** inactive tab/pill SHALL use `text-tu-text-secondary`
- **AND** chart card backgrounds SHALL use `bg-tu-surface border border-tu-border rounded-2xl shadow-sm`
- **AND** NO raw hex colors or Tailwind palette colors (e.g., `bg-white`, `bg-blue-500`) SHALL be used in any UI element

### Requirement: No department summary cards below BI chart area

The Dashboard SHALL NOT display separate department summary cards below the BI chart area — department data is accessed exclusively through the department tabs.

#### Scenario: No department cards rendered

- **WHEN** Dashboard renders the department dashboard section
- **THEN** only the BI chart area with tabs and segmented control SHALL be displayed
- **AND** NO separate grid of department summary cards (ฝ่ายวิชาการ / ฝ่ายเทคโนโลยีสารสนเทศ / ฝ่ายสนับสนุน) SHALL appear below the BI chart
