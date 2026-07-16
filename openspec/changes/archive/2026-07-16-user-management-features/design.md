## Context

ปัจจุบันหน้า User Management (`app/(dashboard)/users/`) มี UI แบบ Tab-based แบ่งเป็น User Management, Role Management, Permission Management, AD Sync โดยใช้ข้อมูล Mock (`generateUsers()`) และมีระบบกรองข้อมูลเบื้องต้น (Search, Status) ผ่าน API จริงที่ `/api/users`

ความต้องการใหม่ต้องการยกระดับ User Management ให้เป็นระบบจัดการผู้ใช้ระดับองค์กรที่สมบูรณ์ รองรับ:
- Bulk Actions กับผู้ใช้หลายราย
- Action Menu แบบละเอียดในแต่ละแถว
- User Detail Drawer แทน Modal
- Advanced Filters ครอบคลุมทุกมิติ
- Pagination Options หลากหลาย
- Authentication Source (LDAP/Local)
- Real-time Behavior

**ข้อจำกัด:**
- LDAP User เป็น Primary Source — แก้ไขผ่าน AD แล้วซิงค์กลับเท่านั้น
- Local User ใช้เฉพาะ Dev และ Emergency Admin
- System Admin ห้ามลบ/เปลี่ยน Role ของ Super Admin
- Dept Admin เห็นเฉพาะผู้ใช้ในหน่วยงานตนเอง

## Goals / Non-Goals

**Goals:**
- ปรับโครงสร้าง UI User Management ใหม่ภายในหน้าเดิม พร้อม Action Bar, Filters, Table, Pagination
- **คงแท็บเมนูเดิมไว้ทั้งหมด:** User Management, Role Management, Permission Management, AD Sync
- รองรับ Bulk Actions (Assign Role, Enable, Disable, Unlock Account, Reset MFA, Export Selected)
  - ตัวกรอง Role ใน Bulk Action แสดงตามลำดับ: All Role → Super Admin → System Admin → Dean → Dept Admin → User → Viewer
  - ตัวกรอง Department ใน Bulk Action: "All Departments" เป็นตัวเลือกแรก + ดึงรายการหน่วยงานจากข้อมูลจริง
- แทนที่ Modal ด้วย Drawer สำหรับ User Detail โดย Drawer ทุกประเภทมีขนาดเหมาะสม รองรับ Responsive
- เพิ่ม Action Menu แบบ Context Menu (⋮) ในแต่ละแถว — ทุกเมนูต้องเรียก Backend จริง
- รองรับ Advanced Filters และ Search ทุกฟิลด์ ค้นหาจากข้อมูลจริงของระบบ
- รองรับ Pagination Options (10, 25, 50, 100) และแสดงจำนวนข้อมูล
- ตารางผู้ใช้แสดงข้อมูลทุกคอลัมน์ในบรรทัดเดียว (no text wrapping)
- แยกประเภทผู้ใช้ตาม Authentication Source (LDAP/Local)
- การกระทำที่มีผลทันที (Real-time): Assign Role, Enable/Disable, Unlock Account, Reset MFA
- รองรับ CSV Import/Export และ AD Sync
- **ทุกฟังก์ชันต้องทำงานกับ Backend จริง ห้ามใช้ Mock Data หรือ Placeholder**

**Non-Goals:**
- ไม่สร้าง Local User ใหม่ผ่าน CSV Import
- ไม่แก้ไขระบบ Authentication จริง (Auth Provider)
- ไม่ implement Microsoft SSO จริง (ใช้ Mock ในขั้นตอนนี้)

## Decisions

### 1. สถาปัตยกรรมหน้า: Tab-based + User Management เป็น Single Page ในแท็บ

**เลือก:** คงโครงสร้าง Tab-based เดิม (User Management, Role Management, Permission Management, AD Sync) โดยหน้า User Management ภายในแท็บเป็น Single Page พร้อมทุกฟีเจอร์
**เหตุผล:** ผู้ใช้คุ้นเคยกับ Tab-based อยู่แล้ว, Role/Permission/AD Sync เป็นหน้าอิสระที่มี logic แตกต่าง การคงแท็บไว้ช่วยให้การนำทางชัดเจนและ scale ได้ง่าย
**ทางเลือกที่พิจารณา:** Single Page รวมทุกอย่าง → ซับซ้อนและไม่สอดคล้องกับโครงสร้างเดิม

### 1.1 Tab Menu Structure

```
/users
├── /user-management    # Single Page: Action Bar + Filters + Table + Drawer
├── /role-management    # หน้าจัดการ Role
├── /permission-management  # หน้าจัดการ Permission
└── /ad-sync            # หน้า AD Sync
```

### 2. Bulk Action — Data-Driven Dropdowns

