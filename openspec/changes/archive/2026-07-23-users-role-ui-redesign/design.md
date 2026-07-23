## Context

หน้า Users & Roles (`/users`) ปัจจุบันใช้โครงสร้างแบบ Tabs (User Management, Role Management, Permission Management, AD Sync) โดยมี `_components/` แยกย่อยสำหรับ Table, Filters, Action Bar, Drawer, Dialogs ฯลฯ ซึ่งใช้ Design Tokens (`--tu-*`) บางส่วนแต่ยังไม่สอดคล้องเต็มรูปแบบกับ Design System มาตรฐานตาม `claude.md`

Design Reference (ไฟล์แนบ `page (5).tsx`) แสดง UI ใหม่ที่ใช้ Design Tokens เต็มรูปแบบ พร้อม Component Patterns ที่เป็นมาตรฐานเดียวกันทั่วทั้งแพลตฟอร์ม

**Constraints:**
- ห้ามแก้ไข Business Logic, API, Database, Auth, RBAC, Permissions, State Management
- คงโครงสร้าง Tab และ Routing เดิม
- คง URL-based state management เดิม

## Goals / Non-Goals

**Goals:**
- ปรับ UI ของหน้า Users & Roles ทั้งหมดให้ตรงตาม Design Reference
- เพิ่ม Shared Components ใหม่ (Avatar, StatusBadge, RoleBadge, ModalShell) ใน `components/shared/` หรือ `components/ui/` เพื่อให้ใช้ซ้ำได้ทั่วทั้งแพลตฟอร์ม
- ใช้ Design Tokens `--tu-*` 100% ไม่มี Hex Color หลุด

**Non-Goals:**
- ไม่เปลี่ยนแปลง Logic การทำงานใดๆ
- ไม่เพิ่ม/ลบ Feature
- ไม่เปลี่ยน Data Flow
- ไม่แก้ไข Component ที่ไม่ได้เกี่ยวข้องกับ Users & Roles

## Decisions

### Decision 1: Strategy — ปรับ Styling ใน Existing Components vs. Rewrite

**เลือก:** ปรับ Styling ใน Existing Components โดยอิงจาก Design Reference

**เหตุผล:**
- Components ปัจจุบันมีโครงสร้างข้อมูลและ Logic ที่สมบูรณ์อยู่แล้ว
- การ Rewrite ทั้งหมดเสี่ยงทำ Logic พัง
- ใช้วิธี Replace Styling (className, structure) ในไฟล์เดิมเพื่อให้ได้ UI ใหม่

**Alternatives considered:**
- ❌ Rewrite ทั้งหน้าใหม่: เสี่ยงมาก, ใช้เวลานาน, โอกาสทำ Logic พังสูง
- ❌ สร้างหน้าใหม่คู่ขนาน: เพิ่มภาระ maintenance, ซ้ำซ้อน

### Decision 2: Shared Components

**เลือก:** สร้าง Shared Components ใหม่ใน `components/shared/` สำหรับ patterns ที่ใช้ซ้ำ

| Component | ไฟล์ | รายละเอียด |
|---|---|---|
| `Avatar` | `components/shared/user-avatar.tsx` | วงกลมสี, ตัวย่อชื่อ, รองรับรูปภาพ |
| `StatusBadge` | `components/ui/badge.tsx` (extend) | Badge พร้อม icon, สีตามสถานะ |
| `RoleBadge` | `components/shared/role-badge.tsx` | Badge พร้อม icon Shield, สีตาม Role |
| `ModalShell` | `components/shared/modal-shell.tsx` | โครงสร้าง Modal มาตรฐาน (Header, Body, Footer) |

**เหตุผล:** Components เหล่านี้ถูกใช้ในหลายที่ของ Design Reference และสามารถ reuse ในหน้าอื่นของแพลตฟอร์มได้

### Decision 3: Design Token Mapping

ออกแบบการ Map ระหว่างสไตล์ใน Design Reference → CSS Variables:

