## Why

Currently, most pages display hardcoded mock data and buttons modify local state only — no data is persisted to the database. Users cannot actually create, edit, delete, or query real records. This change converts every module from mock/demo mode to fully functional with real API integration, making the platform usable for production.

## What Changes

- **Intranet**: Migrate announcements, calendar, contacts, and org stats from `MOCK_*` arrays to real `/api/intranet/*` and `/api/announcements` API calls
- **Book Meeting**: Migrate rooms and bookings from `MOCK_ROOMS`/`MOCK_BOOKINGS` to real `/api/book-meeting` CRUD
- **Documents**: Migrate document list from `MOCK_DOCS` to real `/api/documents` with upload/download/delete
- **Projects**: Migrate kanban board from `INITIAL_PROJECTS` to real `/api/projects` with drag-drop persistence
- **Users & Roles**: Migrate 5 pages (user management, role management, permission management, AD sync) from local state to real `/api/users` CRUD
- **Audit Log**: Migrate 4 pages (activity log, login history, security events, export) from generated mock data to real `/api/audit-logs`
- **HR Management**: Migrate personnel, leave, attendance, payroll tabs from mock to real `/api/hr`
- **Academic Management**: Migrate exams, schedule, curriculum, requests tabs from hardcoded data to real API
- **ERP Finance**: Create `/api/erp/finance` endpoint and migrate GL data from mock to real
- **Settings**: Create persistence API for system configuration (auth, SSO, branding, storage, API keys)

## Capabilities

### New Capabilities

- `functional-core-modules`: Intranet, Book Meeting, Documents, Projects — migrate from mock data to real API CRUD with loading/empty/error states
- `functional-admin-modules`: Users & Roles (5 pages), Audit Log (4 pages), Settings — migrate from mock to real API with proper permission guards
- `functional-app-hub-modules`: HR Management, Academic Management, ERP Finance — migrate app hub sub-modules to real data

### Modified Capabilities

_None._ This change replaces mock data with API calls in existing pages without changing spec-level behavior.

## Impact

- **Pages**: ~24 page files modified across all modules
- **APIs**: 1 new route (`/api/erp/finance`), existing routes verified and enhanced
- **Components**: No new components; existing pages restructured for data fetching
- **No breaking changes**: All APIs already exist and are compatible
