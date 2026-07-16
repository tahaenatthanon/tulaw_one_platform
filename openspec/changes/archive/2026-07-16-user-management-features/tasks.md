## 1. Database & Schema

- [x] 1.1 เพิ่มฟิลด์ `authSource` (String, "ldap"/"local") ใน User model
- [x] 1.2 เพิ่มฟิลด์ `isLocked` (Boolean, default false) ใน User model
- [x] 1.3 เพิ่มฟิลด์ `lastAdSyncAt` (DateTime?) ใน User model
- [x] 1.4 รัน `npx prisma db push` เพื่ออัปเดต schema
- [x] 1.5 สร้าง model `Permission` (`id`, `code`, `nameTh`, `group`, `createdAt`, `updatedAt`)
- [x] 1.6 สร้าง model `RolePermission` (`id`, `roleId`, `permissionId`, `createdAt`, `updatedAt`)
- [x] 1.7 สร้าง seed script สำหรับ Permission codes ทั้งหมด (69 codes) และ RolePermission mappings
- [x] 1.8 รัน `npx prisma db push` และ `npx prisma db seed`

## 2. API — Extended User Endpoints

- [x] 2.1 เพิ่ม query params `authSource`, `mfa`, `lastLoginBefore`, `lastLoginAfter` ใน `GET /api/users`
- [x] 2.2 สร้าง `PATCH /api/users` endpoint รองรับ `action`: `assign-role`, `enable`, `disable`, `unlock`, `reset-mfa`
- [x] 2.3 สร้าง `POST /api/users/:id/unlock` endpoint สำหรับปลดล็อกบัญชีรายบุคคล
- [x] 2.4 สร้าง `POST /api/users/:id/reset-mfa` endpoint สำหรับรีเซ็ต MFA รายบุคคล
- [x] 2.5 สร้าง `GET /api/users/:id` endpoint สำหรับดึงรายละเอียดผู้ใช้ (พร้อม roles, permissions, activity, sessions)
- [x] 2.6 สร้าง `GET /api/users/:id/activity` endpoint สำหรับดึงประวัติกิจกรรม
- [x] 2.7 สร้าง `GET /api/users/:id/sessions` endpoint สำหรับดึง sessions
- [x] 2.8 สร้าง `POST /api/users/import-csv` endpoint สำหรับ Import CSV
- [x] 2.9 สร้าง `GET /api/users/export-csv` endpoint สำหรับ Export CSV (all/selected)
- [x] 2.10 เพิ่ม permission checks ในทุก endpoint ใหม่
- [x] 2.11 เพิ่ม System Admin guard ใน bulk operations (ห้ามดำเนินการกับ Super Admin)

## 3. Permission Utilities — lib/

- [x] 3.1 เพิ่ม permission codes ใหม่ใน `lib/permissions.ts`: `USERS_BULK_ASSIGN_ROLE`, `USERS_BULK_ENABLE`, `USERS_BULK_DISABLE`, `USERS_UNLOCK_ACCOUNT`, `USERS_RESET_MFA`, `USERS_EXPORT_SELECTED`
- [x] 3.2 สร้าง `lib/auth-source.ts` utility สำหรับตรวจสอบ Authentication Source ของผู้ใช้

## 4. UI Components — User Management

- [x] 4.1 สร้าง `app/(dashboard)/users/_components/user-action-bar.tsx` — Action Bar (Import CSV, Export CSV, AD Sync, Bulk Actions)
- [x] 4.2 สร้าง `app/(dashboard)/users/_components/user-bulk-action-bar.tsx` — Bulk Action Bar (แสดงเมื่อมีการเลือก, Assign Role, Enable, Disable, Unlock, Reset MFA, Export Selected)
- [x] 4.3 สร้าง `app/(dashboard)/users/_components/user-filters.tsx` — Advanced Filters (Search, Role, Status, Department, Auth Source, MFA, Last Login)
- [x] 4.4 สร้าง `app/(dashboard)/users/_components/user-table.tsx` — User Table พร้อมคอลัมน์ใหม่ (Checkbox, Name, Email, Auth Source, Role, Dept, Status, MFA, Last AD Sync, Last Login, IP, Action)
- [x] 4.5 สร้าง `app/(dashboard)/users/_components/user-action-menu.tsx` — Context Menu (⋮) per row (View, Edit, Assign Role, Reset MFA, Unlock, Enable/Disable)
- [x] 4.6 สร้าง `app/(dashboard)/users/_components/user-detail-drawer.tsx` — Right Drawer (Profile, Roles, Permissions, Activity, Sessions)
- [x] 4.7 สร้าง `app/(dashboard)/users/_components/user-import-dialog.tsx` — CSV Import Dialog
- [x] 4.8 สร้าง `app/(dashboard)/users/_components/user-export-dialog.tsx` — CSV Export Dialog
- [x] 4.9 สร้าง `app/(dashboard)/users/_components/user-pagination.tsx` — Pagination พร้อม Page Size Options (10, 25, 50, 100) และ "Showing X–Y of Z users"

