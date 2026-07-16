## Why

หน้า System Configuration และ Audit Log ปัจจุบันยังใช้ข้อมูล Mock (`DEFAULT_AUTH`, `DEFAULT_SSO`, `generateLogs()`) และไม่มีการ Persist ข้อมูลลงฐานข้อมูล ทำให้การตั้งค่าสูญหายทุกครั้งที่รีเซิร์ฟเวอร์ และ Audit Log ไม่สามารถตรวจสอบย้อนหลังได้จริง ระบบต้องการให้ทั้งสอง module ทำงานกับ Backend จริงทั้งหมด รองรับ CRUD เต็มรูปแบบ และมีผลทันที (Real-time)

## What Changes

### System Configuration
- **Authentication:** รองรับการเพิ่ม แก้ไข ปรับเปลี่ยนทุกฟิลด์ (Session Timeout, JWT Expiry, Max Login Attempts, MFA Enforcement) → บันทึกลง DB จริง มีผลทันที
- **SSO/LDAP:** รองรับการเพิ่ม แก้ไข ปรับเปลี่ยนทุกฟิลด์ (LDAP URL, Base DN, Domain, Sync Interval, Enabled) → บันทึกลง DB จริง มีผลทันที
- **UI Branding:** รองรับการอัปโหลดโลโก้ เปลี่ยนสีหลัก (Primary) เพิ่มธีมสีรอง (Secondary) และกำหนดรูปแบบการแสดงผล → บันทึกลง DB + CSS Variables อัปเดตทันที
- **Storage:** รองรับกำหนดขนาดพื้นที่จัดเก็บสูงสุดต่อผู้ใช้ (Quota) ประเภทไฟล์ที่อนุญาต → บันทึกลง DB จริง
- **API Keys:** รองรับ Create, Rotate, Disable, Delete API Key → บันทึกลง DB จริง มีผลทันที
- **Categories:** รองรับเพิ่ม แก้ไข ลบ เปลี่ยนสี หมวดหมู่ประกาศและโครงการ → บันทึกลง DB จริง
- **Meeting Rooms:** รองรับเพิ่ม แก้ไข ปรับเปลี่ยนข้อมูลห้องประชุม รวมถึงสถานที่ → บันทึกลง DB จริง
- **App Status:** รองรับเปิด/ปิด ปรับเปลี่ยนสถานะของแต่ละระบบ → บันทึกลง DB จริง มีผลทันที

### Audit Log
- แสดงบันทึกกิจกรรมทั้งหมดจาก DB จริง (System Activity Log) แทน Mock Data
- รองรับการค้นหาจากผู้ใช้งาน, Event Type, Module, ระดับความสำคัญ, ช่วงวันที่
- รองรับ Multi-filter (หลายเงื่อนไขพร้อมกัน)
- รองรับการเรียงลำดับทุกคอลัมน์
- รองรับการดูรายละเอียด (View Details) แต่ละรายการ: ผู้ใช้, วันที่/เวลา, IP Address, Module, Action, Before/After
- รองรับ Export เป็น CSV และ Excel
- รองรับการกำหนดช่วงเวลาข้อมูลที่แสดงและส่งออก
- รองรับ Event Types: DOC_UPLOAD, CONFIG_UPDATE, PROJECT_APPROVE, AD_SYNC, USER_LOGIN, USER_LOGIN_FAILED, DASHBOARD_VIEW, ROLE_CREATE และอื่น ๆ
- บันทึก Before/After สำหรับการแก้ไขข้อมูลสำคัญ
- Audit Log แบบ Immutable — ไม่สามารถแก้ไขหรือลบผ่านระบบได้

### Data Persistence (Cross-Cutting)
- **Create/Update/Delete ทุกส่วนต้องบันทึกลง Persistent Storage:** ทุกการดำเนินการจากทุก module (Settings, Audit Log, API Keys, Categories, Meeting Rooms, App Status) ต้องบันทึกลงฐานข้อมูลจริง ไม่ใช่เพียงเปลี่ยนค่าใน Local State
- **Editable Fields บันทึกและอัปเดตข้อมูลจริง:** ทุกช่องกรอกที่แก้ไขต้องส่งไปยัง API และ Persist ลง DB
- **แสดงข้อมูลล่าสุดทันที:** เมื่อดำเนินการสำเร็จ ระบบต้องแสดงข้อมูลล่าสุดในทุกส่วนที่เกี่ยวข้อง โดยไม่ต้องรีเฟรชหน้า
- **ข้อมูลคงอยู่หลังรีเฟรช/ออกจากระบบ:** ข้อมูลที่เพิ่ม แก้ไข หรือลบ ต้องยังคงอยู่หลังจากรีเฟรชหน้าเว็บ ออกจากระบบ และเข้าสู่ระบบใหม่

## Capabilities

### New Capabilities

- `system-config-backend`: ระบบตั้งค่าระบบ (System Configuration) ที่ทำงานกับ Backend จริง ครอบคลุม Authentication, SSO/LDAP, UI Branding, Storage, API Keys, Categories, Meeting Rooms, App Status — รองรับ CRUD เต็มรูปแบบ มีผลทันที
- `audit-log-backend`: ระบบ Audit Log ที่ดึงข้อมูลจากฐานข้อมูลจริง รองรับ Multi-filter, Search, Sort, View Details, Before/After, Export CSV/Excel, Immutable Log

### Modified Capabilities

- `functional-admin-modules`: ขยายความสามารถของ Settings และ Audit Log pages จาก Mock Data → Real Backend (API + DB Persistence + Real-time)

## Impact

- **Frontend:** `app/(dashboard)/settings/page.tsx` — 8 tabs ทั้งหมดเชื่อมต่อ API จริง; `app/(dashboard)/audit-log/activity-log/page.tsx` — แทนที่ Mock Data ด้วย API จริง
- **Components:** ปรับปรุง `components/ui/` — อาจเพิ่ม AlertDialog, Toast สำหรับ feedback
- **API:** 
  - `app/api/settings/route.ts` — GET/PUT สำหรับทุกหมวดการตั้งค่า
  - `app/api/settings/upload-logo/route.ts` — อัปโหลดโลโก้
  - `app/api/api-keys/route.ts` — CRUD API Keys
  - `app/api/audit-logs/route.ts` — GET พร้อม filter, search, sort, pagination; export
  - `app/api/audit-logs/[id]/route.ts` — GET detail
- **Database:** ใช้ `SystemConfig` (มีอยู่แล้ว), `AuditLog` (มีอยู่แล้ว), `ApiKey`/`ApiClient` (มีอยู่แล้ว), `MeetingRoom` (มีอยู่แล้ว), `ThemeSetting` (มีอยู่แล้ว) — เพิ่ม middleware/hook สำหรับ auto-audit-log
- **Dependencies:** ไม่มี dependency ใหม่
