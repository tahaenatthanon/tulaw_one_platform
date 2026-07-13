## Context

ปัจจุบัน Sidebar มี navigation item "งานวิจัย" ที่ชี้ไปยัง `/application-hub/research-management` ซึ่งเป็นหน้าแสดงข้อมูลงานวิจัยแบบตาราง ในขณะที่หน้า `/projects` มี Kanban Board แบบลากวาง, Progress Bar, ฟอร์มสร้างโครงการ, รองรับ 6 ประเภท และระบบอนุมัติครบถ้วนตาม requirement แล้ว

การเปลี่ยนแปลงนี้คือการเปลี่ยนเส้นทาง Sidebar ให้ชี้ไปที่ `/projects` โดยตรง พร้อมเปลี่ยนชื่อเมนูเป็น "โครงการ" เพื่อให้ผู้ใช้เข้าถึงฟีเจอร์โครงการที่สมบูรณ์แบบได้ทันทีจาก Sidebar หลัก

หน้า `/application-hub/research-management` จะยังคงอยู่และเข้าถึงได้ผ่าน Application Hub (Grid) สำหรับผู้ใช้ที่ต้องการดูข้อมูลงานวิจัยในรูปแบบเดิม

## Goals / Non-Goals

**Goals:**
- เปลี่ยน Sidebar navigation "งานวิจัย" → "โครงการ" โดยชี้ไปที่ `/projects`
- ผู้ใช้ที่มี `RESEARCH_VIEW` permission จะเห็นเมนู "โครงการ" ใน Sidebar และไปที่หน้า Kanban Board ได้
- คงหน้า `/application-hub/research-management` ไว้ (ไม่ลบ)

**Non-Goals:**
- ไม่แก้ไขหน้า `/projects/page.tsx` (มีฟีเจอร์ครบแล้ว)
- ไม่ลบหรือเปลี่ยนแปลง `/application-hub/research-management`
- ไม่เปลี่ยน permission code (`RESEARCH_VIEW` ยังใช้เหมือนเดิม)
- ไม่เพิ่มฟีเจอร์ใหม่ใน Kanban Board

## Decisions

1. **เปลี่ยน href และ label ของ NavItem เดิม แทนการเพิ่ม item ใหม่**
   - **เหตุผล**: ลดความซับซ้อน ไม่ต้องสร้าง permission ใหม่ ใช้ `RESEARCH_VIEW` เดิม
   - **ทางเลือกที่พิจารณา**: เพิ่ม NavItem ใหม่ `{ href: "/projects", label: "โครงการ" }` — แต่จะทำให้มี 2 รายการซ้ำซ้อน และต้องตัดสินใจว่าจะเก็บ "งานวิจัย" ไว้หรือไม่

2. **คง permission code `RESEARCH_VIEW` ไว้**
   - **เหตุผล**: ไม่ต้องการเปลี่ยน database schema หรือ migration ใหม่ การเปลี่ยนแค่ label และ route ไม่กระทบ permission logic
   - **ทางเลือกที่พิจารณา**: เปลี่ยนเป็น `PROJECTS_VIEW` — แต่ต้อง migrate ข้อมูล permission ใน DB

3. **คงหน้า `/application-hub/research-management` ไว้**
   - **เหตุผล**: Application Hub ยังมี card สำหรับงานวิจัย และอาจมีผู้ใช้ที่เคย bookmark หน้าไว้
   - **ทางเลือกที่พิจารณา**: redirect `/application-hub/research-management` ไป `/projects` — แต่จะทำให้ผู้ใช้ที่ต้องการดูข้อมูลงานวิจัยแบบเดิมไม่สามารถเข้าถึงได้

## Risks / Trade-offs

- **[Risk]**: ผู้ใช้บางคนอาจสับสนเมื่อคลิก "โครงการ" แล้วเห็น Kanban Board แทนหน้าวิจัยแบบเดิม → **Mitigation**: ชื่อ "โครงการ" สื่อความหมายชัดเจนกว่า "งานวิจัย" และ Kanban Board ครอบคลุมทุกประเภทโครงการ รวมถึงงานวิจัยด้วย
- **[Risk]**: `RESEARCH_VIEW` permission ใช้กับหน้า `/projects` ซึ่งมี `PROJECTS_*` permissions แยกต่างหาก → **Mitigation**: ตรวจสอบว่า `/projects/page.tsx` ใช้ `useHasPermission("PROJECTS_*")` ภายในอยู่แล้ว ผู้ใช้ที่มี `RESEARCH_VIEW` จะเห็นหน้าแต่การสร้าง/แก้ไข/อนุมัติ จะถูกควบคุมด้วย PROJECTS permissions