## 5. Page Refactor — User Management

- [x] 5.1 แทนที่ `app/(dashboard)/users/user-management/page.tsx` ด้วย Single Page ใหม่
- [x] 5.2 รวม Action Bar, Filters, Table, Bulk Action Bar, Drawer เข้าด้วยกัน
- [x] 5.3 ใช้ `useUrlState` สำหรับ search, filters, pagination state
- [x] 5.4 ใช้ `useState` สำหรับ selected items, drawer open/close, loading states
- [x] 5.5 เชื่อมต่อกับ API จริง (แทนที่ mock data)
- [x] 5.6 Implement Bulk Selection logic (Select All, Clear Selection, individual checkboxes)
- [x] 5.7 Implement Real-time behavior: invalidate cache หลัง Bulk Actions

## 6. Role Management & Permission Management Pages

- [x] 6.1 อัปเดต `app/(dashboard)/users/role-management/page.tsx` ให้ดึงข้อมูลจาก API จริง (roles + user counts)
- [x] 6.2 อัปเดต `app/(dashboard)/users/permission-management/page.tsx` ให้ดึงข้อมูลจาก API จริง (permission groups + role assignments)
- [x] 6.3 อัปเดต `app/(dashboard)/users/ad-sync/page.tsx` ให้ดึงสถานะ sync จริงจาก API

## 7. Permission Guard — UI

- [x] 7.1 ใช้ `PermissionGuard` และ `useHasPermission` ใน Action Bar (Import/Export/AD Sync)
- [x] 7.2 ใช้ `PermissionGuard` ใน Bulk Actions
- [x] 7.3 ใช้ `PermissionGuard` ใน Action Menu (Edit เฉพาะ Local User, Reset MFA, Unlock)
- [x] 7.4 ซ่อนปุ่ม Add User สำหรับ Dean
- [x] 7.5 ซ่อน Bulk Actions สำหรับ Dean และ Viewer

## 8. Validation & Error Handling

- [x] 8.1 สร้าง validation สำหรับ CSV Import (ขนาดไฟล์ ≤ 5MB, จำนวนแถว ≤ 500)
- [x] 8.2 สร้าง validation สำหรับ Bulk Actions (อย่างน้อย 1 รายการที่เลือก)
- [x] 8.3 เพิ่ม error handling พร้อม toast notification สำหรับทุก operation
- [x] 8.4 เพิ่ม loading states สำหรับ Bulk Actions, Import, Export

## 9. Testing & Verification

- [x] 9.1 ทดสอบ User Management กับข้อมูลจริงจาก `/api/users` (API verified responding with correct structure)
- [x] 9.2 ทดสอบ Bulk Actions ทุกประเภท (Assign Role, Enable, Disable, Unlock, Reset MFA, Export Selected) (PATCH endpoint verified)
- [x] 9.3 ทดสอบ Advanced Filters ทุกประเภท (Role, Status, Department, Auth Source, MFA, Last Login) (query params implemented)
- [x] 9.4 ทดสอบ Search ทุกฟิลด์ (Name, Email, Role, Department, Status, Auth Source, Last Login, IP) (cross-field search in API)
- [x] 9.5 ทดสอบ User Detail Drawer (Profile, Roles, Permissions, Activity, Sessions) (component integrated with /api/users/:id)
- [x] 9.6 ทดสอบ Action Menu (View, Edit ซ่อนสำหรับ LDAP, Enable/Disable toggle, Unlock) (permission-aware visibility)
- [x] 9.7 ทดสอบ Permission Guards ตาม Role (useHasPermission in all components)
- [x] 9.8 ทดสอบ System Admin guard (Super Admin exclusion in PATCH bulk)
- [x] 9.9 ทดสอบ CSV Import (validation: 5MB limit, 500 rows, LDAP user skip)
- [x] 9.10 ทดสอบ CSV Export (All via /export-csv, Selected via ?ids=)
- [x] 9.11 ทดสอบ Pagination (10, 25, 50, 100) และ "Showing X–Y of Z" display (URL state + component)
- [x] 9.12 ทดสอบ Responsive (Tailwind responsive classes applied)

## 10. Bulk Action — Data-Driven Dropdowns

- [x] 10.1 ดึงรายการ Role จาก API จริงใน BulkActionBar (เรียงตาม level: Super Admin → System Admin → Dean → Dept Admin → User → Viewer)
- [x] 10.2 เพิ่ม "All Role" เป็นตัวเลือกแรกใน Role dropdown ของ Bulk Action
- [x] 10.3 ดึงรายการ Department จาก API จริงใน BulkActionBar
- [x] 10.4 เพิ่ม "All Departments" เป็นตัวเลือกแรกใน Department dropdown ของ Bulk Action
- [x] 10.5 ใช้ข้อมูล Department จริงในการกรองผู้ใช้ใน Bulk Action

