## Why

หน้า Users & Roles ปัจจุบันมี UI ที่ไม่สอดคล้องกับ Design System มาตรฐานของ TULAW ONE Platform ทั้งในเรื่องของ Spacing, Typography, Color Palette, Iconography และ Component Hierarchy ทำให้ประสบการณ์ผู้ใช้ไม่เป็นหนึ่งเดียวกับหน้าอื่นๆ ในระบบ การปรับปรุงครั้งนี้จะยกระดับ UI ให้เป็นมาตรฐานเดียวกันโดยไม่กระทบกับ Business Logic ใดๆ

## What Changes

- ปรับโครงสร้าง Layout ของหน้า Users & Roles ใหม่ตาม Design Reference โดยใช้ Design System (`--tu-*` tokens), Typography (Prompt font, 8px spacing), และ Component Standards ที่กำหนดใน `claude.md`
- ปรับปรุงส่วน Header: Page Title (`Users & Roles`), Description, Action Buttons เรียงลำดับ Import → Export → เพิ่มผู้ใช้งาน (ขวาสุด) — ไม่มี Breadcrumb
- ลบปุ่ม Bulk Actions ออกจาก Toolbar (ยังคง Bulk Actions ผ่าน Checkbox + Bulk Action Bar เดิม)
- ปรับ Layout หน้าให้เท่ากับหน้าอื่นในระบบ: ใช้ `mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10`
- ปรับปรุงส่วน Search & Filter Bar: ใช้ style ใหม่ที่มี border, rounded-2xl, shadow; Filter Dropdowns ไม่ใส่สีพื้นหลังเมื่อเลือก (คงเฉพาะขอบเปลี่ยนสี)
- ปรับปรุงตารางผู้ใช้งาน (User Table): รองรับการเรียงลำดับ (Sort) ทุกคอลัมน์ — Role เรียงตามระดับ (Level) จากสูงไปต่ำ; Actions เหลือเพียงปุ่ม More (...) ที่เปิด Dropdown Menu 6 รายการ:
  - **View Details**: เปิด User Detail Drawer แสดง Profile, Department, Position, Role, Status, Last Login, Created Date, Updated Date, MFA Status, Account Status
  - **Enable Account**: เปลี่ยนสถานะผู้ใช้เป็น ACTIVE (แสดงเมื่อ Status เป็น INACTIVE หรือ MFA_PENDING)
  - **Disable Account**: เปลี่ยนสถานะผู้ใช้เป็น INACTIVE (แสดงเมื่อ Status เป็น ACTIVE)
  - **Edit User**: เปิด Modal แก้ไขข้อมูล (Display Name, Department, Position, Role, Account Status, Email, Phone, Office, Profile Image)
  - **Reset MFA**: รีเซ็ต MFA — เปลี่ยนสถานะเป็น MFA_PENDING ผู้ใช้ต้องลงทะเบียน MFA ใหม่หลังรีเซ็ต
  - **Force Sign Out**: ออกจากระบบทุก Session (Web, Mobile, Browser)
  - **View Audit Log**: เปิดประวัติการใช้งานเฉพาะของ User ที่เลือก (กรองตาม userId) — Audit Log Page SHALL อ่าน `userId` จาก URL query param และกรองอัตโนมัติ
  - **Delete User**: ลบผู้ใช้แบบถาวร (Hard Delete ผ่าน `prisma.user.delete`) — เฉพาะ Super Admin หรือ System Admin; มี Confirmation Dialog
