## Why

Application Hub ปัจจุบันแสดง 9 หมวดหมู่แอปพลิเคชัน (ERP, E-Office, Document Management, Academic Management, HR Management, Research, Legal Clinic, Book Meeting, Support Services) ซึ่งมีหลายระบบที่ได้ย้ายไปเป็น Sidebar navigation แล้ว (โปรเจกต์/งานวิจัย, จองห้องประชุม) หรือเป็นระบบรองที่ยังไม่มีเนื้อหา (Legal Clinic, Support Services) การลดจำนวนแอปพลิเคชันให้เหลือเฉพาะระบบงานหลัก 5 ระบบจะทำให้ Application Hub กระชับ โฟกัสเฉพาะระบบงานหลักของคณะ และลดความซ้ำซ้อนกับ Sidebar

## What Changes

- ลบ 4 หมวดหมู่ออกจาก Application Hub: งานวิจัย (Research), คลินิกกฎหมาย (Legal Clinic), จองห้องประชุม (Book Meeting), บริการสนับสนุน (Support Services)
- คงไว้ 5 ระบบงานหลัก: ERP, E-Office, ระบบจัดเก็บเอกสาร (Document Management), ระบบงานวิชาการ (Academic Management), ระบบงานบุคคล (HR Management)
- สถิติ 4 รายการ (จำนวนระบบ, Active Users, ระบบออนไลน์, ระบบบำรุงรักษา) จะอัปเดตอัตโนมัติตามจำนวนแอปที่เหลือ
- ลบ permission checks สำหรับแอปที่ถูกลบ (`RESEARCH_VIEW`, `LEGAL_CLINIC_VIEW`, `BOOK_MEETING_VIEW`, `SUPPORT_VIEW`)
- **ฟีเจอร์ที่มีอยู่แล้วและไม่เปลี่ยนแปลง**: Pin/Unpin, Online/Offline status, Instant Search, Grid/List View Toggle, 4 Real-time Stats

## Capabilities

### New Capabilities
- `application-hub-core-apps`: จัดการการแสดงผล Application Hub ให้แสดงเฉพาะ 5 ระบบงานหลัก พร้อม permission-based filtering และสถิติแบบ real-time

### Modified Capabilities
<!-- None — no existing application-hub spec to modify -->

## Impact

- `app/(dashboard)/application-hub/page.tsx` — ลบ 4 app groups, ลบ permission checks ที่เกี่ยวข้อง
- ไม่กระทบ API routes, database schema, หรือ components อื่น
