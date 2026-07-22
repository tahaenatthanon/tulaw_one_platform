## Requirements

### Requirement: Dashboard Data Scope by Role

The system SHALL filter dashboard data based on the authenticated user's role level and department.

#### Scenario: Dean (level 70+) views dashboard

- **WHEN** a Dean accesses the dashboard
- **THEN** the system SHALL display all 5 views (Overview, Weekly, Trend, Proportion, Comparison)
- **AND** show statistics, charts, and activity logs from all departments
- **AND** allow switching between department tabs

#### Scenario: Department Admin (level 50+) views dashboard

- **WHEN** a Department Admin accesses the dashboard
- **THEN** the system SHALL display 4 views (Overview, Weekly, Trend, Proportion) — Comparison view is hidden
- **AND** filter all data to show only the admin's own department
- **AND** department selector SHALL default to the admin's department and be locked

#### Scenario: User (level 30+) views dashboard

- **WHEN** a User accesses the dashboard
- **THEN** the system SHALL display 3 views (Overview, Weekly, Proportion)
- **AND** show department-level data for the user's own department
- **AND** Comparison and Trend views SHALL be hidden

#### Scenario: Viewer (level 10+) views dashboard

- **WHEN** a Viewer accesses the dashboard
- **THEN** the system SHALL display 2 views (Overview, Weekly)
- **AND** show aggregated public data only

### Requirement: Visible Views Based on Role

The system SHALL restrict which dashboard chart views are visible based on role level.

| Role | Level | Visible Views |
|---|---|---|
| Super Admin | 100 | Overview, Weekly, Trend, Proportion, Comparison |
| System Admin | 80 | Overview, Weekly, Trend, Proportion, Comparison |
| Dean | 70 | Overview, Weekly, Trend, Proportion, Comparison |
| Dept Admin | 50 | Overview, Weekly, Trend, Proportion |
| User | 30 | Overview, Weekly, Proportion |
| Viewer | 10 | Overview, Weekly |

#### Scenario: User cannot see Comparison

- **WHEN** a User (level 30) accesses the dashboard
- **THEN** the "Comparison" view tab SHALL NOT be visible

#### Scenario: Dean can see all views

- **WHEN** a Dean (level 70) accesses the dashboard
- **THEN** all 5 view tabs SHALL be visible

### Requirement: Department-Context Awareness

The system SHALL automatically filter dashboard data by department based on the user's role.

#### Scenario: API returns department-filtered data

- **WHEN** the dashboard API `/api/dashboard/stats` is called
- **THEN** the system SHALL read the user's role and department from the JWT session
- **AND** if the user is Dept Admin (level 50), return only data for their department
- **AND** if the user is Dean+ (level 70+), return all departments data
- **AND** if the user is User (level 30), return department-level summary data

#### Scenario: Frontend respects department filter

- **WHEN** the dashboard page renders
- **THEN** the department tabs SHALL only show departments the user has access to
- **AND** the active department SHALL default to the user's own department

### Requirement: Manual Data Update for Authorized Users

The system SHALL allow users with `DASHBOARD_EDIT` permission to update dashboard data for their authorized scope.

#### Scenario: Dept Admin updates monthly trend data

- **WHEN** a Dept Admin with `DASHBOARD_EDIT` clicks "Edit" on the Trend view
- **THEN** the system SHALL display editable fields for trend data of their department
- **AND** on submit, SHALL PUT to `/api/dashboard/stats` with the updated values
- **AND** SHALL revalidate the SWR cache to display new data immediately

#### Scenario: Dean updates data for any department

- **WHEN** a Dean with `DASHBOARD_EDIT` edits trend data
- **THEN** the system SHALL allow selecting which department to edit
- **AND** on submit, SHALL update data for the selected department

#### Scenario: User without DASHBOARD_EDIT cannot edit

- **WHEN** a User without `DASHBOARD_EDIT` permission views the dashboard
- **THEN** no edit buttons SHALL be visible
- **AND** all data SHALL be read-only

#### Scenario: Edit historical monthly data

- **WHEN** an authorized user edits dashboard data
- **THEN** the system SHALL allow selecting which month's data to edit
- **AND** SHALL upsert the record for that specific department + type + month combination