| องค์ประกอบ | CSS Variable |
|---|---|
| พื้นหลังหลัก | `var(--tu-bg)` |
| พื้นหลัง Card/Container | `var(--tu-surface)` |
| ขอบ | `var(--tu-border)` |
| สีหลัก (Primary) | `var(--tu-primary)` |
| สีหลัก Hover | `var(--tu-primary-hover)` |
| สีหลักพื้นหลังอ่อน | `var(--tu-primary-soft)` |
| สีรอง (Secondary) | `var(--tu-secondary)` |
| ข้อความหลัก | `var(--tu-text-primary)` |
| ข้อความรอง | `var(--tu-text-secondary)` |
| ข้อความ muted | `var(--tu-text-muted)` |

### Decision 4: Tab Navigation — คงโครงสร้างเดิม

**เลือก:** คงโครงสร้าง Tabs เดิม (`/users/user-management`, `/users/role-management`, ฯลฯ) โดยปรับ Styling ของ Tab Container ให้ใช้ `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5` ตามมาตรฐาน `5.4a` ของ `claude.md`

**เหตุผล:** ระบบ Tab และ Routing เป็น Logic หลักที่ห้ามแก้ไข

### Decision 5: Permission Preview — Direct Mapping from ROLE_PERMISSIONS

**เลือก:** Permission Preview คำนวณจาก `ROLE_PERMISSIONS` โดยตรง (import จาก `@/lib/permissions`) ด้วย `PERM_CODE_MAP` — แต่ละ permission code map ไปยัง module และ action แบบ 1:1 deterministic ไม่ใช้ API call ไม่ใช้ semantic matching

| Permission Code Example | Module | Action |
|---|---|---|
| `DASHBOARD_VIEW` | dashboard | view |
| `DASHBOARD_MANAGE` | dashboard | create |
| `INTRANET_CREATE` | intranet | create |
| `DOCUMENTS_UPLOAD` | documents | create |
| `USERS_DELETE` | users | delete |
| `USERS_EXPORT_SELECTED` | users | export |
| `AUDIT_LOG_EXPORT` | audit_log | export |

**ไม่ใช้ API fetch** — `computePermissions()` ทำงาน synchronously ใน `useMemo` → ไม่มี loading state, ไม่มี network delay, แสดงผลถูกต้อง 100%

**เหตุผล:** กำจัดปัญหา semantic matching ที่คลาดเคลื่อน (`manage` ≠ `create` ในบาง context); ไม่ต้องพึ่ง API — ข้อมูลมาจาก source of truth เดียวกัน (`permissions.ts`)

### Decision 6: Toolbar Button Ordering — Import → Export → เพิ่มผู้ใช้

**เลือก:** เรียงปุ่ม Toolbar จากซ้ายไปขวาเป็น Import → Export → เพิ่มผู้ใช้งาน โดยวางชิดขวา และลบปุ่ม Bulk Actions ออก

**เหตุผล:**
- ปุ่ม Bulk Actions ซ้ำซ้อนกับ Bulk Action Bar ที่แสดงเมื่อมีการเลือกผ่าน Checkbox แล้ว
- การเรียง Import → Export → เพิ่มผู้ใช้ เป็นไปตาม Design Reference
- ลดความซับซ้อนของ Toolbar

### Decision 7: Layout Container — ใช้ Max-Width เท่ากับหน้าอื่น

**เลือก:** ใช้ `mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10` เป็น container หลักของหน้า Users & Roles

**เหตุผล:** ให้ Layout กว้างเท่ากับหน้าอื่นในระบบ (เช่น Dashboard, Application Hub) — สอดคล้องกับ Design Reference

### Decision 8: Filter Dropdown Style — ไม่ใส่สีพื้นหลังเมื่อเลือก

**เลือก:** เมื่อ Filter มีค่าที่เลือก (active) ให้เปลี่ยนเฉพาะขอบเป็น `border-[var(--tu-primary)]/40` โดยไม่ใส่สีพื้นหลัง (`bg-white` ปกติ) และขนาดของ Filter Bar ต้องคงเดิมไม่เปลี่ยนแปลงเมื่อเลือก Filter

**เหตุผล:** ลด visual noise, ทำให้ Filter Bar ดูสะอาดขึ้นตาม Design Reference — ใช้แค่ขอบและ icon เปลี่ยนสีเพื่อบอกว่ามีการกรองอยู่; การคงขนาด Layout ป้องกันการกระพริบหรือการจัดวางที่เปลี่ยนไปเมื่อผู้ใช้เลือก Filter

