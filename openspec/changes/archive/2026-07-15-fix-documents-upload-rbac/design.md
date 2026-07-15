## Context

Documents module ปัจจุบัน (`app/(dashboard)/documents/page.tsx`, `app/api/documents/route.ts`) มีโครงสร้างพื้นฐานครบแต่มีช่องโหว่หลายจุด:
- Client ใช้ `MOCK_DOCS` fallback (12 mock documents)
- Upload ใช้ FormData ใน client แต่ POST API handler รับ `req.json()` — format mismatch
- ปุ่ม Download เป็น `Button` เปล่าไม่มี `onClick` handler
- RBAC ใช้ `roles.includes("super_admin")` แทน `resolveDataScope`
- ไม่มี Audit Trail จริง (มีแต่ข้อความ UI)
- Storage Progress Bar ใช้ MOCK_DATA ไม่ใช่ข้อมูลจริง

โครงสร้าง DB พร้อมแล้ว: `Document`, `StorageFile`, `DocumentVersion`, `DocumentShare`, `DocumentTag`

## Goals / Non-Goals

**Goals:**
- Upload ไฟล์ทำงาน end-to-end (FormData → API → DB → UI update)
- Download ไฟล์ทำงานผ่าน API endpoint
- Pool access ตาม RBAC data scope (resolveDataScope + buildDocumentPoolWhere)
- User แก้ไข/ลบได้เฉพาะ Personal Pool
- Audit Trail บันทึกทุกการกระทำ
- Storage Progress Bar real-time จาก DB

**Non-Goals:**
- ไม่เพิ่ม document versioning (มี DocumentVersion model แล้วแต่ยังไม่ implement)
- ไม่เพิ่ม OCR search (ทำแยก change)
- ไม่เพิ่ม document sharing (DocumentShare model มีแล้ว)
- ไม่แก้ไข layout หรือ style

## Decisions

### D1: POST handler รองรับ FormData

**ตัดสินใจ:** เปลี่ยน `req.json()` → `req.formData()`, extract file + fields, สร้าง `StorageFile` → `Document` ใน transaction, คืนค่า full document object พร้อม `storageFile.fileSize` สำหรับ progress bar

### D2: Download via API route with actual file serving

**ตัดสินใจ:** สร้าง `GET /api/documents/download?id=<documentId>`:
- ค้นหา document + storageFile, ตรวจสอบ data scope
- อ่านไฟล์จริงจาก `public/uploads/documents/` ด้วย `readFileSync`
- Return `NextResponse(fileBuffer, { Content-Type, Content-Disposition: "attachment" })` — browser จะ trigger download
- Audit `action: "download"` (non-fatal)

**เหตุผล:**
- `Content-Disposition: attachment` ทำให้ browser โหลดเป็นไฟล์ ไม่ใช่แสดง JSON
- POST handler เซฟ buffer ลง `public/uploads/documents/` ด้วย `writeFileSync` แล้ว — download อ่านจาก path เดียวกัน
- Stream approach (`createReadStream`) ไม่จำเป็นสำหรับไฟล์ขนาดเล็ก — `readFileSync` ง่ายกว่าและเพียงพอ

### D3: Pool access ใช้ resolveDataScope ที่มีอยู่

**ตัดสินใจ:** Client `getAvailablePools()` ใช้ `ROLE_LEVELS` และ `resolveDataScope` logic แทน string matching:
- Level ≥ 80: ทุก pool
- Level ≥ 70: ทุก pool แต่ personal view เฉพาะของตัวเอง
- Level ≥ 50: central + department (own) + personal (own)
- Level ≥ 30: central + personal (own)

**ทางเลือกที่พิจารณา:**
- ❌ ส่ง pool list จาก API → เพิ่ม API call โดยไม่จำเป็น, client มี role อยู่แล้ว

### D4: Upload poolType — force personal for non-admin

