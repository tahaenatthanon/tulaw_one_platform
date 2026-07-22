## 1. แก้ไข History Tab Scope (Client)

- [x] 1.1 เพิ่มการกรอง `userId` ใน `HistoryTable` — ใน type history กรองตาม role: User level (< 50) เห็นเฉพาะของตัวเอง, Admin ขึ้นไปเห็นทั้งหมด
- [x] 1.2 เพิ่ม `userRoleLevel` prop เพื่อตัดสินใจ scope ใน `HistoryTable`
- [x] 1.3 เพิ่ม booking status `cancelled` ใน history filter

## 2. สร้าง HistoryTable Component (ตารางประวัติ)

- [x] 2.1 สร้าง `history-table.tsx` component ใหม่ใน `app/(dashboard)/book-meeting/`
- [x] 2.2 ตารางมีคอลัมน์: วัน/เวลา (timestamp), หัวข้อ, ห้อง, จำนวน, รายละเอียด, ช่วงเวลา (start–end), ผู้จอง
- [x] 2.3 เรียงตามวันเวลาล่าสุดก่อน (descending by `date` + `startTime`)
- [x] 2.4 ใช้ semantic `<table>` พร้อม `overflow-x-auto` สำหรับ responsive
- [x] 2.5 แสดงสถานะ booking ด้วย badge สีตาม `BOOKING_STATUS` mapping
- [x] 2.6 แสดง empty state เมื่อไม่มีข้อมูล

## 3. แก้ไข Pending Tab ให้ Refresh ทันที

- [x] 3.1 ใน `handleCreate` — `mutateBookings()` อยู่หลัง `await fetchApi(...)` สำเร็จแล้ว (ไม่มี optimistic update)
- [x] 3.2 ใน `handleUpdate` — เช่นเดียวกับข้อ 3.1 (working correctly)
- [x] 3.3 ตรวจสอบว่าหลัง `handleCreate` สำเร็จ ข้อมูลใหม่จาก SWR re-fetch แสดงในแท็บ "รออนุมัติ" ทันที

## 4. แก้ไข Conflict Error แสดง Inline ใน Dialog

- [x] 4.1 `CreateBookingDialog` — ใน `handleSubmit` เมื่อ catch `ApiError` ที่มี `code === "CONFLICT"` ให้ set `conflict` state แทน `toast.error`
- [x] 4.2 `CreateBookingDialog` — `handleSubmit` สำหรับ error อื่น (ไม่ใช่ conflict) ยังใช้ `toast.error` ตามเดิม
- [x] 4.3 ลบ `toast.error` ซ้ำซ้อนจาก `handleCreate` ใน `page.tsx` (dialog จัดการเองแล้ว)
- [x] 4.4 ตรวจสอบ inline conflict UI (`AlertTriangle` + ข้อความสีแดง) แสดงถูกต้องและ submit button disabled เมื่อมี conflict

## 5. เชื่อมต่อ HistoryTable เข้ากับ Page

- [x] 5.1 ใน `page.tsx` — แทนที่ `UpcomingBookings type="history"` ด้วย `HistoryTable` component
- [x] 5.2 ส่ง props: `bookings`, `rooms`, `currentUserId`, `userRoleLevel`
- [x] 5.3 `HistoryTable` รับผิดชอบการกรองข้อมูลเองตาม role

## 6. ตรวจสอบความถูกต้อง

- [x] 6.1 ทดสอบ: User (level 30) เห็นเฉพาะประวัติของตัวเองในแท็บ "ประวัติ" แบบตาราง
- [x] 6.2 ทดสอบ: Admin (level 80) เห็นประวัติทั้งหมดในแท็บ "ประวัติ" แบบตาราง
- [x] 6.3 ทดสอบ: จองห้องใหม่ด้วย status pending → ปรากฏในแท็บ "รออนุมัติ" ทันที
- [x] 6.4 ทดสอบ: จองเวลาซ้ำ → ข้อความ conflict แสดง inline ใน dialog, dialog ไม่ปิด
- [x] 6.5 ทดสอบ: Error อื่น (validation) → toast แสดงผลตามปกติ
- [x] 6.6 ทดสอบ: HistoryTable responsive — `overflow-x-auto` แสดง scroll แนวนอนบน mobile
- [x] 6.7 ทดสอบ: HistoryTable empty state — แสดงข้อความ "ไม่พบประวัติการจอง"
