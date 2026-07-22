## Why

ระบบ TULAW ONE มี 4 โมดูลที่ต้องการฟังก์ชันการจัดการข้อมูล CRUD แบบ inline โดยผู้ดูแลระบบ — Application Hub (จัดการสถานะแอป), Intranet (จัดการประเภทประกาศ), Book Meeting (จัดการห้องประชุม), Projects (จัดการประเภทโครงการ) — ปัจจุบันฟังก์ชันเหล่านี้อยู่รวมกันในหน้า Settings ซึ่งไม่สะดวกต่อการใช้งาน และควรย้ายไปอยู่ในโมดูลที่เกี่ยวข้องโดยตรง พร้อมกันนี้ให้เอา tabs `categories`, `meeting rooms`, `app status` ออกจาก System Config เพื่อลดความซ้ำซ้อน

## What Changes

- **Application Hub**: เพิ่มปุ่ม "จัดการสถานะแอป" → modal แสดงรายการแอปทั้งหมด → เปลี่ยนสถานะ online / maintenance / offline แบบ real-time
- **Intranet**: เพิ่มปุ่ม "จัดการประเภทประกาศ" → modal จัดการ categories — เพิ่ม, ลบ, แก้ไข (ชื่อ, สี) — ข้อมูล sync จาก Settings API
- **Book Meeting**: เพิ่มปุ่ม "จัดการห้องประชุม" → modal จัดการห้อง — เพิ่ม, ลบ, แก้ไข (ชื่อ, ความจุ, สถานที่, รูป)
- **Projects**: เพิ่มปุ่ม "จัดการประเภทโครงการ" → modal จัดการ project types — เพิ่ม, ลบ, แก้ไข (ชื่อ)
- **Settings**: เอา 3 tabs ออก — `categories`, `rooms`, `app-status` — คงไว้เฉพาะ core settings
- **Real-time Data Sync**: ทุกการเปลี่ยนแปลง (Create/Update/Delete) แสดงผลในระบบทันทีหลังดำเนินการสำเร็จ — ผู้ใช้ไม่ต้องรีเฟรชหน้าเว็บหรือ sync ข้อมูลด้วยตนเอง
- **Cross-Module Consistency**: การแสดงผลข้อมูลล่าสุดมีความสอดคล้องกันในทุกหน้าจอและทุกโมดูลที่ได้รับผลกระทบ

## Capabilities

### New Capabilities
- `admin-app-status`: Inline app status management modal in Application Hub
- `admin-announcement-categories`: Inline announcement category management modal in Intranet
- `admin-meeting-rooms`: Inline meeting room management modal in Book Meeting
- `admin-project-types`: Inline project type management modal in Projects

### Modified Capabilities
<!-- No spec modifications — new features + settings cleanup -->

## Impact

| พื้นที่ | ไฟล์ที่ได้รับผลกระทบ |
|---|---|
| Client | `app/(dashboard)/application-hub/page.tsx` — เพิ่มปุ่ม + AppStatusModal |
| Client | `app/(dashboard)/intranet/page.tsx` — เพิ่มปุ่ม + CategoryModal |
| Client | `app/(dashboard)/book-meeting/page.tsx` — เพิ่มปุ่ม + RoomModal |
| Client | `app/(dashboard)/projects/page.tsx` — เพิ่มปุ่ม + ProjectTypeModal |
| Client | `app/(dashboard)/settings/page.tsx` — ลบ 3 tabs (categories, rooms, app-status) |
| API | `app/api/settings/app-status/route.ts` — รองรับ PUT/POST/DELETE (existing or new) |
| API | `app/api/settings/route.ts` — รองรับ PATCH สำหรับ categories |
| API | `app/api/book-meeting/rooms/route.ts` — รองรับ PUT/POST/DELETE (existing or new) |
| API | `app/api/projects/types/route.ts` — สร้าง route handler สำหรับ project types (GET/POST/PUT/DELETE) |
| API | `app/api/settings/route.ts` — รองรับ PATCH สำหรับ categories + PATCH/PUT app-status |
| Client | ทุกโมดูล — ใช้ `mutate()` (SWR revalidate) หลังทุกการเปลี่ยนแปลง เพื่อ real-time sync
