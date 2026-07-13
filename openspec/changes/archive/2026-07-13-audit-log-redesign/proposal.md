## Why

Audit Log ปัจจุบันเป็น mock data 6 records ต้องการ redesign: 8+ event types, filters (date/type/user/IP), export CSV, immutable badge, 100+ mock records

## Changes

- 8+ event types: DOC_UPLOAD, CONFIG_UPDATE, PROJECT_APPROVE, AD_SYNC, USER_LOGIN, USER_LOGIN_FAILED, DASHBOARD_VIEW, ROLE_CREATE
- Table: Timestamp, User, Event Type, Detail, IP, Role
- Filters: date range, event type, user, IP address
- Export CSV button
- Immutable badge + note
- 100+ mock logs

## Impact

- `app/(dashboard)/audit-log/activity-log/page.tsx`
