## 1. ตารางเวลา — ขยายเป็น 18:00

- [x] 1.1 เพิ่ม time slots 17:00, 17:30 ใน `TIME_SLOTS` array ของ `schedule-table.tsx`
- [x] 1.2 ปรับ `timeOptions` ใน `create-booking-dialog.tsx` ให้รองรับถึง 18:00 (มีอยู่แล้ว — ตรวจสอบว่าแสดงถึง 17:00-18:00 ด้วย)

## 2. การจองของฉัน — ปุ่มแก้ไข / ยกเลิก

- [x] 2.1 เพิ่ม props `onEdit` ใน `UpcomingBookings` component
- [x] 2.2 เพิ่มปุ่ม "แก้ไข" และ "ยกเลิก" เมื่อ `type === "my-bookings"` ใน `upcoming-bookings.tsx`
- [x] 2.3 ใน `page.tsx` — implement `handleEditBooking` ที่เปิด `CreateBookingDialog` ใน mode="edit"
- [x] 2.4 ใน `page.tsx` — implement `handleCancelBooking` ที่ PUT status: "cancelled" พร้อม optimistic update

## 3. รออนุมัติ — แยกตามสิทธิ์ + แสดงชื่อผู้จอง

- [x] 3.1 แก้ไข `UpcomingBookings` filter สำหรับ `type === "pending"` ให้กรองตาม `canApprove` (approver เห็นทั้งหมด, user เห็นของตัวเอง)
- [x] 3.2 แสดงชื่อผู้จอง (firstNameTh lastNameTh) ในรายการ pending — ต้อง join user data จาก API
- [x] 3.3 ใน `page.tsx` — ส่ง `canApprove` และ `currentUserId` ไปยัง `UpcomingBookings` สำหรับ pending tab

## 4. ฟอร์มจอง — ใช้ชื่อ user เป็นผู้จัด

- [x] 4.1 ลบ `organizer` input field ออกจาก `create-booking-dialog.tsx`
- [x] 4.2 แสดงชื่อผู้ใช้จาก session (`session.user.firstNameTh lastNameTh`) แทน organizer field
- [x] 4.3 ใน `upcoming-bookings.tsx` — แสดงชื่อผู้จองในรายการแทน `b.organizer`

## 5. API — GET route รวม pending + join user data

- [x] 5.1 แก้ไข GET `/api/book-meeting` ให้ include `pending` status (ปัจจุบันกรองเฉพาะ `not: "cancelled"` → ต้องรวม `pending` ด้วย)
- [x] 5.2 เพิ่ม user data (firstNameTh, lastNameTh) ใน response mapping

## 6. Audit Log — ทุก action

- [x] 6.1 เพิ่ม `createAuditLog` ใน POST route (action: CREATE)
- [x] 6.2 เพิ่ม `createAuditLog` ใน PUT route — approve mode (action: APPROVE)
- [x] 6.3 เพิ่ม `createAuditLog` ใน PUT route — cancel mode (action: CANCEL)
- [x] 6.4 เพิ่ม `createAuditLog` ใน PUT route — edit mode (action: UPDATE)

## 7. Notification — แจ้งเตือนเมื่อไม่อนุมัติ

- [x] 7.1 ใน PUT route — เพิ่ม notification สำหรับ `status === "cancelled"` (reject case) ใน approve mode
- [x] 7.2 ตั้งค่า `actionUrl` ให้เป็น `/book-meeting?tab=my-bookings` สำหรับทั้ง approve และ reject notifications

## 8. ประวัติ — เก็บ approval history

- [x] 8.1 เพิ่ม `statusLog Json?` field ใน `RoomBooking` model (`prisma/schema.prisma`)
- [x] 8.2 ใน PUT route — append status log entry เมื่อ approve/reject: `{ action, prevStatus, newStatus, performedBy, performedAt }`
- [x] 8.3 `npx prisma db push` เพื่อ sync schema
- [x] 8.4 ใน `BookingDetailSheet` — แสดง timeline ของ status changes (ถ้ามี `statusLog`)

## 9. ทดสอบ

- [ ] 9.1 ทดสอบ schedule แสดงถึง 18:00
- [ ] 9.2 ทดสอบ edit/cancel ใน my-bookings
- [ ] 9.3 ทดสอบ pending กรองตามสิทธิ์ + แสดงชื่อผู้จอง
- [ ] 9.4 ทดสอบ organizer auto-fill จาก session user
- [ ] 9.5 ทดสอบ audit log ถูกสร้างทุก action
- [ ] 9.6 ทดสอบ notification ส่งเมื่อ approve และ reject
- [ ] 9.7 ทดสอบ statusLog ถูกบันทึกเมื่อ approve/reject
