## Why

ระบบ User Management ปัจจุบันมีฟังก์ชันพื้นฐาน (ดูรายชื่อ, เพิ่ม, แก้ไข, ลบ, ค้นหา, กรอง) แต่ยังขาดฟีเจอร์สำคัญสำหรับการจัดการผู้ใช้ในระดับองค์กร เช่น Bulk Actions, การซิงค์ข้อมูล Active Directory, การจัดการ MFA, การปลดล็อกบัญชี, Action Menu แบบครอบคลุม, User Detail Drawer, และการรองรับ Authentication Source (LDAP/Local) อย่างสมบูรณ์ การเพิ่มฟีเจอร์เหล่านี้จะทำให้แอดมินสามารถจัดการผู้ใช้ 300+ คนได้อย่างมีประสิทธิภาพ ลดขั้นตอนที่ซ้ำซ้อน และรองรับการทำงานแบบ Real-time ตามที่กำหนดใน Non-Functional Requirements

## What Changes

- ปรับโครงสร้างหน้า User Management ใหม่ทั้งหมด ให้รองรับการจัดการผู้ใช้ระดับองค์กร
- **คงแท็บเมนูเดิมไว้ทั้งหมด:** User Management, Role Management, Permission Management, AD Sync
- เพิ่ม Action Bar พร้อม Import CSV, Export CSV, AD Sync, Bulk Actions
- เพิ่มระบบ Bulk Actions สำหรับดำเนินการกับผู้ใช้หลายรายพร้อมกัน (Assign Role, Enable, Disable, Unlock Account, Reset MFA, Export Selected)
  - ตัวกรอง Role ใน Bulk Action แสดงตามลำดับ: All Role, Super Admin, System Admin, Dean, Dept Admin, User, Viewer
  - ตัวกรอง Department ใน Bulk Action ดึงรายการจากข้อมูลจริงของระบบ (All Departments เป็นตัวเลือกแรก)
- ปรับปรุงระบบ Filter ให้ครอบคลุมทุกมิติ (Role, Status, Department, Authentication Source, MFA, Last Login)
- ปรับโครงสร้างตารางผู้ใช้ใหม่ เพิ่มคอลัมน์ Authentication Source, MFA, Last AD Sync, Last Login, IP Address
  - ทุกคอลัมน์แสดงข้อมูลในบรรทัดเดียว (ไม่ตัดบรรทัด, no text wrapping)
- เพิ่ม Action Menu (⋮) ในแต่ละแถว พร้อมเมนู View, Edit, Assign Role, Reset MFA, Unlock Account, Enable/Disable — ทุกเมนูต้องใช้งานได้จริง
- แทนที่ Modal ด้วย User Detail Drawer (ด้านขวา) แสดง Profile, Roles, Permissions, Activity, Sessions
  - Drawer ทุกประเภท (Create, Edit, View, Assign Role, Reset Password) มีขนาดเหมาะสม รองรับ Responsive
- รองรับการค้นหาทุกฟิลด์จากข้อมูลจริง (Name, Email, Username, Role, Department, Status, Auth Source, Last Login, IP Address) — ค้นหาจากฐานข้อมูลจริงทันที
- เพิ่ม Pagination Options (10, 25, 50, 100 รายการต่อหน้า) และแสดงผลในรูปแบบ "Showing 1–25 of 315 users"
- รองรับ Bulk Selection พร้อม Select All / Clear Selection
- รองรับ Authentication Source (LDAP User และ Local User) โดย LDAP User เป็น Primary Authentication Source
- **ทุกฟังก์ชันทำงานกับ Backend จริง:** Create, Update, Delete, Enable, Disable, Unlock Account, Reset Password, Assign Role, Import CSV, AD Sync, Search, Filter, Bulk Action
- **ห้ามใช้ Mock Data, Placeholder หรือปุ่มที่ยังไม่มีการทำงานจริง**
- **Real-time Bulk Action Filter:** การเลือกค่าใน Bulk Action (Role, Department) จะกรองข้อมูลในตารางตามเงื่อนไขที่เลือกและอัปเดตผลลัพธ์แบบ Real-time ทันที
- **Tab Switching:** เมื่อผู้ใช้เลือก Tab ระบบแสดงข้อมูลของ Tab นั้นทันที และแสดงเฉพาะข้อมูลของ Active Tab เท่านั้น
- **Sidebar Width:** ปรับลดความกว้างของ Sidebar ด้านซ้ายเพื่อเพิ่มพื้นที่แสดงผลของเนื้อหาหลัก โดยเมนูทั้งหมดยังคงใช้งานและอ่านได้อย่างชัดเจน
- การกำหนด Role, Enable/Disable, Unlock Account, Reset MFA มีผลทันที (Real-time)
- การซิงค์ AD (Manual และ Automatic) อัปเดตข้อมูลผู้ใช้ทันทีหลังซิงค์เสร็จ

## Capabilities

### New Capabilities

- `user-management-features`: ระบบจัดการผู้ใช้ระดับองค์กร ประกอบด้วย Bulk Actions, Action Menu, User Detail Drawer, Advanced Filters, Pagination Options, Bulk Selection, Authentication Source (LDAP/Local), AD Integration, Real-time Behavior

### Modified Capabilities

- `functional-admin-modules`: ขยายความสามารถของ Users & Roles module จาก CRUD พื้นฐาน เป็นระบบจัดการผู้ใช้ระดับองค์กรที่สมบูรณ์ (Bulk Actions, Drawer Detail, Advanced Search, AD Sync UI, CSV Import/Export)
- `rbac-module-permissions`: เพิ่ม Permission Codes สำหรับ Bulk Actions (`USERS_BULK_ASSIGN_ROLE`, `USERS_BULK_ENABLE`, `USERS_BULK_DISABLE`, `USERS_UNLOCK_ACCOUNT`, `USERS_RESET_MFA`, `USERS_EXPORT_SELECTED`) และรองรับการแยก permission ตาม Authentication Source

## Impact

- **Frontend:** `app/(dashboard)/users/page.tsx`, `app/(dashboard)/users/user-management/page.tsx` — ปรับโครงสร้าง UI ใหม่ทั้งหมด
- **Layout:** `components/layouts/dashboard-layout.tsx` — ปรับลดความกว้าง Sidebar ด้านซ้ายเพื่อเพิ่มพื้นที่เนื้อหาหลัก
- **Components:** สร้าง component ใหม่ — `UserDetailDrawer`, `UserTable`, `UserActionMenu`, `BulkActionBar`, `UserFilters`
- **API:** `app/api/users/route.ts` — ขยาย API รองรับ Bulk Actions, AD Sync, Export CSV, Import CSV, Unlock Account, Reset MFA
- **Database:** เพิ่มฟิลด์ `authenticationSource`, `isLocked`, `lastAdSync`, `ipAddress` ใน User model (หรือใช้ UserSession/LoginHistory); สร้าง `permissions` และ `role_permissions` tables ถ้ายังไม่มี
- **Dependencies:** ไม่มี dependency ใหม่
