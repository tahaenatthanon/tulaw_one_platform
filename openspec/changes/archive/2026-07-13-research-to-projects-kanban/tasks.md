## 1. Sidebar Navigation Update

- [x] 1.1 เปลี่ยน label จาก "งานวิจัย" เป็น "โครงการ" ใน `components/layouts/dashboard-layout.tsx` (บรรทัด 47)
- [x] 1.2 เปลี่ยน href จาก `/application-hub/research-management` เป็น `/projects` ใน `components/layouts/dashboard-layout.tsx` (บรรทัด 47)
- [x] 1.3 ตรวจสอบว่า `RESEARCH_VIEW` permission check ยังทำงานถูกต้อง (ไม่ต้องแก้ permission code)

## 2. Verification

- [x] 2.1 ทดสอบว่าผู้ใช้ที่มี `RESEARCH_VIEW` เห็นเมนู "โครงการ" ใน Sidebar
- [x] 2.2 ทดสอบว่ากดเมนู "โครงการ" แล้ว navigate ไปที่ `/projects` พร้อมแสดง Kanban Board
- [x] 2.3 ทดสอบว่า Sidebar active state แสดงถูกต้องเมื่ออยู่ที่ `/projects` หรือ `/projects/*`
- [x] 2.4 ทดสอบว่าผู้ใช้ที่ไม่มี `RESEARCH_VIEW` ไม่เห็นเมนู "โครงการ"

## 3. Documentation

- [x] 3.1 Sync delta specs ไปยัง main specs: `sidebar-research-navigation`