### Decision 9: Drawer — ลบ Tabs ทั้งหมด, แสดงข้อมูลเต็ม

**เลือก:** ลบเมนู Tabs (Profile, Roles, Permissions, Activity, Sessions) ออกจาก User Detail Drawer ทั้งหมด แสดงเฉพาะข้อมูล Profile ในรูปแบบ Detail Cards (Email, Department, Auth Source, Last Login) ภายใน Drawer เดียว และปรับ Layout ให้เนื้อหาแสดงครบถ้วนไม่ล้นหรือตกขอบ

**เหตุผล:**
- ลดความซับซ้อนของ Drawer — ข้อมูลที่จำเป็นต้องดูกระจุกอยู่ในหน้า Profile
- ข้อมูล Roles, Permissions, Activity, Sessions สามารถดูได้จากหน้าอื่นในระบบ
- ปัญหาเนื้อหาล้นเกิดจาก Tabs ทำให้มี content ซ้อนกัน — การลดเหลือหน้าเดียวทำให้จัดการ Layout ได้ง่ายขึ้น

### Decision 10: Role Names — ใช้ภาษาอังกฤษในทุกจุด

**เลือก:** ใช้ชื่อ Role ภาษาอังกฤษในคอลัมน์ Role ของตารางและ Role Filter: Super Admin, System Admin, Dean, Dept Admin, User, Viewer

**เหตุผล:**
- ชื่อ Role ในระบบ (roleCode) เป็นภาษาอังกฤษอยู่แล้ว (`super_admin`, `system_admin`, ฯลฯ)
- การใช้ชื่อภาษาอังกฤษใน UI ทำให้สอดคล้องกับระบบ backend และลดความสับสน
- ชื่อไทยยังคงใช้ในหน้า Role Management สำหรับรายละเอียด

### Decision 11: Actions Column — More (...) 8 Actions

**เลือก:** ปุ่ม More (...) เปิด Dropdown Menu พร้อม 8 Actions ที่ทำงานผ่าน API จริง:

| # | Action | API Endpoint | Permission | Description |
|---|---|---|---|---|
| 1 | View Details | `GET /api/users/:id` | `USERS_VIEW` | เปิด Drawer |
| 2 | Enable Account | `PATCH /api/users` | `USERS_BULK_ENABLE` | Status → ACTIVE |
| 3 | Disable Account | `PATCH /api/users` | `USERS_BULK_DISABLE` | Status → INACTIVE |
| 4 | Edit User | `GET/PUT /api/users/:id` | `USERS_EDIT` | Modal |
| 5 | Reset MFA | `POST /api/users/:id/reset-mfa` | `USERS_RESET_MFA` | Status → MFA_PENDING |

**Status Transition Rules (Delete):**
- Delete User → Hard Delete ผ่าน `prisma.user.delete` — ข้อมูลถูกลบถาวร ไม่ใช่ Soft Delete

**Status Transition Rules:**
- Enable Account → `ACTIVE` (ใช้ `PATCH /api/users` action: `enable`)
- Disable Account → `INACTIVE` (ใช้ `PATCH /api/users` action: `disable`)
- Reset MFA → `MFA_PENDING` (ใช้ `POST /api/users/:id/reset-mfa` — API เปลี่ยนทั้ง `userMfa.isEnabled=false` และ `user.status=MFA_PENDING`)
| 6 | Force Sign Out | `POST /api/users/:id/force-sign-out` | `USERS_EDIT` | ทุก Session |
| 7 | View Audit Log | Navigate to `/audit-log?userId=:id` | `AUDIT_LOG_VIEW` | เฉพาะ User, หน้า Audit Log อ่าน `userId` จาก URL และใช้เป็นค่าเริ่มต้น |
| 8 | Delete User | `DELETE /api/users/:id` | `USERS_DELETE` | Hard delete (`prisma.user.delete`) + Confirm |

**Visibility Rules:**
- Enable Account: แสดงเมื่อ status เป็น INACTIVE หรือ MFA_PENDING
- Disable Account: แสดงเมื่อ status เป็น ACTIVE
- Delete User: แสดงเฉพาะ Super Admin / System Admin

