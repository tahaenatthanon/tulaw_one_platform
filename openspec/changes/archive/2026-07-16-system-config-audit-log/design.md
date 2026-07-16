## Context

ปัจจุบัน System Configuration หน้า `/settings` มี 8 tabs (Authentication, SSO/LDAP, UI Branding, Storage, API Keys, Categories, Meeting Rooms, App Status) ใช้ Mock Data และ `useState` local — ไม่มี Persistence การตั้งค่าจะหายเมื่อรีเฟรชหรือรีสตาร์ทเซิร์ฟเวอร์

Audit Log หน้า `/audit-log/activity-log` ใช้ `generateLogs()` สร้างข้อมูลปลอม ไม่มีการเชื่อมต่อกับ `AuditLog` table ในฐานข้อมูล

**ข้อจำกัด:**
- Settings: เข้าถึงได้เฉพาะ Super Admin และ System Admin
- Audit Log: Super Admin/System Admin ดูทั้งหมด, Dean ดูได้, Dept Admin ดูเฉพาะหน่วยงานตนเอง
- Audit Log ต้อง Immutable (append-only)
- API Keys ต้องเข้ารหัสเก็บ hash เท่านั้น

## Goals / Non-Goals

**Goals:**
- System Config ทั้ง 8 tabs อ่าน/เขียนผ่าน API และ Persist ลง DB
- การเปลี่ยนแปลงทุกอย่างมีผลทันที (Real-time)
- UI Branding: อัปโหลดโลโก้, เปลี่ยนสี, CSS Variables อัปเดตทันที
- API Keys: Create / Rotate / Disable / Delete ผ่าน API จริง
- Audit Log: ดึงข้อมูลจาก DB จริง, Multi-filter, Search, Sort, Export CSV/Excel, View Details (Before/After)
- Auto-audit-log: middleware/hook บันทึก activity อัตโนมัติเมื่อมีการเปลี่ยนแปลงสำคัญ

**Non-Goals:**
- ไม่เปลี่ยนโครงสร้างหน้า UI (คง Tab-based)
- ไม่ implement LDAP/SSO connection จริง (Mock connection settings)
- ไม่ implement Email/Notification sending จริง
- ไม่เปลี่ยน Authentication Provider

## Decisions

### 1. Settings API: Single Endpoint with Section Key

**เลือก:** `GET/PUT /api/settings?section=<auth|sso|branding|storage|categories|rooms|app-status>`
**เหตุผล:** ลดจำนวน endpoint, จัดการ permission ง่าย, section key ทำให้แยก logic ชัดเจน
**ทางเลือก:** แยก endpoint ต่อ section → ซับซ้อนเกิน

### 2. Settings Storage: Key-Value + Specialized Tables

**เลือก:**
- Authentication/SSO/Branding/Storage/App-Status → `SystemConfig` table (key-value)
- API Keys → `ApiClient` + `ApiKey` tables
- Categories → `AnnouncementCategory` + `CalendarCategory` tables (ใช้ของเดิม)
- Meeting Rooms → `MeetingRoom` table (มีอยู่แล้ว)
- Branding logo → `StorageFile` table + `ThemeSetting` table

**เหตุผล:** ใช้ schema ที่มีอยู่แล้ว ลดการ migration, Database normalized

### 3. Audit Log: Server-side Middleware + Manual Hooks

**เลือก:** ใช้ utility function `createAuditLog()` ที่เรียกจาก API route handlers โดยตรง แทน middleware อัตโนมัติ
**เหตุผล:** ควบคุม context ได้ดี (userId, ipAddress, oldValue/newValue), ไม่ต้อง inject ผ่าน request object
**ทางเลือก:** Prisma Middleware → ซับซ้อนและเข้าถึง session context ยาก

### 4. Immutable Audit Log

**เลือก:** `AuditLog` table ไม่มี UPDATE/DELETE API endpoint — บันทึกผ่าน `prisma.auditLog.create()` เท่านั้น
**เหตุผล:** Requirement กำหนดให้แก้ไขหรือลบไม่ได้

### 5. Real-time CSS Variable Update

**เลือก:** เมื่อบันทึก Branding settings สำเร็จ → API response ส่งคืนค่าใหม่ → Client อัปเดต CSS variables ผ่าน `document.documentElement.style.setProperty()`
**เหตุผล:** ไม่ต้อง reload หน้า, ผู้ใช้เห็นผลทันที

### 6. Data Persistence Strategy

**เลือก:** ทุกการดำเนินการ Create/Update/Delete ใน Settings, Categories, Meeting Rooms, App Status, API Keys ต้องผ่าน API → DB โดยตรง ไม่ใช้ Local State เป็น Source of Truth
**กลไก:**
- อ่าน: `useSWR(key, swrFetcher)` → `GET /api/*` → Prisma → DB → JSON → UI
- เขียน: User action → `fetchApi()` → API handler → Prisma → DB → Response → `mutate()` → UI re-renders with fresh data
- ยืนยัน persistence: ทุก API endpoint ต้อง return success response → client จึงอัปเดต UI; ถ้า API fail → แสดง error, UI ไม่เปลี่ยน
**เหตุผล:** รับประกันว่า UI แสดงข้อมูลที่ตรงกับฐานข้อมูลเสมอ Local State เป็นเพียง cache ชั่วคราว ไม่ใช่แหล่งข้อมูลจริง

## Risks / Trade-offs

- **SystemConfig key-value approach:** อาจมี type-safety ต่ำ → ใช้ Zod schema ในการ validate per section
- **Data Persistence — Race Condition:** ถ้า user กด Save เร็วเกินไป อาจเกิด concurrent write → ใช้ optimistic locking หรือ last-write-wins strategy ด้วย `updatedAt` timestamp
- **Audit Log ปริมาณมาก:** อาจโตเร็ว → กำหนด retention policy (1 ปี) และ indexing บน `createdAt`, `userId`, `module`
- **API Key rotation:** key เก่าต้อง invalidate ทันที → ใช้ soft-delete ด้วย `isActive: false`
- **Logo upload:** ขนาดไฟล์ใหญ่ → จำกัด 2MB, รองรับ PNG/JPG/SVG เท่านั้น
