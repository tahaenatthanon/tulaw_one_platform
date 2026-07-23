## Context

หน้า Audit Log (`/audit-log/activity-log`) ปัจจุบันมี UI แบบเรียบง่าย ใช้ `Badge` component สำหรับ Action/Status, ตารางแบบ basic, Drawer สำหรับรายละเอียด มี `Suspense` + `useSearchParams` สำหรับ URL-based filtering รองรับการ Export CSV/XLSX

Design Reference (ไฟล์แนบ `AuditLogPage.tsx`) แสดง UI ใหม่แบบ Enterprise ที่ใช้ Design Language เดียวกับ Application Hub

**Constraints:**
- ห้ามแก้ไข Business Logic, API, Database, Auth, RBAC, State Management
- คงโครงสร้าง Routing และ URL-based state management เดิม
- คง Logic: search, filter, sort, pagination, export

## Goals / Non-Goals

**Goals:**
- ปรับ UI ของหน้า Audit Log ทั้งหมดให้ตรงตาม Design Reference
- ใช้ Design Tokens `--tu-*` 100%
- รองรับ Responsive

**Non-Goals:**
- ไม่เปลี่ยนแปลง Logic การทำงานใดๆ
- ไม่เพิ่ม/ลบ Feature
- ไม่เปลี่ยน Data Flow
- ไม่แก้ไข Component ที่ไม่ได้เกี่ยวข้องกับ Audit Log

## Decisions

### Decision 1: Strategy — ปรับ Styling ใน Existing File

**เลือก:** ปรับ Styling ใน `activity-log/page.tsx` โดยอิงจาก Design Reference — เขียนใหม่เฉพาะส่วน UI (JSX/className) คง State, Hooks, Logic, API calls เดิมทั้งหมด

**Alternatives considered:**
- ❌ Rewrite ทั้งไฟล์: อาจลบ logic สำคัญโดยไม่ตั้งใจ
- ❌ สร้างไฟล์ใหม่: duplicate code, maintenance ยุ่งยาก

### Decision 2: Shared Components

| Component | ใช้จาก | รายละเอียด |
|---|---|---|
| `StatusBadge` | `components/shared/status-badge.tsx` | ใช้ที่มีอยู่แล้ว |
| `JsonViewer` | `components/shared/json-highlight.tsx` | ใช้ที่มีอยู่แล้ว |
| Skeleton | สร้างในไฟล์ | `SkeletonRows` component แบบ inline |

### Decision 3: More Menu — ปุ่มเดียว

**เลือก:** แสดงเฉพาะปุ่ม More (...) ในตาราง — ภายในมี View Details, Copy Log ID, Export

**เหตุผล:** `RowActions` component เลียนแบบ Design Reference — ลด clutter ในตาราง

### Decision 4: Detail Drawer — Card + Timeline

**เลือก:** Drawer แสดงข้อมูลในรูปแบบ Section Card (ข้อมูลทั่วไป, ผู้ใช้งาน, ข้อมูลคำขอ) + Timeline (Request → Execute → Persisted) + JSON Viewer สำหรับ Before/After

**เหตุผล:** Card Layout อ่านง่าย, Timeline ให้เห็นลำดับเหตุการณ์, JSON Viewer สำหรับข้อมูล structured

### Decision 5: Filter Bar — Fixed Layout

**เลือก:** Advanced Filters อยู่ใน container เดียวกับ Search — เมื่อเลือก Filter ขนาดคงเดิม มี toggle expand/collapse

**เหตุผล:** ป้องกัน layout shift, ใช้ `min-w-0` + `shrink-0` + fixed grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-6`)

### Decision 6: Before/After — Stacked Vertically

**เลือก:** Before/After Changes แสดงผลแบบ stacked (Before ด้านบน, After ด้านล่าง) ใช้ `grid-cols-1` โดยแสดงทั้ง 2 panels ตลอดเวลา แม้ข้อมูลฝั่งใดฝั่งหนึ่งจะว่างเปล่า (แสดง "No data" แทน) ใช้ `!= null` (explicit null check) และ API ใช้ `??` (nullish coalescing)

**เหตุผล:** ผู้ใช้เห็นข้อมูลครบทั้งก่อนและหลังในมุมมองเดียว — เข้าใจการเปลี่ยนแปลงได้ทันที; ใช้ `!= null` (explicit null check) แทน truthiness เพื่อไม่ให้ empty string (`""`) ถูกซ่อน

**เหตุผล:** ผู้ใช้เห็นข้อมูลครบทั้งก่อนและหลังในมุมมองเดียว; ใช้ `!= null` (explicit null check) แทน truthiness เพื่อไม่ให้ empty string (`""`) ถูกซ่อน; API ใช้ `??` (nullish coalescing) แทน `\|\|` เพื่อส่งผ่าน empty strings

## Risks / Trade-offs

- **Risk:** การแก้ JSX อาจกระทบ Logic → **Mitigation:** ใช้วิธี replace เฉพาะส่วน UI, ทดสอบทุก Flow
- **Trade-off:** Skeleton + Drawer complexity → ต้องทดสอบ loading/error states

## Migration Plan

1. อ่าน Design Reference + Existing Code → เข้าใจ Logic ทั้งหมด
2. ปรับ Search + Advanced Filters (คง logic, เปลี่ยน UI)
3. ปรับ Audit Log Table (Sticky Header, Status Badge, More Menu, Skeleton)
4. ปรับ Detail Drawer (Card + Timeline + JSON Viewer)
5. ปรับ Empty State
6. ทดสอบ: search, filter, sort, pagination, export, view detail, copy, responsive
7. ตรวจสอบ Design Tokens

**Rollback:** Git revert
