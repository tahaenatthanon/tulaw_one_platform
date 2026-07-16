## Why

หน้า Application Hub ปัจจุบันใช้ `appGroups` แบบ Hardcoded โดย `online: true` ตลอด — ไม่มีการเชื่อมต่อกับ Settings App Status tab ทำให้การเปลี่ยนสถานะ Application ใน Settings ไม่มีผลกับ Application Hub จริง ระบบต้องการให้การกำหนดสถานะ (Online/Maintenance/Offline) จาก Settings มีผลแบบ Real-time ทั่วทั้งระบบ พร้อม Status Indicator บนไอคอนแอปพลิเคชัน และบันทึก Audit Log ทุกครั้งที่มีการเปลี่ยนแปลง

## What Changes

- **Application Hub — Real-time Status:** เปลี่ยนจาก `appGroups` Hardcoded เป็นดึงข้อมูลจาก `GET /api/settings/app-status` (หรือ API endpoint ใหม่สำหรับ Hub) แสดงสถานะจริงของแต่ละแอปพลิเคชัน
- **Status Indicators:** แต่มไอคอนของแต่ละ Application แสดงสถานะปัจจุบัน:
  - Online — จุดสีเขียว (🟢)
  - Maintenance — จุดสีเหลือง (🟡)
  - Offline — จุดสีแดง (🔴)
- **Real-time Sync:** เมื่อบันทึกการเปลี่ยนแปลงสถานะใน Settings Page → `mutate()` → Application Hub เห็นสถานะใหม่ทันทีเมื่อเข้าใช้งานหรือ re-focus
- **Audit Log:** บันทึก `APP_STATUS_CHANGE` ใน Audit Log ทุกครั้งที่มีการเปลี่ยนสถานะ พร้อมระบุผู้ดำเนินการ, วันที่และเวลา, สถานะเดิม และสถานะใหม่
- **Effect on All Users:** การเปลี่ยนแปลงสถานะมีผลกับผู้ใช้งานทุกคนทันทีโดยไม่ต้องรีสตาร์ทระบบ (ผ่าน SWR cache invalidation)

## Capabilities

### New Capabilities

- `app-status-real-time`: ระบบจัดการสถานะ Application แบบ Real-time — Hub แสดงสถานะจริง, Status Indicators, Sync ทั่วทั้งระบบ, Auto-Audit Log

### Modified Capabilities

- `system-config-backend`: เพิ่ม `APP_STATUS_CHANGE` Audit Log event type และ auto-logging เมื่อเปลี่ยนสถานะ

## Impact

- **Frontend:** `app/(dashboard)/application-hub/page.tsx` — แทนที่ hardcoded `appGroups` ด้วย API fetch; `app/(dashboard)/settings/page.tsx` — เพิ่ม audit log ใน `AppStatusTab`
- **API:** `app/api/settings/app-status/route.ts` — เพิ่ม audit log เมื่อ PUT
- **Database:** ไม่มี schema เปลี่ยนแปลง
- **Dependencies:** ไม่มี dependency ใหม่
