## 1. ปรับ Header + ปุ่มสร้างโครงการ

- [x] 1.1 เปลี่ยน header เป็น eyebrow label + title + description ตามมาตรฐาน (รูปแบบเดียวกับหน้าอื่น)
- [x] 1.2 ปรับปุ่ม "สร้างโครงการ" เป็น `rounded-[10px] h-10` + shadow styling

## 2. สร้าง Filter Bar ใหม่ (4 filters)

- [x] 2.1 เพิ่ม search input พร้อม Search icon + clear button (X)
- [x] 2.2 เพิ่ม 4 dropdown filters: status, priority, department, category
- [x] 2.3 เพิ่ม active filter count badge
- [x] 2.4 คง filter logic เดิม — client-side filter บน projects array

## 3. เพิ่ม View Toggle (Kanban / List)

- [x] 3.1 สร้าง toggle ตามมาตรฐาน Section 5.4a: `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`
- [x] 3.2 ปุ่ม Kanban: `rounded-md px-3 py-1.5 text-xs font-medium`
- [x] 3.3 ปุ่ม List: styling เดียวกัน
- [x] 3.4 Active state: `bg-tu-primary text-white shadow-sm`

## 4. ออกแบบ Kanban Columns ใหม่

- [x] 4.1 Column header: gradient `bg-gradient-to-b from-tu-{accent}/20 to-transparent`
- [x] 4.2 Dot indicator + column title + count badge
- [x] 4.3 `min-h-[420px]` column height
- [x] 4.4 Drop highlight: `ring-2 ring-tu-primary/40` เมื่อ isOver

## 5. ออกแบบ Project Cards ใหม่ (ใช้ข้อมูลจาก API เท่านั้น)

- [x] 5.1 Card: `bg-tu-surface rounded-2xl border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5`
- [x] 5.2 Code badge: แสดงเมื่อมีค่าเท่านั้น — ไม่ generate fake code
- [x] 5.3 Priority badge: `rounded-full ring-1 ring-inset` (Low/Medium/High/Urgent ตาม PRIORITY_META)
- [x] 5.4 Labels: แสดงเมื่อมีค่าเท่านั้น — ไม่ใช้ type เป็น label fallback
- [x] 5.5 Progress bar: `h-1.5 rounded-full` + percentage
- [x] 5.6 เอา icon row (CheckSquare, Paperclip, MessageSquare) ออก — ใช้ข้อมูลจาก API จริง
- [x] 5.7 Deadline: Calendar icon + วันที่, แดงถ้า overdue
- [x] 5.8 Avatar stack: วงกลม initials พร้อม gradient background, max 3 + overflow count
- [x] 5.9 Owner name: "โดย <name>"
- [x] 5.10 Edit/Delete buttons: opacity-0 group-hover:opacity-100

## 6. เพิ่ม DragOverlay

- [x] 6.1 DragOverlay แสดง ProjectCard ghost ที่ความกว้าง 300px + rotate-2
- [x] 6.2 คง handleDragStart/handleDragEnd logic เดิม

## 7. สร้าง List View

- [x] 7.1 ตาราง grid 12-column responsive (col-span-5 name, col-span-2 status, col-span-2 progress, col-span-1 team, col-span-2 deadline)
- [x] 7.2 แสดง code + priority + name + description (truncate) + status dot + progress bar + avatar stack + deadline
- [x] 7.3 Column headers: `text-[10px] font-semibold uppercase tracking-wider`

## 8. ออกแบบ Create/Edit Modal ใหม่ (header เรียบ + เพิ่ม priority)

- [x] 8.1 Modal header: ไม่มี gradient — ใช้ border-b ธรรมดา
- [x] 8.2 ฟอร์มใช้ `rounded-[10px]` สำหรับทุก input/select/textarea
- [x] 8.3 เพิ่มฟิลด์ระดับความสำคัญ (priority dropdown) ในฟอร์ม
- [x] 8.4 คงฟอร์มเดิมทั้งหมด: ชื่อ, ประเภท dropdown, วัตถุประสงค์, วันที่เริ่ม/สิ้นสุด, สมาชิก + UserSearchCombobox, progress slider (edit mode)
- [x] 8.5 ปุ่ม "ยกเลิก" (secondary) + "สร้างโครงการ/บันทึก" (primary): `h-9 rounded-[10px]`

## 9. เพิ่ม Empty States

- [x] 9.1 Empty state "ยังไม่มีโครงการในระบบ": FolderPlus icon + text + "สร้างโครงการ" button
- [x] 9.2 Empty state "ไม่พบโครงการที่ตรงกับเงื่อนไข": SearchX icon + text

## 10. ตรวจสอบความถูกต้อง

- [x] 10.1 ทดสอบ: Filter 4 dropdowns (status, priority, department, category) + search ทำงานครบ
- [x] 10.2 ทดสอบ: View toggle ระหว่าง Kanban/List
- [x] 10.3 ทดสอบ: Drag & drop ยังทำงาน — card ย้าย column ได้, API call ทำงาน
- [x] 10.4 ทดสอบ: Create/Edit modal — เพิ่ม priority dropdown + header เรียบไม่มี gradient
- [x] 10.5 ทดสอบ: Approve/Reject modals ยังทำงานเหมือนเดิม
- [x] 10.6 ทดสอบ: Card ไม่แสดง fake data — code/labels แสดงเมื่อมีค่าเท่านั้น
- [x] 10.7 ทดสอบ: Project types จาก Settings ยังแสดงถูกต้อง (รวม 6 ประเภท: วิชาการ, หลักสูตร, สัมมนา, วิจัย, IT, งบประมาณ)
- [x] 10.8 ทดสอบ: Filter dropdowns แสดงครบทุกประเภท (จาก PROJECT_TYPES)
- [x] 10.9 ทดสอบ: วันที่สิ้นสุดแสดงตรง — fmtDate parse เฉพาะ date part ไม่เบี่ยง
- [x] 10.10 ทดสอบ: ลาก pending_approval → completed — เปิด Approve Modal (ไม่ยอมให้ลากผ่าน)
- [x] 10.11 ทดสอบ: Card แสดง type badge + date range "startDate – endDate"
- [x] 10.12 ทดสอบ: Modal แก้ไขแสดง startDate และ deadline ที่บันทึกไว้เดิมใน input fields
- [x] 10.13 ทดสอบ: สร้างโครงการ — ไม่ส่ง `members` array ใน API body, ใช้เฉพาะ `memberIds`
- [x] 10.14 ทดสอบ: แก้ไขโครงการ — `handleEdit` ไม่เรียก `setEditTarget(null)`, modal จัดการ close เอง
- [x] 10.15 ทดสอบ: API PUT รับ `type, startDate, deadline, priority` — ข้อมูลถูกบันทึกครบ

## 11. Update Schema Database

- [x] 11.1 เพิ่ม `priority` field ใน `Project` model (`prisma/schema.prisma`) — `@default("medium") @db.VarChar(50)`
- [x] 11.2 รัน `npx prisma db push` — sync schema to database
- [x] 11.3 แก้ไข seed data — project type names ใช้ "หลักสูตร", "สัมมนา", "IT" แทน "ไอที" ให้ตรงกับ `DEFAULT_PROJECT_TYPES`
- [x] 11.4 รัน `npx prisma db seed` — สร้าง project types ใหม่ + อัปเดต seed projects
