## 1. Shared Components ใหม่

- [x] 1.1 สร้าง `components/shared/user-avatar.tsx` — Avatar วงกลมสีพร้อมตัวย่อชื่อ รองรับ `name`, `color`, `size` props ตาม Design Reference
- [x] 1.2 สร้าง `components/shared/role-badge.tsx` — Role Badge พร้อม icon `Shield` และสีแยกตาม RoleKey (`super_admin`, `admin`, `manager`, `staff`, `viewer`)
- [x] 1.3 สร้าง `components/shared/status-badge.tsx` — Status Badge พร้อม icon (`CircleCheck`, `CircleAlert`, `CircleMinus`) และสีตามสถานะ (`active`, `invited`, `suspended`)
- [x] 1.4 สร้าง `components/shared/modal-shell.tsx` — Modal Shell มาตรฐาน (Overlay, Header พร้อม title/subtitle, Body scrollable, Footer) รองรับ `open`, `onClose`, `title`, `subtitle`, `children`, `footer`

## 2. ปรับหน้า Tab Container (`/users/page.tsx`)

- [x] 2.1 ปรับ Header Section — เพิ่ม Breadcrumb (`Settings / Access Control`), ปรับ Page Title เป็น `Users & Roles`, เพิ่ม Description
- [x] 2.2 ปรับ Toolbar — เรียงปุ่ม Import, Export, เพิ่มผู้ใช้งาน ไว้ทางขวา; ลบปุ่ม Bulk Actions ออกจาก Toolbar
- [x] 2.3 ปรับ Tab Selector — ใช้ `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5` ตามมาตรฐาน `5.4a` ใน `claude.md`
- [x] 2.4 ปรับ Layout Container — ใช้ `mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10` ให้เท่ากับหน้าอื่น

## 3. ปรับ Search & Filter Bar

- [x] 3.1 ปรับ `user-filters.tsx` — Container ใช้ `rounded-2xl border border-tu-border bg-tu-surface p-3 shadow`, Search Input ใช้ style ใหม่ (bg-slate-50, rounded-xl, focus ring)
- [x] 3.2 เพิ่ม Filter Dropdowns — ปรับ Select ให้ใช้ style ใหม่พร้อม icon `Filter` และ `ChevronDown`
- [x] 3.3 ปรับ Filter Active State — เมื่อเลือก filter ให้เปลี่ยนเฉพาะขอบเป็น `border-[var(--tu-primary)]/40` โดยไม่ใส่สีพื้นหลัง (`bg-white` ธรรมดา)
- [x] 3.4 เพิ่ม Clear Filter Button — แสดงจำนวนตัวกรองที่ใช้งาน และปุ่ม "ล้างตัวกรอง"
- [x] 3.5 ปรับ Filter Layout Stability — เมื่อเลือก Filter แล้วขนาดของ Filter Bar, Table และองค์ประกอบอื่นต้องคงเดิม ไม่มีการขยายหรือย่อ
- [x] 3.6 ปรับ Role Filter — ใช้ชื่อภาษาอังกฤษ: Super Admin, System Admin, Dean, Dept Admin, User, Viewer

## 4. ปรับ User Table

- [x] 4.1 ปรับ `user-table.tsx` — Container ใช้ `rounded-2xl border border-tu-border bg-tu-surface shadow`
- [x] 4.2 ปรับ Table Header — ใช้ `bg-slate-50/95 backdrop-blur`, ปรับ text style (`text-[11px] font-semibold uppercase tracking-wider`)
- [x] 4.3 ปรับ Column: User — ใช้ `UserAvatar` component, แสดงชื่อ (font-semibold) และอีเมล (text-xs พร้อม icon Mail)
- [x] 4.4 ปรับ Column: Department — ใช้ icon `Building2`
- [x] 4.5 ปรับ Column: Role — ใช้ `RoleBadge` component, แสดงชื่อภาษาอังกฤษ (Super Admin, System Admin, Dean, Dept Admin, User, Viewer)
- [x] 4.6 ปรับ Column: Status — ใช้ `StatusBadge` component โดย map ACTIVE→Active, INACTIVE→Inactive, MFA_PENDING→MFA Pending (⚠️ ห้ามใช้ Suspended/Invited)
- [x] 4.7 ปรับ Column: Last Login — ใช้ icon `Clock`, แสดง relative time
- [x] 4.8 ปรับ Column: Actions — เหลือปุ่ม More (...) เพียงปุ่มเดียว; ลบปุ่ม View/Eye และ Edit/Pencil
- [x] 4.9 ปรับ Sortable Columns — ทุกคอลัมน์ (User, Department, Role, Status, Last Login) เรียงลำดับได้เมื่อคลิก Header; Role sort by ROLE_LEVELS; แสดงลูกศร ↑↓; ส่ง sortBy/sortDir ไป API
- [x] 4.10 ปรับ More Menu — 8 Actions: View Details, Enable Account, Disable Account, Edit User, Reset MFA (→ MFA_PENDING), Force Sign Out, View Audit Log (เฉพาะ userId), Delete User (ทำงานจริง + Confirm)
- [x] 4.9 ปรับ Empty State — ใช้ Design Reference pattern (icon, title, description, CTA button)

## 5. ปรับ Role Summary + Permission Preview

- [x] 5.1 เพิ่ม Role Summary Section — แสดง Card สำหรับแต่ละ Role; ไม่มีปุ่ม New Role
- [x] 5.2 เพิ่ม Permission Preview Matrix — 9 Modules; ใช้ `PERM_CODE_MAP` direct mapping จาก `ROLE_PERMISSIONS` (import) — แสดงผลถูกต้อง 100%
- [x] 5.3 เชื่อม Role Selection → Permission Preview — `useMemo` คำนวณ `computePermissions()` ครั้งเดียว; ไม่ต้อง API call

