## Why

หน้า Settings ปัจจุบันมี 6 sub-pages แยกกันและ redirect ไป `/settings/auth-settings` ต้องการรวมเป็นหน้าเดียว (System Config) พร้อม tabs ครอบคลุมทุกการตั้งค่าตาม requirement

## What Changes

- รวม settings layout + page เป็นหน้าเดียวที่ `/settings`
- 6 tabs: Authentication, SSO/LDAP, UI Branding, Storage & Projects, API Keys, Categories
- Authentication: Session Timeout, JWT Expiry, Max Login Attempts, MFA enforcement
- SSO/LDAP: LDAP URL, Base DN, Domain, Sync settings
- UI Branding: Logo upload, system name, primary color picker
- Storage & Projects: quota per user, file types, project types CRUD
- API Keys: list/create/revoke with permissions + access log
- Categories: announcement categories + project types CRUD

## Impact

- `app/(dashboard)/settings/page.tsx` — เขียนใหม่เป็น unified page
- `app/(dashboard)/settings/layout.tsx` — simplify (remove sub-sidebar)
