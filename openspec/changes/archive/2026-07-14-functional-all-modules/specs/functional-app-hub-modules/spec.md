## ADDED Requirements

### Requirement: HR Management fetches real personnel data

The HR Management page SHALL fetch personnel, leave, attendance, payroll, evaluation, and training data from `/api/hr` instead of `MOCK_PERSONNEL`, `MOCK_LEAVE`, `MOCK_ATTENDANCE`, `MOCK_PAYROLL`.

#### Scenario: Personnel tab loads

- **WHEN** a user with `HR_VIEW` permission navigates to HR Management → Personnel
- **THEN** the system SHALL fetch personnel profiles from `GET /api/hr`

#### Scenario: Leave tab displays leaves

- **WHEN** a user navigates to the Leave tab
- **THEN** the system SHALL fetch leave requests from the HR API

#### Scenario: Attendance tab displays records

- **WHEN** a user navigates to the Attendance tab
- **THEN** the system SHALL fetch attendance records from the HR API

#### Scenario: Payroll tab displays payslips

- **WHEN** a user with `HR_PAYROLL` permission navigates to Payroll
- **THEN** the system SHALL fetch payslip summaries from the HR API

---

### Requirement: Academic Management fetches real academic data

The Academic Management page SHALL fetch curriculum, courses, class schedule, examination schedule, and student requests from the academic API.

#### Scenario: Courses tab loads real courses

- **WHEN** a user navigates to Academic Management → Courses
- **THEN** the system SHALL fetch courses from `GET /api/academic`

#### Scenario: Examination Schedule displays real exams

- **WHEN** a user navigates to the Examination Schedule tab
- **THEN** the system SHALL fetch exam schedules from the academic API instead of hardcoded `mockExams`

#### Scenario: Class Schedule displays real schedule

- **WHEN** a user navigates to the Class Schedule tab
- **THEN** the system SHALL fetch class schedules from the academic API

#### Scenario: Curriculum tab displays real curriculum

- **WHEN** a user navigates to the Curriculum tab
- **THEN** the system SHALL fetch curriculum data from the academic API

#### Scenario: Student Requests tab displays real requests

- **WHEN** a user navigates to the Student Requests tab
- **THEN** the system SHALL fetch student requests from the academic API

---

### Requirement: ERP Finance fetches real GL data

The ERP Finance page SHALL fetch general ledger entries from a new `/api/erp/finance` endpoint instead of `MOCK_GL`.

#### Scenario: Finance tab loads GL entries

- **WHEN** a user navigates to ERP → Finance
- **THEN** the system SHALL fetch GL entries from `GET /api/erp/finance`

#### Scenario: Creating a journal entry

- **WHEN** a user with `ERP_MANAGE` permission creates a journal entry
- **THEN** the system SHALL POST to `/api/erp/finance` and refresh the GL list

---

### Requirement: Application Hub main page shows real stats

The Application Hub main page SHALL fetch real-time statistics from `/api/application-hub/stats` instead of computing stats from the local `appGroups` array.

#### Scenario: Hub stats display

- **WHEN** a user navigates to Application Hub
- **THEN** the system SHALL fetch stats (total systems, active users, online, maintenance) from the API
