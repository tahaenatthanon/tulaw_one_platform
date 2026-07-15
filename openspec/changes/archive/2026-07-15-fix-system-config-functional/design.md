## Context

Settings module (`app/(dashboard)/settings/page.tsx`) มี 6 tabs ที่ UI พร้อมแต่ไม่เชื่อมต่อ API — ทุกอย่างใช้ local state. API `/api/settings` ใช้ in-memory object store. Sub-pages เก่า (auth-settings, sso-config, ฯลฯ) เป็น hardcoded/read-only.

โครงสร้างปัจจุบัน:
- `app/(dashboard)/settings/page.tsx` — 6 tabs consolidated page
- `app/api/settings/route.ts` — GET/PUT in-memory store
- `prisma/schema.prisma` — มีหลาย models รอการใช้งาน (ไม่ต้องเพิ่มมาก)

## Goals / Non-Goals

**Goals:**
- Settings persist ลง DB (ไม่หายเมื่อ restart)
- Auth/SSO settings อ่านจาก DB
- Branding เปลี่ยนสีแล้วกระทบทั้งระบบผ่าน CSS variables
- Storage quota enforce จริง
- API Keys สร้าง/revoke ได้จริง
- Categories CRUD จริง
- Meeting Rooms + Application Status tabs ใหม่

**Non-Goals:**
- ไม่แก้ไข sub-pages เก่า (auth-settings, sso-config...) — ใช้ consolidated page แทน
- ไม่ implement MFA logic จริง (UI มีแล้วใน mfa-setup)
- ไม่เพิ่ม email notification sending
- ไม่แก้ไข layout หรือ style

## Decisions

### D1: SystemConfig model — key-value store

**ตัดสินใจ:** ใช้ `SystemConfig` model แบบ key-value (`key: String @unique, value: Json`) แทนการสร้าง table แยกสำหรับแต่ละ settings group

**เหตุผล:**
- ยืดหยุ่น: เพิ่ม/ลด settings field โดยไม่ต้อง migrate
- ง่าย: GET/PUT handler เขียนครั้งเดียว
- Query เร็ว: `findMany` ทั้งหมดแล้ว map เป็น object

**ทางเลือกที่พิจารณา:**
- ❌ Table แยก (AuthSettings, BrandingSettings...) → ต้อง migrate ทุกครั้งที่เพิ่ม field

### D2: Branding → CSS variables update

**ตัดสินใจ:** Server-side update: PUT settings → เขียน `globals.css` ใหม่ด้วย color values จาก DB (หรือเก็บใน `SystemConfig`, client fetch ตอน boot). Client อ่านจาก CSS variables ที่มีอยู่แล้ว (`--tu-primary`, `--tu-secondary` ฯลฯ)

**เหตุผล:**
- CSS variables ถูกใช้อยู่แล้วในทุก component — เปลี่ยนที่เดียวกระทบทั้งระบบ
- Write CSS file approach: เรียบง่าย, cache ได้, ไม่ต้อง runtime injection

### D3: API Keys — JWT-based

**ตัดสินใจ:** สร้าง `ApiKey` model (`id, name, keyHash, scopes, createdBy, expiresAt`). POST สร้าง key → return full key ครั้งเดียว (แสดงให้ copy), store SHA-256 hash. Middleware validate key จาก `Authorization: Bearer tulaw_key_xxx` header

### D4: Storage quota — enforce in upload API

**ตัดสินใจ:** POST/Documents → check total user storage from `StorageFile.fileSize` sum → block if exceed quota. Quota read จาก `SystemConfig` key `storage.quota`

### D5: Meeting Rooms + Application Status — 2 new tabs

**ตัดสินใจ:**
- Meeting Rooms tab: ตาราง CRUD (name, capacity) → เขียนโดยตรงที่ `MeetingRoom` table (มีอยู่แล้ว)
- Application Status tab: ตารางแสดง apps → toggle status ระหว่าง `online`, `offline`, `maintenance` → เก็บใน `SystemConfig` key `apps.status`

### D6: Categories — use existing tables

**ตัดสินใจ:** Categories tab ใช้ `AnnouncementCategory` table (มีอยู่แล้ว) + เพิ่ม `DocumentCategory` หรือ reuse

## Risks / Trade-offs

- **[Risk] เขียน globals.css จาก server** → file write อาจมี race condition → Mitigation: เขียนเฉพาะตอน PUT, lock file
- **[Risk] API key ใน response** → key ปรากฏใน network tab → Mitigation: แสดงครั้งเดียว, store hash เท่านั้น
- **[Trade-off] Project types เอาออก** → อาจมี project ที่ใช้ type เก่าอยู่ → เก็บเป็น string field แทน
