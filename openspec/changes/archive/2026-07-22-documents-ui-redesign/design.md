## Context

หน้า Documents (`app/(dashboard)/documents/page.tsx`) มี UI ที่ไม่เข้ากับมาตรฐานของแพลตฟอร์ม — ใช้ header แบบง่าย ไม่มี eyebrow label, และการอัปโหลดไฟล์ไม่ทำงานเนื่องจาก `/api/documents` route handler ยังไม่ได้สร้าง

**มาตรฐาน UI ของแพลตฟอร์ม** (อ้างอิงจาก `claude.md` Section 5):

- **5.10 Standard Layout**: Page Title → Toolbar/Actions → Search/Filters → Main Content
- **5.4 Button Hierarchy**: แต่ละหน้ามี Primary Action เพียงหนึ่งปุ่ม — มี Secondary/Outline ร่วมด้วยได้
- **Consistency First**: Same layout = Same structure — ทุกหน้าต้องใช้ header รูปแบบเดียวกัน

**Reference pages** (ใช้เป็นต้นแบบ):
- `book-meeting/page.tsx` — header พร้อม eyebrow, title, description
- `intranet/page.tsx` — header รูปแบบเดียวกัน

## Goals / Non-Goals

**Goals:**
- เปลี่ยน Page Header เป็นรูปแบบเดียวกับ Book Meeting/Intranet (eyebrow label + title + description)
- สร้าง API route `/api/documents` (GET list + POST upload + DELETE) และ `/api/documents/download` (GET download) เพื่อให้อัปโหลด, แสดงผล, และดาวน์โหลดไฟล์ทำงานได้จริง พร้อมบันทึก audit log ทุก action
- คง Storage Progress Bar ไว้ตามเดิม (HardDrive icon + progress bar + percentage)
- คงฟังก์ชัน Search, Pool Tabs, Document Table, Upload Modal ไว้ทั้งหมด

**Non-Goals:**
- ไม่เปลี่ยนฟังก์ชันการทำงานของ API หรือ data flow
- ไม่เปลี่ยน logic การกรอง/ค้นหา/อัปโหลด
- ไม่เปลี่ยนโมเดลข้อมูลหรือ Prisma schema
- ไม่เพิ่มปุ่ม secondary ใน header (ปุ่มเดียวพอ: "อัปโหลดเอกสาร")

## Decisions

### 1. Header: ใช้รูปแบบเดียวกับ Book Meeting/Intranet

**ตัดสินใจ**: ใช้ markup รูปแบบเดียวกับ `book-meeting/page.tsx`:
- Eyebrow: `<div>` ขนาด 11px, uppercase, มีจุดกลม + ชื่อหมวด
- Title: `<h1>` ขนาด 26px/32px, tracking-tight
- Description: `<p>` ขนาด 14px, text-muted, max-w-2xl

**เหตุผล**: Consistency First — ทุกหน้าในแพลตฟอร์มต้องใช้ header รูปแบบเดียวกัน

### 2. Buttons: ปุ่ม Primary เพียงปุ่มเดียว

**ตัดสินใจ**: 
- **Primary only**: "อัปโหลดเอกสาร" (ปุ่มเดิม, `bg-tu-primary`) — action หลักของหน้านี้ ไม่มีปุ่ม secondary

**เหตุผล**: One primary action per page — ตาม Button Hierarchy ไม่ควรมีหลายปุ่มหลักพร้อมกัน

### 3. API Route: สร้าง `/api/documents` (GET + POST)

**ตัดสินใจ**: สร้างไฟล์ `app/api/documents/route.ts` พร้อม `GET` (list documents) และ `POST` (upload file) — รองรับการทำงานของหน้านี้แบบสมบูรณ์

**เหตุผล**:
- ปัจจุบัน `/api/documents` ไม่มี route handler — ทำให้อัปโหลดและแสดงผลไฟล์ไม่ทำงาน
- GET: ดึงรายการเอกสารตาม pool type + title search
- POST: รับ FormData พร้อม file, title, poolType — บันทึกลง DB
- ใช้ `prisma.document.findMany()` และ `prisma.document.create()` ตาม schema ที่มีอยู่แล้ว
- `/api/documents/download` (GET): อ่านไฟล์จาก disk (`public/uploads/documents/`) → ส่งกลับเป็น response พร้อม `Content-Disposition: attachment` สำหรับดาวน์โหลด
- **Audit Log**: ทุก action (UPLOAD, DOWNLOAD, DELETE) เรียก `createAuditLog()` แบบ non-fatal — ไม่ block response

### 4. Storage Progress Bar: คงไว้

**ตัดสินใจ**: คง `Storage Progress Bar` ไว้ตามเดิม — ไม่ลบออก

**เหตุผล**:
- Storage Progress Bar เป็นฟีเจอร์สำคัญที่แจ้ง quota ให้ผู้ใช้ทราบ
- เป็นส่วนหนึ่งของ spec เอกสารที่ระบุ storage 5 GB ต่อ user

### 5. คงโครงสร้างเดิมทุกอย่างอื่น

**ตัดสินใจ**: Search bar, Pool Tabs, Document Table, Upload Modal — ไม่เปลี่ยนแปลง

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| สร้าง API route ใหม่อาจมี edge case | ใช้โครงสร้างมาตรฐานของ API ในโปรเจกต์ (auth guard, apiSuccess/apiError, prisma) |
