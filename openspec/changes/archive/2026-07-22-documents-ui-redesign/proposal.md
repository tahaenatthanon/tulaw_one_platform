## Why

หน้า Documents มี UI ที่ไม่สอดคล้องกับหน้าอื่นของแพลตฟอร์ม — header ใช้ `text-2xl` ง่ายๆ ไม่มี eyebrow label แบบหน้าอื่น, และการอัปโหลดไฟล์ไม่แสดงผลหลังจากอัปโหลด — ควรปรับให้เข้ากับมาตรฐาน UI ของระบบเพื่อความสม่ำเสมอ (Consistency First)

## What Changes

- **ปรับ Page Header ให้ตรงกับหน้าอื่น**: เพิ่ม eyebrow label (เส้นประ + ชื่อหมวด) และคำอธิบายในรูปแบบเดียวกับ Book Meeting, Intranet, Dashboard
- **แก้ไขอัปโหลดไฟล์ให้แสดงผล**: สร้าง API route `/api/documents` (GET/POST) เพื่อให้การอัปโหลดและการแสดงผลไฟล์ทำงานได้จริง
- **แก้ไขดาวน์โหลดไฟล์ให้ทำงาน**: สร้าง API route `/api/documents/download` (GET) เพื่อให้การดาวน์โหลดไฟล์ทำงานได้จริง
- **เพิ่มการบันทึก Audit Log**: ทุก action (UPLOAD, DOWNLOAD, DELETE) บันทึกลง `AuditLog` แบบ append-only ผ่าน `createAuditLog()`
- **คง Storage Progress Bar ไว้**: Storage Progress Bar (HardDrive icon + progress + percentage) ยังคงอยู่ตามเดิม
- **คงฟังก์ชันเดิมทั้งหมด**: Search, Pool Tabs, Document Table, Upload Modal — ทำงานเหมือนเดิมทุกอย่าง

## Capabilities

### New Capabilities
- `documents-ui-consistency`: Standardize Documents page header and fix file upload display to match platform standard
- `documents-api`: Create `/api/documents` route handler (GET list + POST upload + DELETE) and `/api/documents/download` (GET download) — all with audit logging

### Modified Capabilities
<!-- No spec modifications — only visual/layout changes -->

## Impact

| พื้นที่ | ไฟล์ที่ได้รับผลกระทบ |
|---|---|
| Client | `app/(dashboard)/documents/page.tsx` — ปรับ header |
| API | `app/api/documents/route.ts` — สร้าง GET/POST route handler |
