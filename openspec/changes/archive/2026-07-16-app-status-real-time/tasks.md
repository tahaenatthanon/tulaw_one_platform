## 1. Application Hub — Real-time Status from API

- [x] 1.1 เพิ่ม `useSWR("/api/settings/app-status", swrFetcher)` ใน `app/(dashboard)/application-hub/page.tsx`
- [x] 1.2 สร้าง `statusMap` จาก API response: `Map<appId, status>`
- [x] 1.3 แทนที่ `online: boolean` ใน `appGroups` ด้วยค่าจาก `statusMap`
- [x] 1.4 Fallback: ถ้า API ยังไม่โหลด → แสดงสถานะเป็น "online" (default)

## 2. Status Indicators — UI

- [x] 2.1 เพิ่ม colored dot บนไอคอนแอปพลิเคชัน: `absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white`
- [x] 2.2 Online: `bg-tu-success`
- [x] 2.3 Maintenance: `bg-tu-warning animate-pulse`
- [x] 2.4 Offline: `bg-tu-error`
- [x] 2.5 ปรับ Grid View และ List View ให้แสดง indicator ทั้งคู่

## 3. Settings App Status — Audit Log

- [x] 3.1 อ่าน old status จาก `Application` table ก่อน update
- [x] 3.2 เพิ่ม `logAction(userId, "settings", "APP_STATUS_CHANGE", { entityType: "Application", entityId, oldValue: oldStatus, newValue: newStatus })`
- [x] 3.3 Import `logAction` ใน `app/api/settings/app-status/route.ts`

## 4. Application Hub — Real-time Sync

- [x] 4.1 หลังจาก Settings Save → `mutate()` → SWR re-fetch → Hub อัปเดตอัตโนมัติเมื่อผู้ใช้เข้า Hub
- [x] 4.2 แสดง loading skeleton ขณะกำลังโหลดสถานะจาก API
- [x] 4.3 ทดสอบ: เปลี่ยนสถานะใน Settings → รีเฟรช Application Hub → สถานะตรงกัน

## 5. Testing & Verification

- [x] 5.1 ทดสอบ: เปลี่ยน App Status ใน Settings → เปิด Application Hub → Status Indicator ถูกต้อง
- [x] 5.2 ทดสอบ: Online → Maintenance → Offline → Indicator เปลี่ยนตามลำดับ
- [x] 5.3 ทดสอบ: เปลี่ยนสถานะ → ตรวจสอบ AuditLog มี `APP_STATUS_CHANGE` พร้อม oldValue/newValue
- [x] 5.4 ทดสอบ: ผู้ใช้หลายคนเห็นสถานะเดียวกัน (ผ่าน SWR re-fetch)

