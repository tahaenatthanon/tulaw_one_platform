## Context

Application Hub (`/application-hub`) แสดงการ์ดแอปพลิเคชัน 9 หมวดหมู่ในรูปแบบ Grid/List View ข้อมูลทั้งหมดถูก hardcode ใน `appGroups` array ภายใน `page.tsx` (Client Component) โดยมีฟีเจอร์ Pin/Unpin ผ่าน localStorage, Online/Offline status indicator, Instant Search, และ 4 Real-time Stats ที่คำนวณจาก array โดยตรง

ปัจจุบันหลายแอปพลิเคชันได้ย้ายไปเป็น Sidebar navigation แล้ว (โปรเจกต์/งานวิจัย → `/projects`, จองห้องประชุม → `/book-meeting`) หรือเป็นระบบรองที่ยังไม่มีเนื้อหา การลดจำนวนแอปใน Application Hub ให้เหลือเฉพาะ 5 ระบบงานหลักจะทำให้ UI กระชับและตรงตาม requirement

## Goals / Non-Goals

**Goals:**
- ลบ 4 หมวดหมู่: Research, Legal Clinic, Book Meeting, Support Services ออกจาก `appGroups` array
- ลบ permission checks ที่เกี่ยวข้อง (`RESEARCH_VIEW`, `LEGAL_CLINIC_VIEW`, `BOOK_MEETING_VIEW`, `SUPPORT_VIEW`) ออกจาก `canView` object
- คงไว้ 5 ระบบงานหลัก: ERP, E-Office, Document Management, Academic Management, HR Management
- สถิติ 4 รายการอัปเดตอัตโนมัติตามจำนวนแอปที่เหลือ

**Non-Goals:**
- ไม่ลบ subdirectory ของแอปที่ถูกลบ (`research-management/`, `legal-clinic/`, `book-meeting/`, `support-services/`)
- ไม่ลบ API routes ที่เกี่ยวข้อง
- ไม่เปลี่ยนแปลงฟีเจอร์ Pin, Search, Grid/List View, หรือ Online/Offline status
- ไม่เพิ่มระบบงานใหม่

## Decisions

1. **ลบเฉพาะ `appGroups` entries และ `canView` keys — ไม่ลบไฟล์หรือ directories**
   - **เหตุผล**: Sub-app pages อาจถูกนำกลับมาใช้ในอนาคต การลบเฉพาะการแสดงผลใน Hub เป็นการเปลี่ยนแปลงที่ปลอดภัยและย้อนกลับได้ง่าย
   - **ทางเลือกที่พิจารณา**: ลบ subdirectory ของแอปด้วย — แต่จะกระทบกับ code อื่นที่อาจอ้างอิง path เหล่านี้

2. **คงโครงสร้าง `appGroups` array ไว้เหมือนเดิม — ใช้วิธีลบ entries ที่ไม่ต้องการ**
   - **เหตุผล**: ไม่ต้อง refactor โครงสร้างข้อมูล ลดความเสี่ยงจากการเปลี่ยนแปลง

## Risks / Trade-offs

- **[Risk]**: ผู้ใช้ที่เคย Pin แอปที่ถูกลบจะเห็น Pin หายไป → **Mitigation**: Pin ถูกเก็บใน localStorage เป็นราย id — เมื่อ entry ถูกลบ id จะไม่ match และไม่แสดงผลโดยอัตโนมัติ ไม่เกิด error
- **[Risk]**: Sub-app pages ยังคงเข้าถึงได้ผ่าน URL โดยตรง → **Mitigation**: นี่เป็นพฤติกรรมที่ยอมรับได้ — ผู้ใช้ที่รู้ URL ยังเข้าได้ แต่ Application Hub จะไม่แสดงการ์ด link
