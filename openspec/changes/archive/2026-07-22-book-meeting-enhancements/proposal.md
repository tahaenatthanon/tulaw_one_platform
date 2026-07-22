## Why

ระบบจองห้องประชุมปัจจุบันมีฟังก์ชันไม่ครบถ้วน — ตารางเวลาแสดงถึงแค่ 16:30, แท็บ "การจองของฉัน" ไม่มีปุ่มแก้ไข/ยกเลิก, แท็บ "รออนุมัติ" ไม่แยกตามสิทธิ์ผู้ใช้, ฟอร์มจองต้องกรอกชื่อผู้จัดเอง, และไม่มี audit log หรือประวัติการอนุมัติ ทำให้ขาด accountability และไม่สะดวกต่อการใช้งานจริง

## What Changes

### ตารางเวลา (Schedule)
- ขยายเวลาสิ้นสุดจาก 16:30 → 18:00 (เพิ่มคอลัมน์ 17:00, 17:30, 18:00)

### การจองของฉัน (My Bookings)
- เพิ่มปุ่ม "แก้ไข" และ "ยกเลิก" ในแต่ละรายการจอง
- ปุ่มแก้ไข → เปิด dialog แก้ไข (ใช้ CreateBookingDialog เดิมใน mode="edit")
- ปุ่มยกเลิก → เปลี่ยนสถานะเป็น cancelled พร้อม optimistic update

### รออนุมัติ (Pending)
- **User ทั่วไป**: เห็นเฉพาะรายการที่ตัวเองจองเท่านั้น
- **ผู้มีสิทธิ์ BOOK_MEETING_APPROVE (Dept Admin+)**: เห็นทั้งหมด
- แสดงชื่อผู้จอง (firstNameTh lastNameTh) ในแต่ละรายการ

### ฟอร์มจองห้องประชุม
- ยกเลิกช่องกรอก "ผู้จัด" — ใช้ชื่อจาก session user แทน
- แสดงชื่อผู้จองอัตโนมัติในรายการจอง

### ประวัติ (History)
- เมื่อกดอนุมัติ/ไม่อนุมัติ → เก็บประวัติการเปลี่ยนสถานะไว้ (BookingHistory หรือ statusLog)

### Audit Log
- บันทึก audit log ทุก action: create, edit, cancel, approve, reject

### การแจ้งเตือน
- ส่ง notification เมื่ออนุมัติ (confirmed) — มีอยู่แล้ว
- เพิ่ม notification เมื่อไม่อนุมัติ (cancelled)

## Capabilities

### New Capabilities
- `book-meeting-edit-cancel`: ปุ่มแก้ไขและยกเลิกในแท็บ "การจองของฉัน"
- `book-meeting-approval-flow`: ปรับปรุง workflow รออนุมัติ — แยกตามสิทธิ์, แสดงชื่อผู้จอง, ประวัติการอนุมัติ
- `book-meeting-form-auto-organizer`: ฟอร์มจองใช้ชื่อผู้ใช้แทนการกรอกเอง
- `book-meeting-audit-notification`: Audit log + แจ้งเตือนเมื่ออนุมัติ/ไม่อนุมัติ

### Modified Capabilities
- `book-meeting-ui-components`: ปรับตารางเวลาให้จบที่ 18:00
- `book-meeting-history`: เพิ่มประวัติการเปลี่ยนสถานะ (approval log)

## Impact

- `app/(dashboard)/book-meeting/page.tsx`: เพิ่ม logic edit/cancel, pending scope, organizer
- `app/(dashboard)/book-meeting/create-booking-dialog.tsx`: ลบ organizer field, auto-fill จาก session
- `app/(dashboard)/book-meeting/upcoming-bookings.tsx`: เพิ่มปุ่ม edit/cancel, แสดงชื่อผู้จอง, filter pending ตามสิทธิ์
- `app/(dashboard)/book-meeting/schedule-table.tsx`: ขยาย TIME_SLOTS ถึง 18:00
- `app/api/book-meeting/route.ts`: เพิ่ม audit log, notification สำหรับ reject, booking history
- `lib/audit-log.ts`: ใช้ existing function (ไม่มีแก้ไข)
- `prisma/schema.prisma`: (อาจจำเป็น) BookingHistory model ใหม่