**ตัดสินใจ:**
- Client-side: `poolType = maxLevel >= 50 ? (tabId || "personal") : "personal"` — User/Viewer อัปโหลดได้เฉพาะ personal pool เสมอ ไม่ว่าจะอยู่ tab ไหน
- Server-side: API enforce pool access — central pool ต้องมี `DOCUMENTS_MANAGE_POOL`, department → ต้องเป็น dept admin ของฝ่ายนั้น
- ถ้าเป็น dept_admin upload ไป department pool: เพิ่ม `departmentId = user.departmentId`

**ทางเลือกที่พิจารณา:**
- ❌ ใช้ pool จาก tab ที่ผู้ใช้เลือก → User อาจเผลออัปโหลดไป central/department pool ซึ่งไม่ควรทำได้

### D4b: ปุ่มลบแสดงเฉพาะไฟล์ที่ตัวเองอัปโหลด

**ตัดสินใจ:** Client-side: `canDelete && doc.ownerUserId === userId` — ปุ่มลบจะปรากฏเฉพาะในไฟล์ที่ user คนนั้นอัปโหลดเอง แม้จะมี `DOCUMENTS_DELETE` permission ก็ตาม Server-side มี ownership check ซ้ำอีกชั้น

**เหตุผล:**
- ป้องกัน UI clutter: User ไม่ควรเห็นปุ่มลบบนไฟล์ที่ตัวเองลบไม่ได้
- สอดคล้องกับ RBAC: User แก้ไข/ลบได้เฉพาะ Personal Pool ของตัวเอง

### D5: Audit Trail — ใช้ middleware pattern

**ตัดสินใจ:** สร้าง `prisma.documentAudit.create()` ในทุก API handler (GET/download, POST, PUT, DELETE):
- `action: "view" | "download" | "create" | "update" | "delete"`
- `documentId, userId, createdAt`
- Non-blocking: audit failure ไม่ควร break request

### D6: Storage Progress Bar from DB

**ตัดสินใจ:** Client-side คำนวณ total size จาก `docs.map(d => d.fileSize)` ที่ได้จาก API (API ส่ง `storageFile.fileSize` ใน response), ใช้ SWR `refreshInterval: 15000` + mutate after upload/delete

### D7: Upload Modal พร้อม Pool Dropdown + Drag & Drop

**ตัดสินใจ:** แทนที่ hidden `<input type="file">` และ `<label>` ด้วย Upload Modal:
- ปุ่ม "อัปโหลดเอกสาร" → เปิด Modal
- Modal มี dropdown เลือก Pool (filtered by `availablePools`, disabled สำหรับ User level < 50)
- Dropzone: drag & drop + click-to-browse, border dashed style, feedback เมื่อ hover/selected
- Preview ชื่อไฟล์ + ขนาดเมื่อเลือกแล้ว
- ปุ่ม "อัปโหลด" / "ยกเลิก"
- `handleUploadSubmit()` ส่ง FormData เหมือนเดิม

**เหตุผล:**
- UX ชัดเจน: ผู้ใช้รู้ว่ากำลังอัปโหลดไป pool ไหน (เลือกจาก dropdown)
- ไม่ผูกกับการเลือก tab — upload pool เป็นอิสระจาก filter tab
- Drag & drop สะดวกสำหรับ desktop users
- Modal pattern สอดคล้องกับ `BookingModal` ใน Book Meeting module

**ทางเลือกที่พิจารณา:**
- ❌ ใช้ hidden input + tab-driven pool เหมือนเดิม → ไม่ intuitive, pool เปลี่ยนตาม tab ที่ดูอยู่
- ❌ Upload inline ในตาราง → clutter UI, ซับซ้อน

## Risks / Trade-offs

- **[Risk] FormData parsing อาจมี edge cases (filename encoding)** → **Mitigation:** ใช้ `file.name` โดยตรง, validate file type + size
- **[Risk] Download large files อาจ timeout** → **Mitigation:** Stream file, ตั้ง Content-Type จาก mimeType
- **[Trade-off] Audit log โตเร็ว** → สำหรับ document 1,000 รายการ อาจมี 5,000+ audit entries → เก็บ 1 ปี ตาม policy ลบอัตโนมัติภายหลัง