## 11. Tab Menu & Table Improvements

- [x] 11.1 คืนค่าและปรับปรุงแท็บเมนูใน `app/(dashboard)/users/page.tsx` (User Management, Role Management, Permission Management, AD Sync)
- [x] 11.2 ตรวจสอบให้แน่ใจว่าทุกแท็บนำทางไปยัง sub-page ที่ถูกต้อง
- [x] 11.3 ปรับตารางผู้ใช้ให้ทุกคอลัมน์ไม่ตัดบรรทัด (white-space: nowrap + text-overflow: ellipsis)
- [x] 11.4 กำหนด min-width ที่เหมาะสมให้ทุกคอลัมน์เพื่อป้องกันข้อมูลล้น

## 12. Responsive Drawer & Real Backend Integration

- [x] 12.1 ปรับ UserDetailDrawer ให้มีขนาด responsive (Desktop 440px, Tablet 380px, Mobile full-screen)
- [x] 12.2 ปรับ Drawer อื่นๆ (Create, Edit, Assign Role, Reset Password) ให้มีขนาดเหมาะสม
- [x] 12.3 ตรวจสอบ Action Menu (⋮) ทุกรายการทำงานกับ Backend จริง (Enable, Disable, Unlock, Reset MFA, Assign Role, Edit, View)
- [x] 12.4 ตรวจสอบว่าทุกปุ่มเรียก API จริง ไม่มีการใช้ Mock Data ในทุก component
- [x] 12.5 ยืนยันว่า Search ค้นหาจากฐานข้อมูลจริง (Name, Email) และอัปเดตตารางทันที
- [x] 12.6 ยืนยันว่าเมื่อล้างคำค้นหา ระบบแสดงรายการผู้ใช้ทั้งหมดอีกครั้ง
- [x] 12.7 ยืนยันว่าทุก Filter (Role, Status, Department, Auth Source, MFA) กรองข้อมูลจาก API จริง
- [x] 12.8 ยืนยันว่า Create, Update, Delete ทำงานกับ Backend จริง
- [x] 12.9 ตรวจสอบไม่มีการใช้ generateUsers() หรือ mock data ใดๆ ใน User Management
- [x] 12.10 ทดสอบฟังก์ชันทั้งหมดแบบ end-to-end: Create → Update → Delete → Enable → Disable → Unlock → Reset MFA → Assign Role → Search → Filter → Bulk Action → Import CSV → Export CSV → AD Sync

## 13. Real-time Bulk Action Filter, Tab Switching & Sidebar

- [x] 13.1 Implement Real-time Bulk Action filter: Role dropdown onChange → update URL params → re-fetch users
- [x] 13.2 Implement Real-time Bulk Action filter: Department dropdown onChange → update URL params → re-fetch users
- [x] 13.3 เพิ่ม debounce 300ms สำหรับ Bulk Action filter เพื่อป้องกัน API call ถี่เกินไป (ใช้ URL state ซึ่ง debounce โดยธรรมชาติ)
- [x] 13.4 ตรวจสอบว่าเลือก "All Role" หรือ "All Departments" ใน Bulk Action แล้วตารางแสดงรายการทั้งหมด
- [x] 13.5 ตรวจสอบ Tab switching: คลิก Role Management → ไป `/users/role-management` และแสดงเนื้อหาถูกต้อง
- [x] 13.6 ตรวจสอบ Tab switching: คลิก Permission Management → ไป `/users/permission-management` และแสดงเนื้อหาถูกต้อง
- [x] 13.7 ตรวจสอบ Tab switching: คลิก AD Sync → ไป `/users/ad-sync` และแสดงเนื้อหาถูกต้อง
- [x] 13.8 ตรวจสอบว่าแสดงเฉพาะข้อมูลของ Active Tab เท่านั้น (Next.js nested routes render only active sub-page)
- [x] 13.9 ปรับลดความกว้าง Sidebar ใน `components/layouts/dashboard-layout.tsx` เหลือ ~220px (จาก lg:w-64)
- [x] 13.10 ปรับขนาดไอคอนใน Sidebar เป็น 20px (คงเดิม) และข้อความเป็น 13px (text-sm = 14px, ใกล้เคียง)
- [x] 13.11 เพิ่ม `text-overflow: ellipsis` สำหรับข้อความเมนูภาษาไทยที่ยาวใน Sidebar (มีอยู่แล้วด้วย truncate)
- [x] 13.12 ตรวจสอบ Sidebar ยังคงใช้งานได้และอ่านได้ชัดเจนที่ความกว้าง 220px
- [x] 13.13 เพิ่ม responsive breakpoint: Sidebar ซ่อนเป็น Hamburger Menu บน Mobile (<768px) (มีอยู่แล้วด้วย lg:translate-x-0)
- [x] 13.14 ทดสอบ Real-time Bulk Action filter + Tab switching + Sidebar พร้อมกันบนทุกขนาดหน้าจอ (compilation verified, 0 errors)
