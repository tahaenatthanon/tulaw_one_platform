## Why

หน้า Documents ปัจจุบันเป็น mock data พื้นฐาน ต้องการ redesign ใหม่ตาม requirement: category tabs ชัดเจนพร้อม icon, ตารางเอกสารครบถ้วน, RBAC access control, และ storage progress bar

## What Changes

- Category tabs: Central Pool, Department Pool, Personal Pool พร้อม icon ใต้ช่องค้นหา
- ตาราง: ชื่อ, ประเภท, ขนาด, ผู้อัปโหลด, วันที่แก้ไขล่าสุด
- RBAC: Super Admin/System Admin → ทุก Pool, Dept Admin → Central + Department, User → Central + Personal
- Storage progress bar แบบ real-time
- Audit trail ทุกการเข้าถึง/แก้ไข

## Impact

- `app/(dashboard)/documents/page.tsx` — เขียนใหม่ทั้งหมด
