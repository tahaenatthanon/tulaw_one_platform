## Purpose

This specification defines the Business Intelligence (BI) chart requirements for the Dashboard module. It covers all five dashboard views (Overview, Weekly, Trend, Proportion, Comparison) and defines the chart library, visual styles, color tokens, responsiveness, and role-gating rules.
## Requirements
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
- **AND** minimum chart heights SHALL be: Overview area chart 250px, Weekly bar chart 300px, Trend line chart 300px, Proportion donut 280px, Comparison bar 300px

### Requirement: Charts use TULAW design tokens

All chart colors SHALL reference CSS custom properties from the TULAW Design System and the BI semantic palette.

#### Scenario: Chart colors match design system

- **WHEN** dashboard renders any chart
- **THEN** chart colors SHALL be derived from CSS variables: `--tu-primary`, `--tu-info`, `--tu-success`, `--tu-warning`, `--tu-error`, plus BI-specific shades from the chart color hook
- **AND** NO hardcoded hex color values SHALL be used directly in chart components (except within the chart color hook definition)
- **AND** the chart color hook (`useChartPalette`) SHALL be the single source of truth for chart color arrays

### Requirement: View tab selector follows standard pattern

The view mode toggle between the 5 views SHALL follow the standard tab selector pattern defined in Section 5.4a of the design guidelines.

#### Scenario: Tab selector uses standard pattern

- **WHEN** dashboard view tabs render
- **THEN** the container SHALL use `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`
- **AND** active tab SHALL use `bg-tu-primary text-white shadow-sm`
- **AND** inactive tabs SHALL use `text-tu-text-secondary`
- **AND** each tab SHALL include an icon (size 14px) alongside the label
- **AND** the tab selector SHALL appear inside each department tab's content area

### Requirement: Charts use BI semantic color palette

All dashboard charts SHALL use a business intelligence semantic color palette that includes brand colors plus additional shades for data distinction across all 5 views.

#### Scenario: BI palette supports multiple data series

- **WHEN** any chart with 2+ data series renders
- **THEN** each series SHALL use a distinct color from the BI palette
- **AND** the palette SHALL include at minimum: #A31D1D (primary red), #2563EB (info blue), #16A34A (success green), #D97706 (warning amber), #7C3AED (purple), #0891B2 (cyan), #DB2777 (pink), #65A30D (lime)
- **AND** colors SHALL be applied via a chart color hook (`useChartPalette`) that accepts index-based lookup

#### Scenario: Chart colors maintain accessibility contrast

- **WHEN** charts render with colored elements
- **THEN** all chart text and data labels SHALL have contrast ratio ≥ 4.5:1 against their background
- **AND** adjacent series in bar/area charts SHALL be visually distinguishable

### Requirement: Overview View shows enhanced KPI cards with sparklines

The Overview view SHALL display 4 KPI stat cards, each with a mini sparkline showing the 7-day trend.

#### Scenario: Each KPI card has a sparkline

- **WHEN** Overview view is active
- **THEN** each of the 4 KPI stat cards SHALL include a small LineChart (sparkline) without axes, showing the last 7 days of data
- **AND** the sparkline SHALL be 80px wide and 32px tall
- **AND** the sparkline color SHALL match the card's semantic color

#### Scenario: Overview shows recent activity feed

- **WHEN** Overview view is active
- **THEN** a "Recent Activity" section SHALL display below the KPI cards
- **AND** it SHALL show the 5 most recent system activities with timestamps and user names
- **AND** each activity item SHALL include an icon indicating the activity type (document, booking, project, announcement)

### Requirement: Weekly View shows bar chart with data table

The Weekly view SHALL display a bar chart alongside a data table for the weekly breakdown.

#### Scenario: Weekly view shows detailed table below chart

- **WHEN** Weekly view is active
- **THEN** a data table SHALL appear below the bar chart
- **AND** the table SHALL show columns: วัน, เอกสาร, การจอง, โครงการ, ประกาศ, รวม
- **AND** the "รวม" column SHALL use bold font weight
- **AND** the table SHALL have alternating row colors (bg-tu-bg on even rows)

### Requirement: Trend View shows heatmap-style monthly indicator

