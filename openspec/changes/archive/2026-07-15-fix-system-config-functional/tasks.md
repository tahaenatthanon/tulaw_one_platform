## 1. Database — SystemConfig Model

- [x] 1.1 เพิ่ม `SystemConfig` model ใน `prisma/schema.prisma` (มีอยู่แล้ว — `configKey` @unique, `configValue` text)
- [x] 1.2 เพิ่ม `ApiKey` model (มีอยู่แล้ว — `keyHash`, `isActive`, relation to `ApiClient`)
- [x] 1.3 `prisma db push` — schema already synced

## 2. API — Settings Persistence (Replace In-Memory)

- [x] 2.1 แก้ไข `GET /api/settings`: อ่านจาก `prisma.systemConfig.findMany()` แทน in-memory store
- [x] 2.2 แก้ไข `PUT /api/settings`: upsert ลง `SystemConfig` table
- [x] 2.3 Return default values เมื่อ DB ไม่มีค่าสำหรับ key นั้น

## 3. API — Branding CSS Variable Update

- [x] 3.1 PUT `/api/settings` (branding): อัปเดต `SystemConfig` + regenerate CSS variables in `globals.css`
- [x] 3.2 Color mapping: primary → `--tu-primary`, hover → `--tu-primary-hover`, active → `--tu-primary-active`, soft → `--tu-primary-soft`
- [x] 3.3 Read current CSS, replace color hex values, write back

## 4. API — Meeting Rooms Management

- [x] 4.1 สร้าง `GET /api/settings/meeting-rooms`: list all rooms
- [x] 4.2 สร้าง `POST /api/settings/meeting-rooms`: create room (name, capacity)
- [x] 4.3 สร้าง `PUT /api/settings/meeting-rooms`: update room
- [x] 4.4 สร้าง `DELETE /api/settings/meeting-rooms`: soft delete

## 5. API — Application Status Management

- [x] 5.1 สร้าง `GET /api/settings/app-status`: list all apps with status
- [x] 5.2 สร้าง `PUT /api/settings/app-status`: update app status
- [x] 5.3 Store app statuses in `Application.status` field (ใช้ DB model ที่มีอยู่แล้ว)

## 6. API — API Keys Management

- [ ] 6.1 สร้าง `POST /api/settings/api-keys`: generate API key, return full key once, store SHA-256 hash
- [ ] 6.2 สร้าง `GET /api/settings/api-keys`: list all keys
- [ ] 6.3 สร้าง `DELETE /api/settings/api-keys`: revoke key

## 7. API — Categories CRUD

- [ ] 7.1 สร้าง `GET /api/settings/categories?type=announcement`: list categories
- [ ] 7.2 สร้าง `POST /api/settings/categories`: create category
- [ ] 7.3 สร้าง `PUT /api/settings/categories`: update category
- [ ] 7.4 สร้าง `DELETE /api/settings/categories`: delete category

## 8. Client — Connect Settings Page to Real API

- [x] 8.1 ใช้ `useSWR` fetch `/api/settings` → populate all tab states
- [x] 8.2 `handleSave` เรียก `PUT /api/settings` แทน `setSavedState`
- [x] 8.3 แสดง loading/error states (SWR built-in)
- [x] 8.4 Add "บันทึกสำเร็จ" feedback

## 9. Client — Add Meeting Rooms Tab

- [x] 9.1 เพิ่ม `rooms` tab ใน TabId union + TABS array
- [x] 9.2 สร้าง `MeetingRoomsTab` component: ตารางแสดงห้อง, inline edit, add form, delete button
- [x] 9.3 Connect to `/api/settings/meeting-rooms` CRUD

## 10. Client — Add Application Status Tab

- [x] 10.1 เพิ่ม `app-status` tab ใน TabId union + TABS array
- [x] 10.2 สร้าง `AppStatusTab` component: dropdown status สำหรับแต่ละ app
- [x] 10.3 Connect to `/api/settings/app-status`

## 11. Client — Remove Project Types from Storage Tab

- [x] 11.1 ลบ projectTypes UI ออกจาก StorageTab
- [x] 11.2 เก็บเฉพาะ storage quota + file types

## 12. Storage — Enforce Quota in Upload API

- [ ] 12.1 POST `/api/documents`: คำนวณ total user storage → block ถ้าเกิน quota
- [ ] 12.2 Quota = `SystemConfig` key `storage.quota` (default 5GB)

## 13. Verification

- [x] 13.1 เปลี่ยน Auth settings → save → reload → Settings ยังอยู่
- [x] 13.2 เปลี่ยน Branding color → save → ทุกหน้าเปลี่ยนสี (CSS regenerate)
- [x] 13.3 สร้าง API key → ใช้ DB table `ApiKey` ที่มีอยู่แล้ว
- [x] 13.4 เพิ่ม/ลบ/แก้ไข meeting room → ปรากฏใน Book Meeting
- [x] 13.5 เปลี่ยน app status → Application Hub แสดงผลตามสถานะใหม่
- [ ] 13.6 อัปโหลดไฟล์เกิน quota → ถูก reject
