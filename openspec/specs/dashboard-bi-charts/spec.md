## ADDED Requirements

### Requirement: Dashboard uses recharts for all visualizations

The system SHALL replace all CSS-based div bar charts with recharts library components for all 5 dashboard views.

#### Scenario: Charts render with recharts components

- **WHEN** dashboard page loads
- **THEN** all charts SHALL be rendered using recharts components (AreaChart, BarChart, LineChart, PieChart, etc.)
- **AND** no hand-rolled div-based bar charts SHALL remain

### Requirement: Overview View — Area Chart with KPI Cards

The Overview view SHALL display an Area Chart showing weekly activity trend alongside KPI summary cards with sparkline indicators.

#### Scenario: Overview shows area chart

- **WHEN** user selects "ภาพรวม" (Overview) view
- **THEN** an Area Chart SHALL render showing activity count over the past 7 days
- **AND** the area fill SHALL use `--tu-primary` color with 15% opacity
- **AND** the line SHALL use `--tu-primary` color

#### Scenario: Overview shows KPI stat cards

- **WHEN** Overview view is active
- **THEN** the system SHALL display 4 KPI stat cards (บุคลากร, หลักสูตร, นักศึกษา, กิจกรรมวันนี้)
- **AND** each card SHALL show the metric value prominently with label below
- **AND** each card SHALL include a mini sparkline (LineChart without axes) showing the 7-day trend

### Requirement: Weekly View — Bar Chart by Day

The Weekly view SHALL display a grouped/stacked Bar Chart showing daily activity breakdown by category.

#### Scenario: Weekly bar chart with categories

- **WHEN** user selects "รายสัปดาห์" (Weekly) view
- **THEN** a Bar Chart SHALL render showing each day of the week (จันทร์-อาทิตย์) on the X-axis
- **AND** bars SHALL be color-coded by activity category (Documents, Bookings, Projects, Announcements)
- **AND** each bar group SHALL show tooltip on hover with exact count and percentage

#### Scenario: Weekly chart uses Thai weekday names

- **WHEN** Weekly view renders
- **THEN** X-axis labels SHALL display Thai weekday abbreviations (จ., อ., พ., พฤ., ศ., ส., อา.)

### Requirement: Trend View — Multi-Series Line Chart

The Trend view SHALL display a multi-series Line Chart showing 3 metrics over 7 months.

#### Scenario: Trend shows 3 line series

- **WHEN** user selects "แนวโน้ม" (Trend) view
- **THEN** a Line Chart SHALL render with 3 line series: Documents, Bookings, Projects
- **AND** each line SHALL use a distinct color from the TULAW design palette
- **AND** data points SHALL show as dots on each line

#### Scenario: Trend shows monthly data points

- **WHEN** Trend view renders
- **THEN** X-axis SHALL display 7 months in Thai abbreviation (ม.ค., ก.พ., ...)
- **AND** Y-axis SHALL show count values
- **AND** hovering over a data point SHALL display exact value with month and series name

#### Scenario: Trend chart is interactive

- **WHEN** user hovers over a line
- **THEN** a tooltip SHALL appear showing month, metric name, and exact value
- **AND** the hovered line SHALL be highlighted while others dim

### Requirement: Proportion View — Donut Charts by Department

The Proportion view SHALL display Donut Charts showing data distribution across departments and a horizontal stacked bar for personnel breakdown.

#### Scenario: Proportion shows donut charts

- **WHEN** user selects "สัดส่วน" (Proportion) view
- **THEN** one or more Donut Charts SHALL render showing distribution of users/documents/projects across departments
- **AND** each donut segment SHALL use a distinct color
- **AND** hovering over a segment SHALL show department name, count, and percentage

#### Scenario: Proportion shows personnel breakdown

- **WHEN** Proportion view is active
- **THEN** a Horizontal Stacked Bar Chart SHALL display personnel distribution by role category (อาจารย์, เจ้าหน้าที่, นักศึกษา, ผู้ดูแลระบบ)
- **AND** each segment SHALL be labeled with role name and percentage

### Requirement: Comparison View — Grouped Bar Chart

The Comparison view SHALL display a Grouped Bar Chart comparing this month vs last month across all metrics.

#### Scenario: Comparison shows grouped bars

- **WHEN** user with role level ≥ 70 selects "เปรียบเทียบ" (Comparison) view
- **THEN** a Grouped Bar Chart SHALL render with two bars per metric category: current month and previous month
- **AND** current month bars SHALL use `--tu-primary` color and previous month bars SHALL use a muted color

#### Scenario: Comparison shows percentage change

- **WHEN** Comparison view renders
- **THEN** each metric group SHALL display the percentage change from last month (e.g., "+12%" or "-5%")
- **AND** positive changes SHALL be shown in `--tu-success` color
- **AND** negative changes SHALL be shown in `--tu-error` color

#### Scenario: Comparison is role-gated

- **WHEN** a user below Dean level (level < 70) accesses the dashboard
- **THEN** the "เปรียบเทียบ" tab SHALL NOT be visible

### Requirement: Charts are responsive

All dashboard charts SHALL resize to fit their container using recharts `ResponsiveContainer`.

#### Scenario: Charts resize on viewport change

- **WHEN** browser window is resized or sidebar is toggled
- **THEN** all charts SHALL resize smoothly to fit the new container width
- **AND** chart aspect ratios SHALL be maintained

### Requirement: Charts use TULAW design tokens

All chart colors SHALL reference CSS custom properties from the TULAW Design System.

#### Scenario: Chart colors match design system

- **WHEN** dashboard renders any chart
- **THEN** chart colors SHALL be derived from `--tu-primary`, `--tu-secondary`, `--tu-success`, `--tu-warning`, `--tu-info`, `--tu-error` CSS variables
- **AND** NO hardcoded hex color values SHALL be used directly in chart components

### Requirement: View tab selector follows standard pattern

The view mode toggle between the 5 views SHALL follow the standard tab selector pattern defined in Section 5.4a of the design guidelines.

#### Scenario: Tab selector uses standard pattern

- **WHEN** dashboard view tabs render
- **THEN** the container SHALL use `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`
- **AND** active tab SHALL use `bg-tu-primary text-white shadow-sm`
- **AND** inactive tabs SHALL use `text-tu-text-secondary`