The Trend view SHALL display a compact heatmap indicator alongside the line chart for at-a-glance monthly performance.

#### Scenario: Trend view has heatmap indicator

- **WHEN** Trend view is active
- **THEN** a 7-cell heatmap strip SHALL appear above or beside the line chart
- **AND** each cell SHALL represent one month with color intensity proportional to total activity
- **AND** darker cells SHALL indicate higher activity months
- **AND** hovering over a cell SHALL show the month name and total count

#### Scenario: Trend view shows growth percentage

- **WHEN** Trend view renders with monthly data
- **THEN** a growth indicator (e.g., "+15% จากเดือนก่อน") SHALL display
- **AND** positive growth SHALL use `text-tu-success` with TrendingUp icon
- **AND** negative growth SHALL use `text-tu-error` with TrendingDown icon

### Requirement: Proportion View uses donut charts with center label

The Proportion view SHALL display donut charts with a center label showing the total count, plus a stacked bar for breakdown.

#### Scenario: Donut chart shows total in center

- **WHEN** Proportion view renders a donut chart
- **THEN** the center of each donut SHALL display the total count in bold text
- **AND** the label below the total SHALL show "ทั้งหมด" in small text

#### Scenario: Proportion shows stacked bar breakdown

- **WHEN** Proportion view is active
- **THEN** a horizontal stacked bar chart SHALL display below the donut charts
- **AND** the stacked bar SHALL show distribution across personnel categories (อาจารย์, เจ้าหน้าที่, นักศึกษา, ผู้ดูแลระบบ)
- **AND** each segment SHALL be labeled with category name and count

### Requirement: Comparison View shows side-by-side cards with grouped bars

The Comparison view SHALL display both comparison stat cards and a grouped bar chart for this month vs last month.

#### Scenario: Comparison shows stat comparison cards

- **WHEN** Comparison view is active
- **THEN** side-by-side comparison cards SHALL display for each metric
- **AND** each card SHALL show current month value, last month value, and percentage change
- **AND** a delta indicator (green up arrow / red down arrow) SHALL accompany each percentage

#### Scenario: Comparison bar chart uses grouped layout

- **WHEN** Comparison view renders the bar chart
- **THEN** bars SHALL be grouped by metric with current month and last month side by side
- **AND** current month bars SHALL use `--tu-primary` color
- **AND** last month bars SHALL use a lighter shade of the same color (opacity: 0.4)

### Requirement: Dashboard cards follow new card design system

All dashboard cards (stats, charts, announcements) SHALL use the updated card design with larger border radius, subtle shadow, and smooth hover transitions.

#### Scenario: Cards use updated design tokens

- **WHEN** any dashboard card renders
- **THEN** the card SHALL have `border-radius: 16px` (rounded-2xl)
- **AND** the card SHALL have `border: 1px solid var(--tu-border)`
- **AND** the card SHALL have `shadow-sm`
- **AND** background SHALL be `bg-tu-surface`
- **AND** hover SHALL trigger `hover:shadow-md` with `transition-shadow duration-200`

### Requirement: All dashboard UI colors reference globals.css design tokens only

Every UI element in the dashboard (cards, text, borders, backgrounds, badges, buttons) SHALL use CSS variables from `globals.css` via Tailwind `tu-*` utility classes. No raw hex colors or Tailwind palette colors are permitted.

#### Scenario: Dashboard uses only --tu-* color tokens

- **WHEN** any dashboard component renders
- **THEN** ALL color-related classes SHALL use `tu-*` prefixed Tailwind utilities that map to `--tu-*` CSS variables (e.g., `bg-tu-surface`, `text-tu-text-primary`, `border-tu-border`)
- **AND** transparent/opacity variants of `tu-*` tokens SHALL use Tailwind opacity modifier syntax (e.g., `bg-tu-primary/15`, `border-tu-error/20`)
- **AND** NO raw hex color values (e.g., `#A31D1D`, `bg-[#A31D1D]`) SHALL appear in any component
- **AND** NO Tailwind palette colors (e.g., `bg-white`, `bg-gray-100`, `text-red-500`) SHALL appear in any component
- **AND** the only exception is `text-white` for text on dark backgrounds (e.g., sidebar, primary buttons) which maps to `--tu-text-inverse`

