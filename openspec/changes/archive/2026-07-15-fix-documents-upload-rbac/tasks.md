## 1. API — Fix Upload (FormData Support)

- [x] 1.1 แก้ไข `POST /api/documents`: เปลี่ยน `req.json()` → `req.formData()`, extract file + metadata fields
- [x] 1.2 สร้าง `StorageFile` record จาก file (fileName, fileSize, mimeType, path, createdBy)
- [x] 1.3 สร้าง `Document` record (`title`, `poolType`, `storageFileId`, `departmentId`, `ownerUserId`)
- [x] 1.4 ตั้ง `poolType` จาก `body.poolType || "personal"`, ตั้ง `departmentId` สำหรับ department pool
- [x] 1.5 Audit: `documentAudit.create({ action: "create", documentId, userId })`
- [x] 1.6 Return full document object พร้อม `storageFile.fileSize` ใน response

## 2. API — Download Endpoint

- [x] 2.1 สร้าง `GET /api/documents/download/route.ts` (รับ `?id=<documentId>`)
- [x] 2.2 ค้นหา `Document` + `StorageFile` จาก DB
- [x] 2.3 ตรวจสอบ permission: `DOCUMENTS_VIEW` + data scope (user ต้องเข้าถึง pool นี้ได้)
- [x] 2.4 Serve actual file: `readFileSync(fullPath)` → `new NextResponse(fileBuffer, { Content-Type, Content-Disposition: "attachment" })`
- [x] 2.5 Audit: `documentAudit.create({ action: "download", documentId, userId })`

## 3. API — Fix DELETE Ownership Check

- [x] 3.1 ใน `DELETE /api/documents`: ตรวจสอบว่า document เป็น `personal` pool หรือ user มี `minRoleLevel >= 50`
- [x] 3.2 ถ้าเป็น document ใน central/department pool และ user ไม่ใช่ admin → reject
- [x] 3.3 Audit: `documentAudit.create({ action: "delete", documentId, userId })`

## 4. API — Add PUT for Edit

- [x] 4.1 สร้าง `PUT /api/documents` handler: รับ `{ id, title, poolType? }`
- [x] 4.2 Ownership check: user แก้ไขได้เฉพาะ personal pool หรือ admin
- [x] 4.3 Audit: `documentAudit.create({ action: "update", documentId, userId })`

## 5. Client — Remove MOCK_DOCS, Use Real API

- [x] 5.1 ลบ `MOCK_DOCS` array และ fallback logic
- [x] 5.2 ใช้ `const docs = Array.isArray(apiDocs) ? apiDocs : []` แทน
- [x] 5.3 แสดง loading state เมื่อไม่มีข้อมูล (isLoading check)

## 6. Client — Upload Modal with Pool Dropdown + Drag & Drop

- [x] 6.1 สร้าง Upload Modal: dropdown เลือก Pool (filtered by `availablePools`, disabled for user)
- [x] 6.2 เพิ่ม Drag & Drop area: border dashed, icon + text, dragOver feedback, click-to-browse via hidden `input ref`
- [x] 6.3 Preview ไฟล์ที่เลือก: ชื่อ + ขนาด (MB)
- [x] 6.4 `handleUploadSubmit()`: force `poolType="personal"` สำหรับ `maxLevel < 50`, ส่ง FormData, mutate
- [x] 6.5 ปุ่ม header → เปิด Modal แทน hidden input label
- [x] 6.6 เพิ่ม `useRef`, `uploadModal`, `uploadPool`, `uploadFile`, `dragOver` states

## 7. Client — Add Download Handler

- [x] 7.1 เพิ่ม `handleDownload(id)` → `window.open(...)`
- [x] 7.2 ใส่ `onClick={() => handleDownload(doc.id)}` ในปุ่ม Download

## 8. Client — Fix RBAC Pool Access

- [x] 8.1 แก้ไข `getAvailablePools(roles)`: ใช้ `ROLE_LEVELS` จาก session แทน string matching
- [x] 8.2 Level 80+: `["central", "department", "personal"]`
- [x] 8.3 Level 70: `["central", "department", "personal"]`
- [x] 8.4 Level 50: `["central", "department", "personal"]`
- [x] 8.5 Level 30: `["central", "personal"]`

## 9. Client — Fix Delete Button: Only Own Files

- [x] 9.1 แก้ไขเงื่อนไขปุ่มลบ: `canDelete && doc.ownerUserId === userId` — แสดงเฉพาะไฟล์ที่ตัวเองอัปโหลด
- [x] 9.2 enforce pool check: `docPool !== "personal" && maxLevel < 50` → error
- [x] 9.3 เพิ่ม `ownerUserId` field ใน API GET response

## 10. Client — Real-Time Storage Progress Bar

- [x] 10.1 คำนวณ total size จาก `docs.reduce` โดยใช้ `fileSize` จาก API response
- [x] 10.2 แปลงเป็น GB: `totalBytes / (1024 * 1024 * 1024)`
- [x] 10.3 เพิ่ม `refreshInterval: 15000` ใน SWR สำหรับ doc list

## 11. Verification

- [x] 11.1 อัปโหลดไฟล์ → ปรากฏในตาราง → Storage progress bar เพิ่มขึ้น
- [x] 11.2 ดาวน์โหลดไฟล์ที่อัปโหลด → ไฟล์ถูกต้อง
- [x] 11.3 User เห็นเฉพาะ central + personal pool
- [x] 11.4 Admin เห็นทุก pool
- [x] 11.5 User ไม่สามารถลบไฟล์จาก central pool
- [x] 11.6 User ลบไฟล์จาก personal pool สำเร็จ
- [x] 11.7 Audit trail ถูกบันทึกเมื่อ view/download/upload/edit/delete
