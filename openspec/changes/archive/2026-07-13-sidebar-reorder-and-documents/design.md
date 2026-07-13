## Context

Sidebar (`dashboard-layout.tsx`) มี 2 กลุ่มเมนู:
- **platformNav**: แดชบอร์ด, ศูนย์กลางแอปพลิเคชัน, อินทราเน็ต, โครงการ, จองห้องประชุม (5 รายการ)
- **adminNav**: ผู้ใช้งานและสิทธิ์, บันทึกความปลอดภัย, ตั้งค่าระบบ (3 รายการ)

หน้า `/documents` มีอยู่แล้ว (`app/(dashboard)/documents/page.tsx`) พร้อมระบบจัดเก็บเอกสาร 3-tier แต่ยังไม่มีเมนูใน Sidebar การเพิ่มเมนู "เอกสาร" และจัดลำดับใหม่จะทำให้ Sidebar ตรงตามที่กำหนด

## Goals / Non-Goals

**Goals:**
- เพิ่มเมนู "เอกสาร" ใน platformNav, icon `FolderOpen`, permission `DOCUMENTS_VIEW`
- เรียงลำดับ platformNav: แดชบอร์ด → ศูนย์กลางแอปพลิเคชัน → อินทราเน็ต → จองห้องประชุม → เอกสาร → โครงการ
- เพิ่ม `hasDocumentsView` permission hook และ extend `hasPermissionAccess()`

**Non-Goals:**
- ไม่เปลี่ยนแปลง adminNav (ชื่อและลำดับคงเดิม)
- ไม่เปลี่ยนแปลงหน้า `/documents/page.tsx`
- ไม่เพิ่ม API หรือ database schema

## Decisions

1. **ใช้ icon `FolderOpen` สำหรับ "เอกสาร"**
   - **เหตุผล**: สื่อถึงระบบจัดการเอกสาร/ไฟล์ชัดเจน สอดคล้องกับ icon ที่ใช้ในหน้า `/documents` อยู่แล้ว
   - **ทางเลือกที่พิจารณา**: `Files`, `FileText` — แต่ `FolderOpen` เข้าถึงง่ายและเป็นที่รู้จัก

2. **ใช้ permission `DOCUMENTS_VIEW`**
   - **เหตุผล**: ทุก role (รวม viewer) มี `DOCUMENTS_VIEW` อยู่แล้วตาม RBAC matrix ทำให้ผู้ใช้ทุกคนเห็นเมนูนี้
   - **ทางเลือกที่พิจารณา**: ไม่ใช้ permission guard — แต่ควรคงความสอดคล้องกับ pattern เดิม (`RESEARCH_VIEW`, `BOOK_MEETING_VIEW`)

3. **จัดลำดับใหม่: Book Meeting → Documents → Projects**
   - **เหตุผล**: เรียงตามความสำคัญและความถี่ใช้งาน — Book Meeting เป็นระบบจอง, Documents เป็นระบบจัดการ, Projects เป็นระบบติดตามโครงการ

## Risks / Trade-offs

- **[Risk]**: ผู้ใช้ที่คุ้นเคยกับลำดับเดิมอาจสับสน → **Mitigation**: การเปลี่ยนแปลงน้อย (เลื่อน Projects ลงมาหนึ่งตำแหน่ง, เพิ่ม Documents) ไม่กระทบการใช้งานมาก
- **[Risk]**: `FolderOpen` icon อาจไม่สื่อถึงเอกสารสำหรับบางคน → **Mitigation**: ใช้ label "เอกสาร" ภาษาไทยชัดเจน
