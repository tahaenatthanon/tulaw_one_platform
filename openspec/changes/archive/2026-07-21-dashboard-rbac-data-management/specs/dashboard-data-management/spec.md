## ADDED Requirements

### Requirement: Dashboard Data Update API

The system SHALL provide a PUT endpoint for authorized users to update dashboard data.

#### Scenario: PUT to update weekly data

- **WHEN** a user with `DASHBOARD_EDIT` sends PUT `/api/dashboard/stats` with body `{ type: "weekly", department: "it", data: [...] }`
- **THEN** the system SHALL validate the user's department scope
- **AND** if authorized, SHALL persist the updated data to the database
- **AND** return the updated data with HTTP 200

#### Scenario: Unauthorized user attempts update

- **WHEN** a user without `DASHBOARD_EDIT` sends PUT `/api/dashboard/stats`
- **THEN** the system SHALL return HTTP 403 with error "ไม่มีสิทธิ์แก้ไขข้อมูล Dashboard"

#### Scenario: Update out-of-scope department

- **WHEN** a Dept Admin tries to update data for a department other than their own
- **THEN** the system SHALL return HTTP 403

#### Scenario: Auto-refresh after update

- **WHEN** dashboard data is updated successfully
- **THEN** the frontend SHALL revalidate its SWR cache
- **AND** the new data SHALL be displayed immediately without page reload

### Requirement: Dashboard Data Persistence

The system SHALL store manual dashboard data in a database table for persistence.

#### Scenario: Save dashboard stat entry

- **WHEN** a user updates dashboard data
- **THEN** the system SHALL save or upsert a record in the `DashboardStat` table with fields: department, statType, month, values (JSON), updatedBy, updatedAt

#### Scenario: Retrieve dashboard stats for a department

- **WHEN** the frontend requests dashboard data for a department
- **THEN** the system SHALL merge auto-computed live stats with manually updated stats (manual takes priority)

### Requirement: Dashboard Permission Model

The system SHALL store dashboard access permissions per user.

#### Scenario: Store dashboard permissions

- **WHEN** an admin sets dashboard permissions
- **THEN** the system SHALL store in `DashboardPermission` or a user metadata field: `{ canEditDashboard: boolean, editableDepartments: string[] }`

#### Scenario: Auto-scope editing for Dept Admin

- **WHEN** a Dept Admin is created
- **THEN** their `DASHBOARD_EDIT` scope SHALL automatically be limited to their own department
