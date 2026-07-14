## 1. Shared Infrastructure

- [x] 1.1 Install `swr` package — `npm install swr`
- [x] 1.2 Create `lib/fetcher.ts` — shared typed fetch wrapper with auth headers and error handling

## 2. Missing API Routes

- [x] 2.1 Create `/api/erp/finance/route.ts` — GET (list GL entries with pagination), POST (create journal entry)
- [x] 2.2 Create `/api/settings/route.ts` — GET (read all settings), PUT (update settings by module) with JSON persistence
- [x] 2.3 Enhance `/api/academic/route.ts` — add endpoints for curriculum, class schedule, exam schedule, student requests if missing

## 3. Core Modules (Intranet, Book Meeting, Documents, Projects)

- [x] 3.1 Migrate Intranet announcements tab from `MOCK_ANNOUNCEMENTS` to `GET /api/announcements` with SWR, loading/empty/error states
- [x] 3.2 Migrate Intranet calendar tab from `CALENDAR_EVENTS` to calendar API
- [x] 3.3 Migrate Intranet contacts tab from `MOCK_DEPARTMENTS` to departments API
- [x] 3.4 Migrate Intranet org stats from hardcoded to stats API
- [x] 3.5 Wire Intranet create/edit/delete/publish announcements to real API calls with toast feedback
- [x] 3.6 Migrate Book Meeting rooms/bookings from `MOCK_ROOMS`/`MOCK_BOOKINGS` to `GET /api/book-meeting` with SWR
- [x] 3.7 Wire Book Meeting create/confirm/cancel operations to real API
- [x] 3.8 Migrate Documents list from `MOCK_DOCS` to `GET /api/documents` with SWR
- [x] 3.9 Wire Documents upload/delete operations to real API with refresh
- [x] 3.10 Migrate Projects kanban from `INITIAL_PROJECTS` to `GET /api/projects` with SWR
- [x] 3.11 Wire Projects create/edit/drag-drop (status change)/approve/reject to real API

## 4. Admin Modules (Users & Roles, Audit Log, Settings)

- [x] 4.1 Migrate User Management from `generateUsers()` to `GET /api/users` with pagination/search/filter
- [x] 4.2 Wire User Management add/edit/delete to real API with permission guards
- [x] 4.3 Migrate Role Management from hardcoded roles to API data with real user counts
- [x] 4.4 Migrate Permission Management from hardcoded groups to API data
- [x] 4.5 Migrate AD Sync to fetch real sync status from API
- [x] 4.6 Migrate Activity Log from `generateLogs()` to `GET /api/audit-logs` with pagination/filters
- [x] 4.7 Migrate Login History from `mockLogins` to real API data
- [x] 4.8 Migrate Security Events from hardcoded events to real API
- [x] 4.9 Wire Export Logs to download CSV from `/api/audit-logs?format=csv`
- [x] 4.10 Migrate Settings page to use `/api/settings` for persistence — save and load all configuration tabs

## 5. App Hub Sub-Modules (HR, Academic, ERP Finance)

- [x] 5.1 Migrate HR Management Personnel tab from `MOCK_PERSONNEL` to `GET /api/hr`
- [x] 5.2 Migrate HR Management Leave/Attendance/Payroll tabs from mock to API
- [x] 5.3 Migrate Academic Management Exams/Schedule/Curriculum/Requests tabs from hardcoded data to API
- [x] 5.4 Migrate ERP Finance tab from `MOCK_GL` to `GET /api/erp/finance`
- [x] 5.5 Migrate Application Hub main page stats from local computation to `GET /api/application-hub/stats`

## 6. Dashboard Cleanup

- [x] 6.1 Replace hardcoded `NewsCard` news items with announcements API data
- [x] 6.2 Remove API fallback mock data from `/api/dashboard/stats` and `/api/dashboard/department-stats` once DB is seeded
