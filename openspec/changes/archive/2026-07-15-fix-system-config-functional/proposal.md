## Why

System Configuration (Settings) module มี UI ครบถ้วน (6 tabs + sub-pages) แต่**ทำงานไม่ได้จริง** — ทุกอย่างเป็น local state/hardcoded/in-memory store, API `/api/settings` ใช้ in-memory object (หายเมื่อ server restart), ระบบย่อยที่ควรใช้งานได้จริงยังพังทั้งหมด: Auth/SSO/LDAP ไม่มี persistence, Branding เปลี่ยนสีแล้วไม่มีผลกับทั้งระบบ, Storage quota ไม่ enforce, API Keys สร้างแล้วไม่มีผล, Categories เพิ่มไม่ได้จริง, ไม่มี tab จัดการห้องประชุมและสถานะ application

## What Changes

- **ทำให้ระบบใช้ได้จริง**: เปลี่ยน API `/api/settings` จาก in-memory store → ใช้ Prisma DB table (`SystemConfig`), persist ทุกการตั้งค่า
- **Authentication ใช้ได้จริง**: Auth settings (session timeout, JWT expiry, max login attempts, MFA) persist ลง DB และ middleware อ่านค่า real-time
- **SSO/LDAP ใช้ได้จริง**: SSO config persist ลง DB, LDAP settings มีผลกับการทำงานจริง
- **UI Branding เปลี่ยนสีแล้วทำให้เปลี่ยนทั้งระบบ**: ระบบใช้ CSS variables จาก `globals.css` อยู่แล้ว — เพิ่ม API endpoint ให้ branding settings update CSS variables แบบ runtime (หรือ regenerate globals.css)
- **Storage & Projects กำหนดขนาดได้จริง**: Storage quota + file types persist ลง DB, enforce ใน upload API, เอา project types ออก (ไม่ใช้แล้ว — ใช้ประเภทจาก DB แทน)
- **API Keys ใช้ได้จริง**: สร้าง/revoke API keys ผ่าน DB, validate ใน middleware, แสดง masked key ให้ copy ได้
- **Categories เพิ่ม/ลบ/แก้ไขได้จริง**: Announcement categories + document categories CRUD ผ่าน API + DB
- **เพิ่ม tab จัดการห้องประชุม**: Tab "Meeting Rooms" ใน settings — CRUD ห้องประชุม (name, capacity, location)
- **เพิ่ม tab ปรับสถานะ application**: Tab "Application Status" — Admin สามารถเปิด/ปิด application ใน Application Hub, เปลี่ยนสถานะ (online/offline/maintenance)

## Capabilities

### New Capabilities
- `system-config-db`: Persist system configuration to database
- `system-config-meeting-rooms`: Admin CRUD for meeting rooms
- `system-config-app-status`: Admin manage application online/offline/maintenance status

### Modified Capabilities
- `functional-admin-modules`: Update System Configuration requirements with real functionality, meeting room management, application status

## Impact

- `app/api/settings/route.ts` — Replace in-memory store with Prisma `SystemConfig` model (GET/PUT)
- `app/api/settings/meeting-rooms/route.ts` — ใหม่: CRUD for meeting rooms
- `app/api/settings/app-status/route.ts` — ใหม่: CRUD for application status
- `app/api/settings/api-keys/route.ts` — ใหม่: API key management
- `app/(dashboard)/settings/page.tsx` — Connect all tabs to real API, add MeetingRooms + AppStatus tabs, remove project types, fix save
- `app/globals.css` — อาจต้อง regenerate จาก branding settings (หรือใช้ CSS-in-JS runtime)
- `prisma/schema.prisma` — เพิ่ม `SystemConfig`, `ApiKey` models (ถ้ายังไม่มี)
- `lib/auth.ts` — อ่าน auth settings จาก DB แทน env
- ไม่มี dependency ใหม่