## 6. ปรับ User Detail Drawer

- [x] 6.1 ปรับ `user-detail-drawer.tsx` — Overlay ใช้ `bg-slate-900/40 backdrop-blur-sm`
- [x] 6.2 ปรับ Header — Gradient `from-[var(--tu-primary-soft)]/60 to-transparent`, Avatar ขนาด 72px, ชื่อ, หน่วยงาน, Role+Status Badges
- [x] 6.3 ปรับ Detail Cards — Email, Department, Auth Source, Last Login ในรูปแบบ Card พร้อม icon
- [x] 6.4 ปรับ Footer — ปุ่ม Close และ Edit ในตำแหน่งขวา
- [x] 6.5 เพิ่ม Detail Cards — Created Date, Updated Date, MFA Status, Account Status ใน Drawer
- [x] 6.6 ลบ Tabs ทั้งหมด — ลบเมนู Tabs (Profile, Roles, Permissions, Activity, Sessions) ออกจาก Drawer
- [x] 6.7 แสดงข้อมูล Profile ในหน้าเดียว — Avatar + Detail Cards โดยไม่มี Tab Switching
- [x] 6.8 ปรับ Layout เนื้อหา — แก้ไขปัญหาเนื้อหาล้น/ตกขอบ ให้ข้อมูลแสดงครบถ้วนภายใน Drawer

## 7. ปรับ User Create/Edit Modal

- [x] 7.1 ปรับ Modal Structure — ใช้ `ModalShell` component
- [x] 7.2 ปรับ Form Layout — 2 คอลัมน์ (grid-cols-2) สำหรับ: ชื่อ-นามสกุล, อีเมล, ตำแหน่ง, หน่วยงาน, Role, สถานะ
- [x] 7.3 ปรับ Form Fields — ใช้ Label + Required Indicator (*), Input/Select ใช้ style ใหม่ (`h-10 rounded-lg border-tu-border`)

## 8. ปรับ Role Create Modal

- [x] 8.1 ปรับ Role Create Modal — ใช้ `ModalShell`, ฟอร์มสำหรับ ชื่อ Role + คำอธิบาย
- [x] 8.2 เพิ่ม Permission Groups — Checkbox ราย Module (7 รายการ) พร้อม Action sub-checkboxes

## 9. API Endpoints และ Real Integration

- [x] 9.1 สร้าง `POST /api/users/[id]/force-sign-out` — Force Sign Out ทุก Session
- [x] 9.2 สร้าง `GET /api/permissions` — ดึง Permission Matrix จาก `ROLE_PERMISSIONS`
- [x] 9.3 เชื่อม More Menu Actions กับ API endpoints จริงทั้งหมด (8 Actions: +Enable/Disable, Reset MFA→MFA_PENDING)
- [x] 9.4 เชื่อม Permission Preview กับ API จริง (ไม่ใช้ Mock Data)
- [x] 9.5 Enable Account — เปลี่ยน status เป็น ACTIVE ผ่าน `PATCH /api/users` เมื่อ status เป็น INACTIVE/MFA_PENDING
- [x] 9.6 Disable Account — เปลี่ยน status เป็น INACTIVE ผ่าน `PATCH /api/users` เมื่อ status เป็น ACTIVE
- [x] 9.7 Reset MFA — เปลี่ยน status เป็น MFA_PENDING หลังรีเซ็ต
- [x] 9.8 Delete User — Hard Delete ผ่าน `prisma.user.delete` (ไม่ใช่ Soft Delete) + Confirmation
- [x] 9.9 View Audit Log — นำทางไป `/audit-log/activity-log?userId=:id` + หน้า Audit Log อ่าน userId จาก URL เป็นค่าเริ่มต้น
- [x] 9.10 ตรวจสอบ Status Transitions — Enable→ACTIVE, Disable→INACTIVE, Reset MFA→MFA_PENDING ทำงานถูกต้อง

- [x] 9.1 ปรับ `role-management/page.tsx` — ปรับ UI ให้สอดคล้องกับ Design Reference (Header, Search, Role List, Permission Preview)
- [x] 9.2 ปรับ `permission-management/page.tsx` — ปรับ UI ให้สอดคล้องกับ Design Reference

## 10. แก้ไข Filter URL Bug

- [x] 10.0 ปรับ `user-management/page.tsx` — เปลี่ยน `router.push` เป็น `router.replace` เพื่อให้ URL อยู่ที่ `/users?role=xxx` แทน `/users/user-management?role=xxx&page=1`

## 11. ทดสอบและตรวจสอบ

- [x] 11.1 ทดสอบ More Menu — View Details, Enable/Disable Account, Edit User, Reset MFA→MFA_PENDING, Force Sign Out, View Audit Log (userId), Delete User + Confirm
- [x] 11.2 ทดสอบ Permission Preview — 9 Modules เรียงตาม Sidebar, API จริง
- [x] 11.3 ทดสอบ Filter URL — อยู่ที่ `/users` ตลอดเมื่อเลือก Filter
- [x] 11.4 ตรวจสอบ Responsive — Desktop, Laptop, Tablet, Mobile
- [x] 11.5 ตรวจสอบ Accessibility — Keyboard Navigation, Focus Visible, ARIA Labels, Touch Target 44×44px
- [x] 11.6 ตรวจสอบ Design Tokens — ใช้ CSS Variables ทั้งหมด ไม่มี Hex Color หลุด
- [x] 11.7 ตรวจสอบ Functional — ทุก Business Logic, Auth, RBAC, API, State Management, Workflow คงเดิม 100%
