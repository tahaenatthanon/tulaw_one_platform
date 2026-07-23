## 1. ปรับ Search + Advanced Filters

- [x] 1.1 ปรับ Search Bar — ใช้ style ใหม่ (rounded-xl, pl-9 pr-9, bg-surface, border), คง Logic ค้นหาเดิม (search query param)
- [x] 1.2 ปรับ Advanced Filters Toggle — ปุ่ม "Advanced Filters" พร้อม icon SlidersHorizontal, แสดงจำนวน filter ที่ใช้งาน, toggle expand/collapse
- [x] 1.3 ปรับ Advanced Filters Panel — grid-cols-2 md:grid-cols-3 lg:grid-cols-6; Field: Date (dateFrom/dateTo), User, Module (select), Action (select), Status (select), Department (select); คง Logic เดิม
- [x] 1.4 ปรับ Filter Reset — ปุ่ม "รีเซ็ต" เมื่อมี active filters; คง Logic เดิม

## 2. ปรับ Audit Log Table

- [x] 2.1 ปรับ Table Container — rounded-2xl border shadow-sm, max-h overflow-auto
- [x] 2.2 ปรับ Table Header — Sticky Header (sticky top-0 z-10), bg ตาม Design Reference, text-[11px] font-semibold uppercase tracking-wider
- [x] 2.3 ปรับ Column: Date/Time — formatDateTh + relTime (relative time)
- [x] 2.4 ปรับ Column: User — Avatar วงกลมสี + ชื่อ + email (font-mono)
- [x] 2.5 ปรับ Column: Module — font-mono text-secondary
- [x] 2.6 ปรับ Column: Action — ActionBadge (สีตามประเภท: DELETE/FAILED/REJECT=error, CREATE/APPROVE/LOGIN=success, UPDATE/CHANGE=warning)
- [x] 2.7 ปรับ Column: Resource — font-mono text-secondary
- [x] 2.8 ปรับ Column: IP Address — font-mono text-secondary
- [x] 2.9 ปรับ Column: Status — StatusBadge (Success/Failed + dot indicator)
- [x] 2.10 ปรับ Column: Actions — เหลือปุ่ม More (...) ปุ่มเดียว + Dropdown Menu (View Details, Copy Log ID, Export)
- [x] 2.11 เพิ่ม Hover Effect — `hover:bg-tu-surface-hover` บน tbody rows
- [x] 2.12 คง Logic เดิม — Sorting (SortHeader), Filtering (filtered + sorted), Pagination (page, totalPages)

## 3. ปรับ Detail Drawer

- [x] 3.1 ปรับ Drawer Overlay — bg-slate-900/40, transition-opacity, click to close
- [x] 3.2 ปรับ Drawer Panel — max-w-[560px], slide-in from right, shadow-2xl
- [x] 3.3 ปรับ Drawer Header — ActionBadge + StatusBadge, Resource title, Log ID (mono) + CopyButton
- [x] 3.4 เพิ่ม Timeline Section — Request received → Executed/Failed → Audit persisted; แสดง timestamp + error (ถ้ามี)
- [x] 3.5 ปรับ General Info Card — วันที่/เวลา (+relTime), Module, Action, Resource, Result, Error
- [x] 3.6 ปรับ User Info Card — ชื่อ, อีเมล (mono), Role, Department (+ icon Building2)
- [x] 3.7 ปรับ Request Info Card — IP Address, Browser (Globe), OS (Monitor), Session ID, Request ID; มี CopyButton ทุก field
- [x] 3.8 ปรับ Before/After Section — แสดงแบบ stacked (grid-cols-1, Before บน After ล่าง); ใช้ `!= null`
- [x] 3.9 ปรับ Drawer Close — ปุ่ม X + ESC key

## 4. ปรับ Loading & Empty States

- [x] 4.1 เพิ่ม Skeleton Loading — SkeletonRows component แทน "กำลังโหลด..." แบบเก่า
- [x] 4.2 ปรับ Empty State — "ยังไม่มี Audit Log" (เมื่อไม่มีข้อมูล) / "ไม่พบผลการค้นหา" (เมื่อ search/filter ไม่พบ) + ปุ่มรีเซ็ต

## 5. ปรับ Responsive

- [x] 5.1 Desktop — Layout เต็ม, Table scroll horizontal, Drawer 560px
- [x] 5.2 Tablet — Table scroll, Filter grid ปรับ column
- [x] 5.3 Mobile — Table scroll horizontal, Drawer full-width

## 6. ทดสอบและตรวจสอบ

- [x] 6.1 ทดสอบ Search — ค้นหาด้วยชื่อ, email, action, module, resource, IP
- [x] 6.2 ทดสอบ Advanced Filters — dateFrom/dateTo, user, module, action, status, department
- [x] 6.3 ทดสอบ Sorting — คลิก Header เปลี่ยน sort direction
- [x] 6.4 ทดสอบ Pagination — เปลี่ยนหน้า, เปลี่ยน limit
- [x] 6.5 ทดสอบ Export — CSV/XLSX export ทำงานได้
- [x] 6.6 ทดสอบ Detail Drawer — View Details, Timeline, Cards, JSON Viewer, Copy
- [x] 6.7 ตรวจสอบ Responsive — Desktop, Tablet, Mobile
- [x] 6.8 ตรวจสอบ Design Tokens — ไม่มี Hex Color หลุด
- [x] 6.9 ตรวจสอบ Functional — ทุก Logic, API, Auth, RBAC คงเดิม 100%
