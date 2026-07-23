## Why

หน้า Audit Log ปัจจุบันมี UI ที่ไม่ทันสมัย ขาดความเป็น Enterprise Application และไม่สอดคล้องกับ Design System มาตรฐานของ TULAW ONE Platform รวมถึงหน้า Application Hub ที่เพิ่งปรับปรุง การปรับปรุงครั้งนี้จะยกระดับ UI/UX ให้อยู่ในมาตรฐานเดียวกันทั้งระบบ โดยไม่กระทบกับ Business Logic, API, และ Workflow ที่มีอยู่เดิม

## What Changes

- ปรับโครงสร้าง Layout ใหม่ตาม Design Language เดียวกับ Application Hub: Search + Advanced Filters → Audit Log Table → Detail Drawer
- ออกแบบ Search ใหม่: รองรับการค้นหา User, Action, Module, Resource, IP Address — ใช้ Logic เดิมทั้งหมด
- ออกแบบ Advanced Filters ใหม่: รองรับช่วงวันที่, ผู้ใช้งาน, Module, Action, Status, Department — เมื่อเลือก Filter แล้วขนาด Layout คงเดิม, Filter Bar ไม่ขยายหรือย่อ
- ออกแบบตารางใหม่: Sticky Header, Hover Effect, Status Badge, ระยะห่างและ Typography ที่ดีขึ้น; ไม่เปลี่ยน Sorting, Filtering, Pagination
- เปลี่ยน Actions ในตารางให้เหลือเพียงปุ่ม More (...) — ภายในมี View Details, Copy Log ID, Export
- ออกแบบ Detail Drawer ใหม่: แสดงข้อมูลทั้งหมดในรูปแบบ Card Layout + Timeline; มี JSON Viewer สำหรับ Before/After Changes (Read-only, Expand/Collapse, Copy); มีปุ่ม Copy สำหรับข้อมูลที่จำเป็น; แสดงผลครบถ้วนไม่มีข้อมูลล้นหรือตกขอบ
- ออกแบบ Empty State ใหม่: รองรับ "ไม่มี Audit Log" และ "ไม่พบผลการค้นหา"
- ใช้ Skeleton Loading แทน Loading แบบเดิม
- ใช้ Design System (`--tu-*` tokens), Typography (Prompt font), Spacing (8px), Border Radius, Shadow, Components ให้สอดคล้องกับ Application Hub
- รองรับ Responsive: Desktop, Tablet, Mobile
- **UI/UX เท่านั้น** — ห้ามเปลี่ยน Business Logic, API, การสร้าง Audit Log, Workflow, State Management

## Capabilities

### New Capabilities

- `audit-log-ui-redesign`: ปรับปรุง UI/UX ของหน้า Audit Log ทั้งหมดให้สอดคล้องกับ TULAW ONE Design System และ Application Hub Design Language โดยรวมถึง Search, Advanced Filters, Audit Log Table, More Actions Menu, Detail Drawer (Timeline + Card Layout + JSON Viewer), Empty State, Skeleton Loading, Responsive Layout

### Modified Capabilities

<!-- No existing capability requirements are changing — this is a UI-only change -->

## Impact

- **Affected Files:**
  - `app/(dashboard)/audit-log/activity-log/page.tsx` — หน้าหลัก Activity Log (ปรับ UI ใหม่ทั้งหมด, คง Logic เดิม)
  - `app/(dashboard)/audit-log/` — layout, components ย่อย (ปรับ styling)
  - `components/shared/` — อาจเพิ่ม Shared Components (JsonViewer, StatusBadge, Skeleton) ถ้ายังไม่มี
- **No Impact:** API routes (`/api/audit-logs`), Prisma schema, auth logic, RBAC logic, audit log creation, export logic, state management, routing
- **Dependencies:** Design Reference จากไฟล์แนบ (AuditLogPage.tsx), Design System จาก `claude.md`
