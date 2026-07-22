## Why

หน้า Projects มี UI ที่ถึงแม้จะใช้งานได้แต่ยังขาดความทันสมัย — Kanban board ดูเรียบเกินไป, ไม่มีตัวกรองที่ครบถ้วน (priority, department, assignee, due date), ไม่มี view toggle ระหว่าง Kanban/List, และ Card แสดงข้อมูลจำกัด — ควรปรับ UI ใหม่ให้เป็น enterprise-grade โดยคงฟังก์ชันเดิมทั้งหมดไว้

## What Changes

- **ออกแบบ Filter Bar ใหม่**: filter ปรับเหลือ 4 dropdowns — สถานะ, ระดับ, หน่วยงาน, ประเภท — พร้อม active filter count badge
- **ออกแบบ Kanban Board ใหม่**: ปรับดีไซน์ column header เป็น gradient accent, Card แสดงข้อมูลจาก API (code, priority badge, labels, progress bar, avatar stack, deadline), DragOverlay ขณะลาก, empty state "ลากการ์ดมาวางที่นี่"
- **เพิ่ม View Toggle (Kanban / List)**: สลับมุมมองระหว่าง Kanban board และ List view ตามมาตรฐาน UI ของแพลตฟอร์ม (Section 5.4a)
- **ออกแบบปุ่มสร้างโครงการและ Modal ใหม่**: ปรับดีไซน์ปุ่มและ Modal Form — header เรียบไม่มี gradient, เพิ่มฟิลด์ระดับความสำคัญ (priority), คงฟังก์ชันเดิม (ชื่อ, ประเภท, วัตถุประสงค์, วันที่เริ่ม/สิ้นสุด, สมาชิก, progress slider สำหรับ edit)
- **แก้ไข filter ประเภทไม่ครบ**: ใช้ `PROJECT_TYPES` (6 ประเภทจาก Settings) แทน `projects.map(p => p.type)` — ให้ dropdown แสดงครบทุกประเภทเสมอแม้ไม่มี project
- **แก้ไขวันที่สิ้นสุดยังไม่ตรง**: `fmtDate` parse เฉพาะ date part (`YYYY-MM-DD`) จาก ISO string — รองรับ `@db.Date` column ที่ store เป็นวันที่อย่างเดียว
- **card เพิ่มประเภทกำกับ**: ทุก card แสดง type badge (ชื่อประเภท) ข้าง priority badge — ใช้ข้อมูลจาก API `project.type` โดยตรง
- **ปรับการแสดงผลวันที่เป็นช่วง**: card แสดงวันที่เป็น "22 ก.ค. – 31 ก.ค." (startDate – endDate) แทนแสดงเฉพาะ deadline — API เพิ่ม `startDate` ใน response
- **แสดงวันที่ในฟอร์มแก้ไข**: modal แก้ไขแสดง `startDate.slice(0,10)` และ `deadline.slice(0,10)` ใน `<input type="date">` — ผู้ใช้เห็นวันที่เดิมที่บันทึกไว้ก่อนแก้ไข
- **แก้ไข API รับและบันทึกวันที่ถูกต้อง**: POST รับ `startDate, deadline, priority` + PUT รับ `type, startDate, deadline, priority` — `parseDate` ใช้ UTC midnight ป้องกัน timezone offset
- **แก้ไข data flow สร้าง/แก้ไขโครงการ**: `members` array ไม่ถูกส่งใน API body (ใช้ `memberIds` แทน), `handleEdit` ไม่เรียก `setEditTarget(null)` ซ้ำ — modal `handleSave` จัดการ close เอง
- **เพิ่ม priority schema และ sync DB**: เพิ่ม field `priority` ใน `Project` model (`@db.VarChar(50)`) + seed data สำหรับ project type "วิจัย" — รัน `prisma db push` เพื่อ sync schema
- **คงฟังก์ชันเดิมทั้งหมด**: API calls (SWR, fetchApi), RBAC checks, Drag & Drop logic, Project types จาก Settings, Approve/Reject modals

## Capabilities

### New Capabilities
- `projects-ui-kanban`: Redesigned Kanban board with filter bar, view toggle, enhanced cards, and drag overlay
- `projects-ui-modal`: Redesigned Create/Edit project modal with modern enterprise styling

### Modified Capabilities
<!-- No spec modifications — pure UI redesign, all existing behavior preserved -->

## Impact

| พื้นที่ | ไฟล์ที่ได้รับผลกระทบ |
|---|---|
| Client | `app/(dashboard)/projects/page.tsx` — ปรับ UI ทั้งหน้า (kanban, filters, cards, modal, view toggle) |
