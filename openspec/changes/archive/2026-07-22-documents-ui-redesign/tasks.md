## 1. ปรับ Page Header ให้ตรงกับมาตรฐาน

- [x] 1.1 แทนที่ `<h1>Document</h1>` แบบเดิมด้วย eyebrow label + title + description ตามรูปแบบ page อื่น
- [x] 1.2 Eyebrow: `<div>` ขนาด `text-[11px] font-semibold tracking-[0.16em] uppercase text-tu-primary/80` + จุดกลม `bg-tu-primary`
- [x] 1.3 Title: `<h1>` ขนาด `text-[26px] sm:text-[32px] font-semibold tracking-tight leading-tight text-tu-text-primary`
- [x] 1.4 Description: `<p>` ขนาด `text-[14px] text-tu-text-muted max-w-2xl`

## 2. เอาปุ่ม "จัดการเอกสาร" ออก

- [x] 2.1 ลบปุ่ม Secondary/Outline `<a href="/application-hub/document-management">จัดการเอกสาร</a>` และ wrapping `<div>` ออก
- [x] 2.2 คงปุ่ม Primary "อัปโหลดเอกสาร" ไว้เพียงปุ่มเดียว

## 3. สร้าง API Route `/api/documents`

- [x] 3.1 สร้าง `app/api/documents/route.ts` พร้อม `GET` (list documents by pool + search)
- [x] 3.2 เพิ่ม `POST` handler — รับ FormData (file, title, poolType) สร้าง document ใน DB
- [x] 3.3 เพิ่ม `DELETE` handler — ลบ document ตาม id (เฉพาะ owner)

## 4. สร้าง API Route `/api/documents/download`

- [x] 4.1 สร้าง `app/api/documents/download/route.ts` — GET handler อ่านไฟล์จาก disk และส่งเป็น download response
- [x] 4.2 ตั้ง `Content-Disposition: attachment` พร้อม `filename*=UTF-8''` สำหรับชื่อไฟล์ภาษาไทย
- [x] 4.3 ตรวจสอบ `Content-Type` ตรงกับ mimeType ของไฟล์

## 5. เพิ่ม Audit Log ใน Documents API

- [x] 5.1 `POST /api/documents` — บันทึก audit log action `DOC_UPLOAD` (non-fatal) หลังสร้าง document สำเร็จ
- [x] 5.2 `DELETE /api/documents` — บันทึก audit log action `DOC_DELETE` (non-fatal) หลัง soft-delete สำเร็จ
- [x] 5.3 `GET /api/documents/download` — บันทึก audit log action `DOC_DOWNLOAD` (non-fatal) เมื่อส่งไฟล์

## 6. ตรวจสอบ Storage Progress Bar ยังคงอยู่

- [x] 6.1 ตรวจสอบ Storage Progress Bar (HardDrive icon + progress + percentage + audit trail) ยังคงทำงานปกติ
- [x] 6.2 ตรวจสอบตัวแปร `totalSize`, `usedGB`, `pct` ยังคงคำนวณและแสดงผลถูกต้อง

## 7. ตรวจสอบความถูกต้อง

- [x] 7.1 ทดสอบ: Header แสดง eyebrow + title + description ถูกต้อง
- [x] 7.2 ทดสอบ: Storage Progress Bar ยังคงแสดงผล — ไม่ถูกลบ
- [x] 7.3 ทดสอบ: ปุ่ม "อัปโหลดเอกสาร" แสดงเพียงปุ่มเดียว
- [x] 7.4 ทดสอบ: อัปโหลดไฟล์ → ไฟล์ปรากฏในตารางทันที
- [x] 7.5 ทดสอบ: ดาวน์โหลดไฟล์ → เบราว์เซอร์ดาวน์โหลดไฟล์ถูกต้อง
- [x] 7.6 ทดสอบ: Audit log บันทึกทุก action (UPLOAD, DOWNLOAD, DELETE)
- [x] 7.7 ทดสอบ: Search, Pool Tabs, Document Table, Upload Modal ทำงานปกติ