**เหตุผล:** Enable/Disable วางต่อจาก View Details เพื่อให้การเปลี่ยนสถานะเป็น action ที่เข้าถึงเร็ว; Reset MFA ต้องเปลี่ยนสถานะเป็น MFA_PENDING; Audit Log ต้องกรองเฉพาะ userId

### Decision 12: All Features — Real API Integration

**เลือก:** ทุกฟีเจอร์ต้องทำงานผ่าน API จริง ไม่ใช้ Mock Data

| Feature | Data Source |
|---|---|
| Permission Preview | `GET /api/permissions` → `getActions()` maps raw actions to 5 UI actions |

**Permission Mapping (getActions) — Semantic matching:**

| UI Action | Matches raw permission codes |
|---|---|
| `view` | `view` |
| `create` | `create`, `manage`, `upload`, `pin`, `bulk_import`; หรือมีมากกว่า 1 action และมี `view` |
| `update` | `edit`, `manage`, `update`, `approve`, `publish`, `manage_*` (prefix) |
| `delete` | `delete`, `manage_pool` |
| `export` | `export`, `export_*` (prefix) |
| User Table | `GET /api/users` |
| User Detail Drawer | `GET /api/users/:id` |
| Enable/Disable Account | `PATCH /api/users` (bulk, single user) |
| Edit User Modal | `GET /api/users/:id` → `PUT /api/users/:id` |
| Reset MFA | `POST /api/users/:id/reset-mfa` → status=MFA_PENDING |
| Force Sign Out | `POST /api/users/:id/force-sign-out` |
| Delete User | `DELETE /api/users/:id` |
| View Audit Log | Navigate to `/audit-log/activity-log?userId=:id` |

**เหตุผล:** ข้อกำหนดระบุว่าทุกฟีเจอร์ต้องใช้งานได้จริง — Mock Data ใช้สำหรับ Development Preview เท่านั้น

### Decision 13: Filter URL — ใช้ Query Params บนหน้า `/users` โดยตรง

**เลือก:** เมื่ออยู่ที่ `/users` และเลือก Filter ให้ URL เป็น `/users?role=xxx&status=xxx` โดยไม่เปลี่ยน path ไปเป็น `/users/user-management?role=xxx&page=1`

**การแก้ไข:** ใน `user-management/page.tsx` ฟังก์ชัน `updateUrl()` ใช้ `router.push(\`/users/user-management${qs}\`)` — ต้องเปลี่ยนเป็น `router.replace(qs, { scroll: false })` เพื่ออัปเดต query params โดยไม่เปลี่ยน path

**เหตุผล:**
- ผู้ใช้อยู่ที่ `/users` (Tab User Management เป็น default) — URL ควรสะท้อน path ปัจจุบัน
- การเปลี่ยน path ทำให้เกิด navigation ซ้ำซ้อนและ URL ไม่สอดคล้องกับ UI

### Decision 14: StatusBadge Mapping — ใช้ Label ตรงกับ DB Status

**เลือก:** StatusBadge แสดง Label ตรงกับค่า DB Status:

| DB Status | Label | Icon | Color |
|---|---|---|---|
| ACTIVE | Active | CircleCheck | Emerald |
| INACTIVE | Inactive | CircleMinus | Rose |
| MFA_PENDING | MFA Pending | CircleAlert | Amber |

**⚠️ Bug Fix:** เดิม `INACTIVE` → `suspended` (label "Suspended") และ `MFA_PENDING` → `invited` (label "Invited") — ต้องเปลี่ยนให้แสดง Label ตรงกับ DB Status

**เหตุผล:** ผู้ใช้เห็น Status ในตารางแล้วต้องตรงกับ Status จริงในระบบ — "Inactive" กับ "MFA Pending" สื่อความหมายได้แม่นยำกว่า "Suspended" กับ "Invited"

### Decision 15: Sortable Columns — ทุก Column เรียงลำดับได้

**เลือก:** ทุกคอลัมน์ใน User Table (ยกเว้น Checkbox และ Actions) รองรับการคลิกที่ Header เพื่อเรียงลำดับ (Ascending / Descending) โดยส่ง `sortBy` และ `sortDir` ไปยัง API

