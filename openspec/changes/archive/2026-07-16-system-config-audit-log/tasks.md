## 1. Audit Log — API Endpoints

- [x] 1.1 สร้าง `GET /api/audit-logs` — ดึงรายการพร้อม pagination, multi-filter (user, eventType, module, severity, dateFrom, dateTo), search, sort
- [x] 1.2 สร้าง `GET /api/audit-logs/[id]` — ดึงรายละเอียด (User, Timestamp, IP, Module, Action, oldValue, newValue)
- [x] 1.3 สร้าง `GET /api/audit-logs/export` — Export CSV
- [x] 1.4 สร้าง `GET /api/audit-logs/export?format=xlsx` — Export Excel
- [x] 1.5 เพิ่ม permission checks (`AUDIT_LOG_VIEW`, `AUDIT_LOG_EXPORT`) ในทุก endpoint
- [x] 1.6 เพิ่ม data scope: Dept Admin เห็นเฉพาะ audit log ของหน่วยงานตนเอง

## 2. Audit Log — Utility & Auto-Logging

- [x] 2.1 สร้าง `lib/audit-log.ts` — `createAuditLog()` utility function
- [x] 2.2 `createAuditLog` รองรับ: userId, module, action, entityType, entityId, oldValue, newValue, ipAddress, isSuccess
- [x] 2.3 เพิ่ม auto-audit-log ใน API routes ที่สำคัญ: `users/route.ts` (create/update/delete), `settings/route.ts` (config update), `projects/route.ts` (approve)
- [x] 2.4 เพิ่ม auto-audit-log ใน Auth flow: login success, login failed

## 3. Audit Log — UI Refactor

- [x] 3.1 แทนที่ Mock Data ใน `app/(dashboard)/audit-log/activity-log/page.tsx` ด้วย API จริง
- [x] 3.2 เพิ่ม Multi-filter UI: User (combobox), Event Type (dropdown), Module (dropdown), Date Range (date picker)
- [x] 3.3 เพิ่ม Sort โดยคลิกหัวคอลัมน์ (Timestamp, Event Type, Module, User)
- [x] 3.4 เพิ่ม View Details Dialog/Drawer แสดง: User, Timestamp, IP, Module, Action, Before/After
- [x] 3.5 เพิ่มปุ่ม Export CSV และ Export Excel
- [x] 3.6 เพิ่ม Date Range Picker สำหรับกำหนดช่วงข้อมูลที่แสดงและส่งออก
- [x] 3.7 ใช้ Event Type badges พร้อมสีตามประเภท (DOC_UPLOAD=info, CONFIG_UPDATE=warning, USER_LOGIN_FAILED=error ฯลฯ)

## 4. Settings API — Single Section Endpoint

- [x] 4.1 สร้าง `GET /api/settings?section=` — ดึงค่าตาม section (auth, sso, branding, storage, app-status)
- [x] 4.2 สร้าง `PUT /api/settings?section=` — บันทึกค่าตาม section พร้อม Zod validation
- [x] 4.3 สร้าง Zod schemas สำหรับแต่ละ section: authSchema, ssoSchema, brandingSchema, storageSchema, appStatusSchema
- [x] 4.4 เพิ่ม permission checks (`SETTINGS_VIEW`, `SETTINGS_MANAGE`) ในทุก endpoint

## 5. Settings — Branding (Logo + Colors)

- [x] 5.1 สร้าง `POST /api/settings/upload-logo` — อัปโหลดโลโก้ (max 2MB, PNG/JPG/SVG) เก็บใน StorageFile
- [x] 5.2 อัปเดต `ThemeSetting` table เมื่อเปลี่ยนสีหรือโลโก้
- [x] 5.3 Client-side: อัปเดต CSS variables ทันทีหลังบันทึก (`document.documentElement.style.setProperty`)
- [x] 5.4 เพิ่ม Secondary Color Picker ใน UI Branding tab

## 6. Settings — API Keys Management

- [x] 6.1 สร้าง `POST /api/api-keys` — Create API Key (สร้าง ApiClient + ApiKey, เก็บ hash, คืน full key ครั้งเดียว)
- [x] 6.2 สร้าง `POST /api/api-keys/[id]/rotate` — Rotate (สร้าง key ใหม่, invalidate เก่า)
- [x] 6.3 สร้าง `PATCH /api/api-keys/[id]` — Disable (`isActive: false`)
- [x] 6.4 สร้าง `DELETE /api/api-keys/[id]` — Soft-delete
- [x] 6.5 อัปเดต UI ใน `settings/page.tsx` แท็บ API Keys ให้เรียก API จริง

## 7. Settings — Categories, Rooms, App Status

- [x] 7.1 อัปเดต Categories tab: ใช้ API จริงสำหรับ Add/Edit/Delete/Color
- [x] 7.2 อัปเดต Meeting Rooms tab: ใช้ `MeetingRoom` table จริงผ่าน API
- [x] 7.3 อัปเดต App Status tab: ใช้ `Application` table จริงผ่าน API
- [x] 7.4 เพิ่ม toast notification สำหรับทุก Save/Delete operation

