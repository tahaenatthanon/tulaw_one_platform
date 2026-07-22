## Context

หน้า Projects (`app/(dashboard)/projects/page.tsx`) มีฟังก์ชันครบถ้วน — Kanban DnD, CRUD, Approve/Reject, RBAC, Project types จาก Settings — แต่ UI ยังเป็นพื้นฐาน ต้องการ redesign UI ให้ทันสมัยแบบ enterprise-grade โดยอิง reference จาก `projects-page-ui.tsx`

**ข้อจำกัดสำคัญ**: ต้องคงฟังก์ชันเดิมทั้งหมด — API calls, RBAC, DnD logic, Approve/Reject modals, Project types จาก Settings — ห้ามเปลี่ยนแปลง

## Goals / Non-Goals

**Goals:**
- Filter bar: search input + 6 dropdown filters (status, priority, department, assignee, category, due) พร้อม active filter count
- View toggle: Kanban / List toggle ตามมาตรฐาน Section 5.4a (`flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`)
- Kanban columns: gradient header (`from-tu-{accent}/20 to-transparent`), dot indicator, card count badge
- Cards: code badge, priority badge, labels, progress bar, task count/attachments/comments icons, avatar stack, deadline (overdue red)
- DragOverlay: card ghost พร้อม rotation ขณะลาก
- List view: ตาราง grid 12-column responsive
- Create/Edit modal: gradient header, compact form, คงฟังก์ชันเดิม (สมาชิก, progress slider สำหรับ edit)
- Empty states: "ยังไม่มีโครงการ", "ไม่พบโครงการที่ตรงกับเงื่อนไข"

**Non-Goals:**
- ไม่เปลี่ยน API calls, SWR, fetchApi
- ไม่เปลี่ยน RBAC logic
- ไม่เปลี่ยน DnD logic (handleDragStart, handleDragEnd)
- ไม่เปลี่ยน Approve/Reject modals
- ไม่เปลี่ยน Project types จาก Settings

## Decisions

### 1. Filter bar: 4 dropdowns + search

**ตัดสินใจ**: ใช้ 4 dropdown filters — status, priority, department, category — ลดจาก 6 (เอา assignee, due ออก) เพื่อให้เข้ากับข้อมูลที่มีจริง

**Alternatives considered**: shadcn Select → ไม่เลือก เพราะยุ่งยากกับ scroll และ popover ใน Kanban layout

### 2. View toggle: ตามมาตรฐาน Section 5.4a

**ตัดสินใจ**: Container `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5` + buttons `rounded-md px-3 py-1.5 text-xs font-medium`

### 3. Kanban columns: gradient header

**ตัดสินใจ**: `bg-gradient-to-b from-tu-{accent}/20 to-transparent` — สร้าง visual hierarchy โดยไม่ใช้สีเต็ม

### 4. Cards: แสดงเฉพาะข้อมูลจาก API

**ตัดสินใจ**: ไม่สร้าง fake code/labels/taskCount — แสดงเฉพาะ field ที่มีค่าจริงจาก API (code, labels แสดงเมื่อมีค่าเท่านั้น)

### 5. Modal: header เรียบ + เพิ่ม priority field

**ตัดสินใจ**: Modal header ไม่มี gradient (`bg-gradient-to-b`) — ใช้พื้นหลังขาวปกติ, เพิ่ม dropdown เลือกระดับความสำคัญ (Low/Medium/High/Urgent) ในฟอร์ม

**ตัดสินใจ**: Header `bg-gradient-to-b from-tu-primary-soft/40 to-transparent` — คงฟอร์มเดิมทั้งหมด (ชื่อ, ประเภท dropdown, วัตถุประสงค์, วันที่, สมาชิก, progress สำหรับ edit)

### 6. คง Approve/Reject modals และ logic เดิม

**ตัดสินใจ**: ไม่แตะ ApproveModal, RejectModal, handleApprove, handleReject, handleDragEnd, handleCreate, handleEdit — ลบ `canEdit` RBAC check ที่ไม่ได้ใช้

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| เปลี่ยน UI อาจกระทบ DnD event handlers | ใช้ DndContext, SortableContext, useSortable, useDroppable แบบเดิม — ไม่เปลี่ยน props structure |
| Filter logic ต้อง match กับ data ที่มีใน DB | ใช้ client-side filter บนข้อมูลที่ fetch มาแล้ว — ไม่ต้องเปลี่ยน API |
| List view เพิ่ม complexity | แยก ListRow component ชัดเจน — ไม่กระทบ Kanban |