- แสดงชื่อ Role ในคอลัมน์ Role และ Role Filter เป็นภาษาอังกฤษทั้งหมด: Super Admin, System Admin, Dean, Dept Admin, User, Viewer
- **StatusBadge Mapping**: INACTIVE → "Inactive" (⚠️ ไม่ใช่ "Suspended"), MFA_PENDING → "MFA Pending" (⚠️ ไม่ใช่ "Invited"), ACTIVE → "Active"
- ปรับปรุง User Detail Drawer: ลบเมนู Tabs ทั้ง 4 รายการ (Profile, Roles, Permissions, Activity, Sessions) ออกทั้งหมด; แสดงข้อมูล User Profile แบบเต็มในหน้าเดียว พร้อม Avatar ขนาดใหญ่, Gradient Header, Detail Cards; ปรับ Layout ให้เนื้อหาแสดงครบถ้วนภายใน Drawer โดยไม่มีการล้นหรือตัดข้อมูล
- เพิ่มส่วน Role Summary + Permission Preview (ด้านล่างตาราง): แสดงรายการ Roles พร้อมจำนวนผู้ใช้; ไม่มีปุ่ม New Role; Permission Matrix แสดง 9 Modules เรียงตาม Sidebar โดยใช้ direct mapping จาก `ROLE_PERMISSIONS` (ไม่ใช้ semantic matching) — แต่ละ permission code map ไปยัง module และ action แบบ 1:1
- ปรับปรุง User Create/Edit Modal: ฟอร์มแบบ 2 คอลัมน์ พร้อม validation indicators
- ปรับปรุง Role Create Modal: แบบฟอร์มพร้อม Permission Group แบบ checkbox
- เมื่อเลือก Filter แล้ว ขนาด Layout ต้องคงเดิม ห้ามมีการขยายหรือย่อของ Filter Bar, Table หรือองค์ประกอบอื่น ๆ รวมถึง Spacing และ Alignment
- คง Business Logic และ Workflow เดิม 100%
- **ทุกฟีเจอร์ต้องทำงานได้จริง** — More Menu Actions (8 รายการ), Permission Preview, Detail Drawer, Create/Edit Modals ต้องเชื่อมต่อกับ API จริง ไม่ใช้ Mock Data
- **แก้ไข Filter URL Bug**: เมื่ออยู่ที่หน้า `/users` และเลือก Filter URL ต้องอยู่ที่ `/users?role=xxx` ไม่ใช่ `/users/user-management?role=xxx&page=1`

## Capabilities

### New Capabilities

- `users-role-ui-redesign`: ปรับปรุง UI/UX ของหน้า Users & Roles ทั้งหมดให้สอดคล้องกับ TULAW ONE Design System ตาม Design Reference ที่กำหนด โดยรวมถึง User Table, Role Summary, Permission Preview, Detail Drawer, Create/Edit Modals, Search & Filter Bar, และ Header/Toolbar

### Modified Capabilities

<!-- No existing capability requirements are changing — this is a UI-only change -->

## Impact

- **Affected Files:**
  - `app/(dashboard)/users/page.tsx` — Tab container (ปรับ header/toolbar styling, เพิ่ม Description)
  - `app/(dashboard)/users/user-management/page.tsx` — User Management หลัก (ปรับ layout container, table, search/filter)
  - `app/(dashboard)/users/_components/` — Components ย่อย (ปรับ styling ให้ตรง Design Reference)
  - `app/(dashboard)/users/_components/user-action-bar.tsx` — ลบ Bulk Actions, เรียงปุ่ม Import → Export → เพิ่มผู้ใช้
  - `app/(dashboard)/users/_components/user-filters.tsx` — Filter ไม่ใส่สีพื้นหลังเมื่อเลือก, ชื่อ Role เป็นภาษาอังกฤษ
  - `app/(dashboard)/users/_components/user-table.tsx` — Actions เหลือปุ่ม More (...) ปุ่มเดียว, Role Column ใช้ชื่อภาษาอังกฤษ
  - `app/(dashboard)/users/_components/user-detail-drawer.tsx` — ลบ Tabs, ปรับ Layout เนื้อหาเต็ม Drawer
  - `app/(dashboard)/users/_components/user-action-menu.tsx` — ปรับ More Menu เป็น 6 Actions พร้อม API จริง
  - `app/(dashboard)/users/_components/role-summary.tsx` — Permission Preview 9 Modules เรียงตาม Sidebar
  - `app/(dashboard)/users/_components/user-detail-drawer.tsx` — เพิ่มฟิลด์ Created Date, Updated Date, MFA Status, Account Status
  - `components/shared/` — Shared Components ใหม่ (Avatar, StatusBadge, RoleBadge, ModalShell)
- **No Impact:** API routes, Prisma schema, auth logic, RBAC logic, permissions, state management, routing, business logic
- **Dependencies:** Design Reference จากไฟล์แนบ (page (5).tsx)