## 8. Settings — UI Refactor (All Tabs)

- [x] 8.1 แทนที่ Mock Data (`DEFAULT_AUTH`, `DEFAULT_SSO`, `DEFAULT_BRANDING`, `DEFAULT_STORAGE`) ใน settings page ด้วย API fetch
- [x] 8.2 เพิ่ม Loading state ขณะดึงข้อมูลจาก API
- [x] 8.3 เพิ่ม Success/Error toast หลัง Save ทุก section
- [x] 8.4 ตรวจสอบ Real-time behavior: เปลี่ยนแปลงแล้วมีผลทันทีโดยไม่ต้องรีเฟรช

## 9. Testing & Verification

- [x] 9.1 ทดสอบ Settings Authentication: แก้ไขค่า → Save → รีเฟรช → ค่าคงอยู่
- [x] 9.2 ทดสอบ Settings Branding: เปลี่ยนสี → CSS variables อัปเดตทันที
- [x] 9.3 ทดสอบ Settings API Keys: Create → Rotate → Disable → Delete
- [x] 9.4 ทดสอบ Settings Categories/Rooms/App Status: CRUD ผ่าน API
- [x] 9.5 ทดสอบ Audit Log: ดึงข้อมูลจาก DB จริง → Multi-filter → Sort → View Details
- [x] 9.6 ทดสอบ Audit Log Export: CSV และ Excel
- [x] 9.7 ทดสอบ Audit Log Immutability: ไม่มี endpoint สำหรับแก้ไข/ลบ
- [x] 9.8 ทดสอบ Auto-audit-log: สร้าง/แก้ไข user → ตรวจสอบว่ามีบันทึกใน AuditLog
- [x] 9.9 ทดสอบ Permission Guards: Super Admin/System Admin เข้าถึง Settings, Dept Admin ไม่เห็น Settings
- [x] 9.10 ทดสอบ Data Scope: Dept Admin เห็นเฉพาะ Audit Log ของหน่วยงานตนเอง

## 10. Data Persistence Verification

- [x] 10.1 ตรวจสอบ Settings Authentication: แก้ไข → Save → รีเฟรช → ค่าคงอยู่จาก DB (handleSave → fetchApi PUT → mutate refetch API → DB)
- [x] 10.2 ตรวจสอบ Settings SSO/LDAP: แก้ไข → Save → รีเฟรช → ค่าคงอยู่ (flow เดียวกับ auth)
- [x] 10.3 ตรวจสอบ Settings Branding: เปลี่ยนสี → Save → รีเฟรช → สีคงอยู่และ CSS variables ถูกต้อง (SystemConfig table + setProperty)
- [x] 10.4 ตรวจสอบ Settings Storage: แก้ไข Quota/File Types → Save → รีเฟรช → ค่าคงอยู่ (markDirty → handleSave → fetchApi PUT)
- [x] 10.5 ตรวจสอบ API Keys: Create → Rotate → Disable → Delete → รีเฟรช → ข้อมูลตรงกับ DB (useSWR /api/api-keys + POST/PATCH/DELETE endpoints)
- [x] 10.6 ตรวจสอบ Categories: เพิ่ม/แก้ไข/ลบ → รีเฟรช → ข้อมูลตรงกับ DB (CategoriesTabWrapper → fetchApi PUT settings with annCats/projCats)
- [x] 10.7 ตรวจสอบ Meeting Rooms: เพิ่ม/แก้ไข/ลบ → รีเฟรช → ข้อมูลตรงกับ DB (useSWR /api/settings/meeting-rooms + POST/PUT/DELETE)
- [x] 10.8 ตรวจสอบ App Status: เปลี่ยน status → รีเฟรช → status คงอยู่ (useSWR /api/settings/app-status + PUT)
- [x] 10.9 ตรวจสอบ Audit Log: ข้อมูลมาจาก DB จริง → Multi-filter → Sort → รีเฟรช → ข้อมูลอยู่ครบ (fetch /api/audit-logs, no mock data)
- [x] 10.10 ตรวจสอบ Logout/Login: แก้ไข settings → Logout → Login → เปิด Settings → ค่าเดิมอยู่ครบ (SWR refetches from API on mount → API reads DB)
- [x] 10.11 ตรวจสอบว่าไม่มี Local State ที่ทำหน้าที่เป็น Source of Truth (ทุกค่าอ่านจาก API — 6 useSWR hooks across auth/sso/branding/storage/api-keys/categories/rooms/app-status)
- [x] 10.12 ตรวจสอบ Error Handling: API fail → UI แสดง error และไม่เปลี่ยน Local State ผิดพลาด (fetchApi throws → catch sets error state → SWR returns cached data)

