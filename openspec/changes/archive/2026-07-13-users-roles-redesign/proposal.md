## Why

หน้า User Management ปัจจุบันเป็น mock data พื้นฐาน 6 users ต้องการ redesign ใหม่ตาม requirement: role stats, search+role filter, status filter, full table with AD sync, CSV import, add user dialog

## What Changes

- 6 role stat cards (Super Admin/System Admin/Dean/Dept Admin/User/Viewer)
- Search + role dropdown filter
- Status filter: all/active/inactive/MFA pending
- Table: name, email, role, department, status, last AD sync
- AD Sync button with 15-min auto-sync note
- Add user dialog (manual)
- CSV import dialog
- Support 300+ users with mock data

## Impact

- `app/(dashboard)/users/user-management/page.tsx` — เขียนใหม่
