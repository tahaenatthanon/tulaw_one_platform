## 1. Client — Fix Status Change (Optimistic Update + Force Revalidate)

- [x] 1.1 เปลี่ยน `handleConfirm`: เพิ่ม optimistic update ก่อน PUT (`mutateBookings` แก้ cache ทันที, `revalidate: false`)
- [x] 1.2 หลังจาก PUT สำเร็จ → `await mutateBookings()` + `await mutateRooms()` force revalidate จาก server
- [x] 1.3 ถ้า PUT ล้มเหลว → rollback optimistic update + refetch server truth

## 2. API — PUT Endpoint รองรับ Edit Fields

- [x] 2.1 เพิ่ม logic ใน `PUT /api/book-meeting`: ถ้า body มี field อื่นนอกจาก `status` → check ownership (`userId === session.user.id` หรือ `minRoleLevel >= 50`)
- [x] 2.2 ถ้าเป็นการ edit (ไม่ใช่ approve): อัปเดต `title`, `startTime`, `endTime`, `attendeeCount`, `remark` ตามที่ส่งมา
- [x] 2.3 ถ้ามีการเปลี่ยน `startTime`, `endTime`, `roomId` → ตั้ง `status: "pending"` โดยอัตโนมัติ
- [x] 2.4 ตรวจสอบ conflict ก่อนอัปเดต (กรณีเปลี่ยนวัน/เวลา/ห้อง) — ไม่รวม booking ตัวเอง

## 3. Client — Edit Modal (BookingModal in Edit Mode)

- [x] 3.1 เพิ่ม `mode?: "create" | "edit"` และ `initialBooking?: Booking` prop ใน `BookingModal`
- [x] 3.2 ถ้า `mode === "edit"`: pre-fill ฟอร์มด้วยข้อมูลจาก `initialBooking` (แปลง `startTime`/`endTime` ISO → `"HH:mm"`)
- [x] 3.3 เปลี่ยนปุ่ม submit: "บันทึก" แทน "จองห้อง", เรียก `onUpdate` callback (หรือ `handleEdit`) แทน `onCreate`
- [x] 3.4 ถ้าเปลี่ยนวัน/เวลา/ห้อง → status กลับเป็น `"pending"`, ถ้าเปลี่ยนเฉพาะ title/attendees/purpose → status คงเดิม

## 4. Client — Edit Button in My-Bookings Tab

- [x] 4.1 เพิ่มปุ่ม "แก้ไข" ใน `BookingsList` เมื่อ `type === "my-bookings"` และ `booking.status !== "cancelled"` และ `booking.status !== "completed"`
- [x] 4.2 ปุ่มแก้ไขเรียก `onEdit(booking)` → เปิด `EditBookingModal`
- [x] 4.3 เพิ่ม `handleEdit` callback ใน main page component

## 5. Client — Remove Confirm Button from My-Bookings Tab

- [x] 5.1 แก้ไขเงื่อนไขปุ่ม "ยืนยัน" ใน `BookingsList`: เปลี่ยนจาก `(type === "pending" || (type === "my-bookings" && canApprove))` → `(type === "pending")`
- [x] 5.2 ตรวจสอบว่าแท็บ "การจองของฉัน" แสดงเฉพาะปุ่มแก้ไขและยกเลิก (ไม่มีปุ่มยืนยัน)

## 6. Client — History Shows Only Approved Bookings

- [x] 6.1 แก้ไข history filter ใน `BookingsList`: เอา `b.status === "cancelled"` ออกจาก filter — แสดงเฉพาะ `completed` และ `confirmed` (ที่ `endTime < now`)
- [x] 6.2 ตรวจสอบว่า booking ที่ยกเลิกแล้วไม่ปรากฏในแท็บประวัติ

## 7. Client — Cancel Confirmation Dialog

- [x] 7.1 เพิ่ม `cancelTargetId` state ใน main page component
- [x] 7.2 สร้าง `handleRequestCancel(id)` → set `cancelTargetId`
- [x] 7.3 สร้าง `handleCancelConfirm()` → เรียก `handleCancel(cancelTargetId)` แล้ว clear state
- [x] 7.4 เพิ่ม `ConfirmDialog` component (danger variant) ใน JSX
- [x] 7.5 เปลี่ยน `onCancel={handleCancel}` เป็น `onCancel={handleRequestCancel}` ในทุก BookingsList instance

## 8. Client — Real-Time Rooms Status via Faster Polling

- [x] 8.1 ลด `refreshInterval` ใน `useSWR("/api/book-meeting/rooms")` จาก 30000 → 10000 (10 วินาที)
- [x] 8.2 ยืนยันว่า `mutateRooms()` ถูกเรียกในทุก mutation handler (create, confirm, cancel, update)

## 9. Verification

- [x] 9.1 ทดสอบ: Admin กด "ยืนยัน" ในแท็บ "รออนุมัติ" → status เปลี่ยนเป็น "confirmed" ทันที
- [x] 9.2 ทดสอบ: แท็บ "การจองของฉัน" ไม่มีปุ่ม "ยืนยัน" แม้ใน pending booking — มีเฉพาะแก้ไขและยกเลิก
- [x] 9.3 ทดสอบ: User กด "แก้ไข" booking ของตัวเอง → เปลี่ยน title → กดบันทึก → title เปลี่ยนใน my-bookings tab
- [x] 9.4 ทดสอบ: User แก้ไขวัน/เวลาของ booking ที่ confirmed → status กลับเป็น "pending" → Admin ต้องอนุมัติใหม่
- [x] 9.5 ทดสอบ: User ไม่เห็นปุ่มแก้ไขใน booking ของคนอื่น
- [x] 9.6 ทดสอบ: แก้ไข non-critical fields (title, attendees) → status ไม่เปลี่ยน (ยัง confirmed)
- [x] 9.7 ทดสอบ: สถานะห้องอัปเดตภายใน 10 วินาทีหลังจากมีการจอง/อนุมัติ/ยกเลิก — RoomsTab แสดงสถานะล่าสุดโดยไม่ต้อง reload หน้า
- [x] 9.8 ทดสอบ: `mutateRooms()` ถูกเรียกทันทีหลัง create/confirm/cancel/edit — RoomsTab แสดงผลทันที (instant, ไม่ต้องรอ polling)
- [x] 9.9 ทดสอบ: Booking ที่ถูกยกเลิกแล้วไม่ปรากฏในแท็บประวัติ
- [x] 9.10 ทดสอบ: กด "ยกเลิก" → ConfirmDialog ปรากฏ → กด "ยกเลิก" (ปิด) → ไม่มีการเรียก API
- [x] 9.11 ทดสอบ: กด "ยกเลิก" → ConfirmDialog ปรากฏ → กด "ยกเลิกการจอง" → API ถูกเรียก → booking ถูกยกเลิก