**เลือก:** ตัวกรอง Role และ Department ใน Bulk Action Bar ดึงข้อมูลจาก API จริง (GET /api/roles, GET /api/departments)
**ลำดับ Role:** All Role, Super Admin, System Admin, Dean, Dept Admin, User, Viewer (เรียงตาม level จากมากไปน้อย)
**Department:** "All Departments" เป็นตัวเลือกแรก ตามด้วยรายการหน่วยงานจากระบบ
**เหตุผล:** ข้อมูลต้องสอดคล้องกับฐานข้อมูลจริง ไม่ hardcode ใน frontend

### 3. Responsive Drawer Sizes

**เลือก:** ใช้ CSS variables และ responsive breakpoints สำหรับ Drawer:
- Desktop (≥1024px): width 440px, max-width 90vw
- Tablet (768-1023px): width 380px, max-width 90vw
- Mobile (<768px): full-screen (100vw)
**เหตุผล:** ป้องกันข้อมูลล้นและพื้นที่ว่างมากเกินไปในทุกขนาดหน้าจอ

### 4. Real Backend Integration — No Mock Data

**เลือก:** ทุก component ต้องเรียก API จริง ไม่มี fallback ไปใช้ mock data
- Table: GET /api/users
- Action Menu: PATCH /api/users, POST /api/users/:id/unlock, POST /api/users/:id/reset-mfa
- Filters: ส่ง query params ไปยัง GET /api/users
- Search: ส่ง search param ไปยัง GET /api/users (ค้นหาข้ามฟิลด์ที่ server)
- Bulk Actions: PATCH /api/users (action + userIds)
- CSV Import: POST /api/users/import-csv
- CSV Export: GET /api/users/export-csv
- Drawer: GET /api/users/:id
**เหตุผล:** ตาม requirement ที่ระบุว่าห้ามใช้ Mock Data

### 5. Data-Driven Dropdowns in Filters & Bulk Actions

**เลือก:** ตัวเลือกใน Dropdown ทั้งหมด (Role, Department) ต้องดึงจาก API หรือ constants ที่สัมพันธ์กับฐานข้อมูลจริง
- Role dropdown: ดึงจาก GET /api/roles (หรือใช้ ROLE_LEVELS constant ที่ sync กับ DB)
- Department dropdown: ดึงจาก GET /api/departments
**เหตุผล:** ตัวเลือกต้องตรงกับข้อมูลในระบบ ป้องกัน inconsistency

### 6. Component Architecture

```
app/(dashboard)/users/
├── page.tsx                    # Main page (orchestrator)
├── user-management/
│   └── page.tsx                # User Management (refactored — Single Page)
└── _components/                # New components
    ├── user-action-bar.tsx      # Import/Export/AD Sync/Bulk Actions
    ├── user-bulk-action-bar.tsx # Bulk Actions (visible when items selected)
    ├── user-filters.tsx         # Advanced Filters
    ├── user-table.tsx           # Main Table
    ├── user-action-menu.tsx     # Context Menu (⋮) per row
    ├── user-detail-drawer.tsx   # Right-side Drawer (Profile, Roles, Permissions, Activity, Sessions)
    ├── user-import-dialog.tsx   # CSV Import Dialog
    └── user-export-dialog.tsx   # CSV Export Dialog
```

**เลือก:** Component-based decomposition แยกแต่ละส่วนเป็น component ย่อย
**เหตุผล:** Reusable, Testable, และง่ายต่อการ maintain

### 3. State Management: URL State + React State

**เลือก:** ใช้ `useUrlState` hook สำหรับ filters, search, pagination และใช้ `useState` สำหรับ selected items, drawer state, loading
**เหตุผล:** URL State ทำให้ shareable URLs และ browser back/forward ทำงานได้ถูกต้อง; React State สำหรับ UI-only state
**ทางเลือกที่พิจารณา:** Zustand/Context → Overkill สำหรับหน้าเดียว

### 4. API Design

**เลือก:** ขยาย `/api/users` เดิมด้วย endpoint ใหม่:
- `GET /api/users` — ดึงรายชื่อผู้ใช้ (มีอยู่แล้ว, เพิ่ม query params `authSource`, `mfa`, `lastLoginBefore`, `lastLoginAfter`)
- `POST /api/users/bulk` — Bulk Actions (`action` body: `assign-role`, `enable`, `disable`, `unlock`, `reset-mfa`)
- `POST /api/users/import-csv` — Import CSV
- `GET /api/users/export-csv` — Export CSV
- `POST /api/users/:id/unlock` — ปลดล็อกบัญชีรายบุคคล
- `POST /api/users/:id/reset-mfa` — รีเซ็ต MFA รายบุคคล
- `GET /api/users/:id` — ดึงรายละเอียดผู้ใช้ (พร้อม roles, permissions, activity, sessions)
- `GET /api/users/:id/activity` — ดึงประวัติกิจกรรม
- `GET /api/users/:id/sessions` — ดึง sessions