| Column | sortBy value | Sort Mechanism |
|---|---|---|
| User | `name` | Prisma: `firstNameTh` |
| Department | `department` | Prisma: `department.name` |
| Role | `role` | In-memory: `ROLE_LEVELS` (Super Admin=100 → Viewer=10) |
| Status | `status` | Prisma: `status` |
| Last Login | `lastLogin` | In-memory: `loginHistories[0].createdAt` |

**UI Indicators:**
- Header ที่คลิกได้มี cursor-pointer และ hover effect
- แสดงลูกศร ↑ (ascending) หรือ ↓ (descending) ข้างชื่อคอลัมน์ที่กำลังเรียง
- ค่าเริ่มต้น: เรียงตาม `createdAt` แบบ descending (ใหม่สุดก่อน)

**เหตุผล:** ตามมาตรฐาน `5.7 Table Standard` ใน `claude.md` — ทุก Data Table ต้องรองรับ Sort; API รองรับ `sortBy` และ `sortDir` query params อยู่แล้ว

## Risks / Trade-offs

- **Risk:** การแก้ className อาจกระทบ Layout → **Mitigation:** แก้ทีละ Component, ทดสอบด้วย Dev Server ทุกครั้ง
- **Risk:** สีหรือ Token อาจไม่ตรงกับ Design Reference → **Mitigation:** เทียบกับ Design Reference โดยตรง, ใช้ CSS Variables ทุกจุด
- **Risk:** Shared Components ใหม่อาจมี API ไม่ครอบคลุม → **Mitigation:** ดูจาก Design Reference เพื่อกำหนด Props ให้ครบถ้วน
- **Trade-off:** Permission Preview ใช้ Mock Data → เมื่อเชื่อม Logic จริงในอนาคต ต้องปรับ Props และ Data Flow
- **Trade-off:** ทุกฟีเจอร์ใช้ API จริง → ต้องเพิ่ม API endpoints (`/api/users/:id/force-sign-out`, `/api/permissions`) ถ้ายังไม่มี → อาจต้องสร้าง Route Handler ใหม่
- **Risk:** Delete User ผ่าน More Menu → ต้องมี Confirmation Dialog ป้องกันการลบผิดพลาด

## Migration Plan

1. สร้าง Shared Components ใหม่ก่อน (Avatar, StatusBadge, RoleBadge, ModalShell)
2. ปรับ Styling ระดับบนสุด: `/users/page.tsx` (Tab Container, Header, Description, Layout Container)
3. ปรับ Toolbar: `/users/_components/user-action-bar.tsx` (เรียง Import → Export → เพิ่มผู้ใช้, ลบ Bulk Actions)
4. ปรับ Filter: `/users/_components/user-filters.tsx` (ลบสีพื้นหลัง, คงขนาด Layout, ชื่อ Role ภาษาอังกฤษ)
5. ปรับ Filter URL Routing: `/users/user-management/page.tsx` (ใช้ `router.replace` แทน `router.push` — อยู่ที่ `/users` ตลอด)
6. ปรับ Table: `/users/_components/user-table.tsx` (Role ภาษาอังกฤษ, Actions เหลือปุ่ม More ปุ่มเดียว)
7. ปรับ More Menu: `/users/_components/user-action-menu.tsx` (8 Actions: +Enable/Disable หลัง View, Reset MFA→MFA_PENDING)
8. ปรับ Permission Preview: `/users/_components/role-summary.tsx` (9 Modules, API จริง)
9. ปรับ Drawer: `/users/_components/user-detail-drawer.tsx` (ลบ Tabs, เพิ่มฟิลด์, API จริง)
10. สร้าง API endpoints ที่ขาด: force-sign-out, permissions
11. ทดสอบแบบ Manual ทุก Flow (8 More Actions, Permission Preview, Drawer, Filter URL)
12. ตรวจสอบ Responsive Design บนทุก Breakpoint

**Rollback:** หากพบปัญหา ให้ Revert ไฟล์ที่แก้ไขผ่าน Git — Components เดิมไม่ถูกลบ
