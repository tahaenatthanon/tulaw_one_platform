## Why

หน้า Audit Log Detail ปัจจุบันแสดงข้อมูลแบบ Flat List ไม่มีการจัดกลุ่มตาม Section ทำให้ข้อมูลสำคัญ เช่น Before/After Changes, Request Information, User Details เข้าถึงยากและอ่านยาก โดยเฉพาะเมื่อมี JSON ขนาดใหญ่ ระบบต้องปรับปรุงการแสดงผลให้มีโครงสร้างชัดเจน รองรับ Syntax Highlight, Side-by-side Diff View, Copy และ Collapse/Expand เพื่อให้ผู้ดูแลระบบสามารถตรวจสอบเหตุการณ์ได้อย่างมีประสิทธิภาพ

## What Changes

### API — Audit Log Detail Enhancement
- ขยาย `GET /api/audit-logs/[id]` ให้คืนข้อมูลครบทุกมิติ:
  - **General Information:** Log ID, Timestamp, Event Type, Module, Action, Status (Success/Failed)
  - **User Information:** User Name, User ID, Email, Role, Department
  - **Target Resource:** Object Type (entityType), Record ID (entityId)
  - **Change History:** Before Value (JSON), After Value (JSON) — แสดง "N/A" หากไม่มีการแก้ไข
  - **Request Information:** IP Address, User Agent, Browser, Operating System, Device, Session ID, Request ID, API Endpoint, HTTP Method
  - **Additional Information:** Error Message (เฉพาะ Status = Failed), Authentication Method, Duration, Correlation ID

### UI — Audit Log Detail Drawer Redesign
- แทนที่ Drawer แบบ Flat List ด้วย Drawer ขนาด Large (w-[640px]) แบ่งเป็น 6 Sections
- **Section-based Layout:** General → User → Target Resource → Change History → Request → Additional
- **Change History:** แสดง Before/After แบบ Side-by-side บน Desktop, Stacked บน Mobile
- **JSON Syntax Highlight:** แสดง Before/After เป็น JSON formatted พร้อมสี
- **Copy JSON:** ปุ่ม Copy สำหรับแต่ละ Field (User, JSON, Request Info)
- **Collapse/Expand:** รองรับการย่อ/ขยาย JSON ขนาดใหญ่
- **N/A Handling:** หากไม่มีข้อมูลหรือไม่เกี่ยวข้อง (เช่น Login ไม่มี Before/After) แสดง "N/A"

## Capabilities

### New Capabilities

- `audit-log-detail-view`: ระบบแสดงรายละเอียด Audit Log แบบ Structured — Section-based Drawer, JSON Syntax Highlight, Side-by-side Before/After, Copy, Collapse/Expand

### Modified Capabilities

- `audit-log-backend`: ขยายข้อมูลใน endpoint `GET /api/audit-logs/[id]` ให้คืนข้อมูลครบทุก Section (General, User, Target Resource, Change History, Request Info, Additional Info)

## Impact

- **API:** `app/api/audit-logs/[id]/route.ts` — เพิ่ม include fields + computed fields (OS, browser parsing, request info)
- **Frontend:** `app/(dashboard)/audit-log/activity-log/page.tsx` — แทนที่ Detail Drawer เดิมด้วย structured drawer ใหม่
- **Database:** ไม่มี schema เปลี่ยนแปลง (ใช้ AuditLog table ที่มีอยู่แล้ว — fields ที่ไม่มีใน DB ให้แสดง "N/A")
- **Dependencies:** ไม่มี dependency ใหม่