**เหตุผล:** RESTful, ใช้โครงสร้าง API เดิม, แยก Bulk Actions เป็น endpoint เฉพาะเพื่อความชัดเจน

### 5. Database Schema

**เลือก:** เพิ่มฟิลด์ใน `User` model:
- `authSource` (`String`, `"ldap"` | `"local"`, default `"ldap"`)
- `isLocked` (`Boolean`, default `false`)
- `lastAdSyncAt` (`DateTime?`)
- `ipAddress` (`String?`) — เก็บ IP ล่าสุดจากการ login

**และ** สร้าง `Permission` และ `RolePermission` models สำหรับ granular permissions.

**เหตุผล:** ข้อมูลเหล่านี้จำเป็นสำหรับฟีเจอร์ใหม่ และควรเก็บในตาราง User โดยตรงเพื่อประสิทธิภาพการ query

### 6. Real-time Behavior

**เลือก:** การกระทำ (Assign Role, Enable/Disable, Unlock, Reset MFA) มีผลทันทีผ่าน API call + invalidate client cache
**เหตุผล:** ตาม requirement ที่กำหนดให้มีผลทันที ไม่ต้องรีเฟรชหน้า; ใช้การ re-fetch จาก API หลังทุก operation

### 7. Real-time Bulk Action Filter

**เลือก:** เมื่อผู้ใช้เลือกค่าใน Bulk Action dropdown (Role หรือ Department) ระบบจะกรองข้อมูลในตารางตามเงื่อนไขที่เลือกทันที โดยไม่ต้องรอกดปุ่ม Apply
**กลไก:** Bulk Action dropdown onChange → update URL params (role/department filter) → trigger `fetchUsers()` → ตารางอัปเดตผลลัพธ์แบบ Real-time
**เหตุผล:** ลดจำนวนคลิก ผู้ใช้เห็นผลลัพธ์ทันทีที่เลือกเงื่อนไข สอดคล้องกับ UX แบบ Real-time

### 8. Active Tab Content Rendering

**เลือก:** ระบบแสดงเฉพาะข้อมูลของ Tab ที่กำลังใช้งาน (Active Tab) โดยใช้ Next.js nested routes (`/users/user-management`, `/users/role-management`, `/users/permission-management`, `/users/ad-sync`)
**กลไก:** `users/page.tsx` แสดง Tab Menu; `users/layout.tsx` ใช้ PermissionGuard; Next.js App Router จัดการ rendering เฉพาะ sub-page ของ active tab อัตโนมัติผ่าน `{children}`
**เหตุผล:** แยกการ render ตาม route ชัดเจน ไม่ต้องจัดการ conditional rendering ด้วยตนเอง, SEO-friendly URL, browser back/forward ทำงานได้ถูกต้อง

### 9. Sidebar Width Reduction

**เลือก:** ปรับลดความกว้าง Sidebar จากค่าเดิมให้แคบลงเพื่อเพิ่มพื้นที่แสดงผลของเนื้อหาหลัก
**ขนาด:** ลดจาก ~260px เป็น ~220px, ไอคอน 20px, ข้อความ 13px, padding ลดลง 4px
**เหตุผล:** ตารางผู้ใช้มีจำนวนคอลัมน์มาก (12 คอลัมน์) ต้องการพื้นที่แนวนอนมากที่สุดเท่าที่เป็นไปได้ โดยยังคงให้เมนูอ่านได้ชัดเจน

## Risks / Trade-offs

- **Bulk Actions กับผู้ใช้จำนวนมาก (>300):** อาจใช้เวลานานหากทำ sequential → ใช้ Promise.all() และแสดง progress
- **Bulk Action Real-time Filter:** การกรองทันทีทุกครั้งที่เปลี่ยนค่า dropdown อาจทำให้เกิด API call ถี่เกินไป → ใช้ debounce 300ms สำหรับการกรองที่ trigger API call
- **Drawer vs Modal:** Drawer อาจมีปัญหาบนมือถือ → Responsive: ใช้ Drawer บน Desktop, Modal/Full-screen บน Mobile
- **CSV Import ขนาดใหญ่:** อาจมีปัญหา memory → จำกัดขนาดไฟล์ (5MB) และจำนวนแถวต่อครั้ง (500 rows)
- **การซิงค์ AD:** อาจใช้เวลานาน → แสดงสถานะ Real-time ระหว่างซิงค์
- **Permission Granularity:** การเพิ่ม Permission codes ใหม่อาจกระทบ role existing → migration script เพื่อ assign default permissions
- **Sidebar Width Reduction:** เมนูภาษาไทยอาจถูกตัดหากแคบเกินไป → ใช้ `text-overflow: ellipsis` + tooltip สำหรับข้อความยาว และคงความกว้างขั้นต่ำ 200px
