## Why

ปัจจุบันระบบมีหน้า "งานวิจัย" (`/application-hub/research-management`) และหน้า "โครงการ" (`/projects`) แยกจากกัน แต่ฟีเจอร์ Kanban Board แบบลากวาง, Progress Bar, การสร้างโครงการผ่านฟอร์ม, รองรับ 6 ประเภทโครงการ และระบบอนุมัติ มีอยู่แล้วในหน้า `/projects` ทั้งหมด จึงควรรวมจุดเข้าถึงให้ผู้ใช้เข้าสู่หน้าโครงการโดยตรงจาก Sidebar แทนที่จะแยกเป็นงานวิจัยต่างหาก

## What Changes

- เปลี่ยน Sidebar navigation item "งานวิจัย" ให้ชี้ไปที่ `/projects` แทน `/application-hub/research-management`
- เปลี่ยนชื่อเมนูจาก "งานวิจัย" เป็น "โครงการ" เพื่อสะท้อนขอบเขตที่ครอบคลุม 6 ประเภท (วิชาการ หลักสูตร สัมมนา วิจัย IT งบประมาณ)
- คงหน้า `/application-hub/research-management` ไว้สำหรับการเข้าถึงผ่าน Application Hub (ไม่ลบ)
- Kanban Board 4 คอลัมน์ (Planning, In Progress, Pending Approval, Completed) พร้อม Drag & Drop — มีอยู่แล้วที่ `/projects`
- Progress Bar แสดงเปอร์เซ็นต์ความคืบหน้า — มีอยู่แล้วที่ `/projects`
- ฟอร์มสร้างโครงการ (ชื่อ ประเภท วัตถุประสงค์ ระยะเวลา สมาชิก) — มีอยู่แล้วที่ `/projects`
- รองรับ 6 ประเภท: วิชาการ หลักสูตร สัมมนา วิจัย IT งบประมาณ — มีอยู่แล้วที่ `/projects`
- ระบบอนุมัติโดย Dept Admin+ พร้อมระบุเหตุผล — มีอยู่แล้วที่ `/projects`

## Capabilities

### New Capabilities

- `projects-kanban-sidebar`: เปลี่ยน Sidebar navigation จาก "งานวิจัย" → `/application-hub/research-management` เป็น "โครงการ" → `/projects`

### Modified Capabilities

- `sidebar-research-navigation`: เปลี่ยน route target จาก `/application-hub/research-management` เป็น `/projects` และเปลี่ยน label จาก "งานวิจัย" เป็น "โครงการ"

## Impact

- `components/layouts/dashboard-layout.tsx` — แก้ไข sidebar navigation item
- `openspec/specs/sidebar-research-navigation/spec.md` — อัปเดต spec ให้สอดคล้อง
- `app/(dashboard)/projects/page.tsx` — มี Kanban Board + features ทั้งหมดอยู่แล้ว (ไม่ต้องแก้)
- `app/(dashboard)/application-hub/research-management/` — คงไว้ไม่ลบ (เข้าได้ผ่าน Application Hub)
