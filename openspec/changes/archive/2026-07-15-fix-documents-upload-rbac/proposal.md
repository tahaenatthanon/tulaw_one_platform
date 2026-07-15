## Why

Documents module ยังไม่สมบูรณ์สำหรับการใช้งานจริง: ยังใช้ `MOCK_DOCS` fallback เมื่อ API ไม่มีข้อมูล, ปุ่มดาวน์โหลดไม่มี handler, อัปโหลดไฟล์ใช้งานได้ผ่าน API แต่ client ส่ง FormData (ไม่ใช่ JSON) ทำให้ไม่ตรงกับ API handler ที่รับ `req.json()`, Storage Progress Bar คำนวณจาก MOCK_DATA ไม่ใช่ข้อมูลจริง, ไม่มีการบันทึก Audit Trail, และ RBAC pool access ยังทำงานไม่สมบูรณ์บน client (ใช้ `roles.includes(...)` string matching แทน data scope)

## What Changes

- **อัปโหลดไฟล์แล้วอัปเดตในตาราง + Storage แบบ real-time**: แก้ไข API `POST /api/documents` ให้รองรับ FormData (file upload), แก้ไข client ส่ง FormData ถูก format, SWR revalidate หลังอัปโหลด
- **กำหนดสิทธิ์ pool ตาม Role**: ใช้ `resolveDataScope` + `buildDocumentPoolWhere` ที่มีอยู่แล้ว แก้ client-side `getAvailablePools` และ `canAccessPool` ให้ตรงกับ data scope จริง, Super Admin/System Admin → ทุก pool, Dean → ทุก pool แต่ personal เฉพาะของตัวเอง, Dept Admin → central + dept pool ของฝ่ายตน + personal ของตัวเอง, User → central + personal ของตัวเอง
- **User แก้ไข ลบ ได้เฉพาะ Personal Pool**: Client-side enforce + server-side ownership check ใน DELETE/PUT
- **User อัปโหลดได้เฉพาะ Personal Pool**: ไม่ว่าจะอยู่ tab ใด (central/department) — ถ้า `maxLevel < 50` poolType จะถูก force เป็น `"personal"` เสมอ
- **อัปโหลดเอกสารผ่าน Modal พร้อมเลือก Pool**: เพิ่ม Upload Modal แทน hidden input — แสดง dropdown เลือก pool + drag & drop / click-to-upload area, Admin เลือก pool ได้ตามสิทธิ์, User locked เป็น Personal Pool
- **ปุ่มลบแสดงเฉพาะไฟล์ที่ตัวเองอัปโหลด**: `ownerUserId === userId` check ในปุ่มลบ — แม้จะมี `DOCUMENTS_DELETE` permission ก็ไม่เห็นปุ่มลบไฟล์คนอื่น
- **ปุ่มดาวน์โหลดไฟล์ใช้งานได้**: เพิ่ม `GET /api/documents/[id]/download` endpoint ที่อ่านไฟล์จาก disk และส่งกลับด้วย `Content-Disposition: attachment` header ให้ browser ดาวน์โหลดไฟล์จริง
- **บันทึก Audit Trail**: เพิ่ม `DocumentAudit` table/API, บันทึกทุกการ view/download/upload/edit/delete
- **Progress Bar แสดงพื้นที่ Storage แบบ real-time จาก DB**: คำนวณจาก `StorageFile.fileSize` จริง, SWR refreshInterval

## Capabilities

### New Capabilities
- `documents-audit-trail`: ระบบบันทึกการเข้าถึงและแก้ไขเอกสาร
- `documents-download`: ปุ่มดาวน์โหลดไฟล์จาก Storage

### Modified Capabilities
- `functional-core-modules`: ปรับปรุง Document requirement ให้รวม upload, download, RBAC pool access, audit trail, real-time storage

## Impact

- `app/(dashboard)/documents/page.tsx` — ลบ MOCK_DOCS, แก้ upload handler (FormData), เพิ่ม download handler, แก้ RBAC pool access, แก้ progress bar, เพิ่ม audit trail UI
- `app/api/documents/route.ts` — แก้ POST รองรับ FormData, เพิ่ม PUT, แก้ DELETE ownership check, เพิ่ม audit logging
- `app/api/documents/download/route.ts` — ใหม่: อ่านไฟล์จาก `public/uploads/`, return `NextResponse(fileBuffer, { Content-Type, Content-Disposition: attachment })`
- `app/api/documents/route.ts` — POST: ใช้ `writeFileSync` เซฟไฟล์ลง `public/uploads/documents/` จริง
- `app/api/documents/audit/route.ts` — ใหม่: audit log API
- `lib/data-scope.ts` — ใช้แล้วใน API (ไม่ต้องแก้)
- `prisma/schema.prisma` — อาจเพิ่ม `DocumentAudit` ถ้ายังไม่มี (ต้องตรวจสอบ)
- ไม่มี dependency ใหม่
