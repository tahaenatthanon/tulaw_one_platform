## 1. สร้าง UI Components พื้นฐาน

- [x] 1.1 สร้าง `empty-state.tsx` — แสดงข้อความ "ไม่พบผลการค้นหา" พร้อม icon และ action button
- [x] 1.2 สร้าง `search-filter-bar.tsx` — search input + 4 filter dropdowns (อาคาร, ความจุ, อุปกรณ์, สถานะ) ใช้ shadcn/ui `<Select>`

## 2. สร้าง RoomCard

- [x] 2.1 สร้าง `room-card.tsx` — การ์ดห้องประชุมพร้อม gradient banner, status badge (ว่าง/กำลังใช้งาน/ถูกจอง), floor label, room name
- [x] 2.2 แสดง capacity box + next booking time box ใน card
- [x] 2.3 แสดง equipment tags เป็น pill badges
- [x] 2.4 ปุ่ม "จองห้องประชุม" (enable เมื่อห้องว่าง, disabled เมื่อไม่ว่าง) → เรียก `onBook(room)` prop
- [x] 2.5 ใช้ API ข้อมูลจริงจาก rooms (name, building, capacity, status)

## 3. สร้าง Schedule Table (ตาราง grid แบบเก่า)

- [x] 3.1 สร้าง `schedule-table.tsx` — ตาราง grid แนวนอน: แถว = ห้อง, คอลัมน์ = เวลา 08:00-17:00 รายชั่วโมง
- [x] 3.2 วันที่เลือกได้ — ปุ่มเลื่อนซ้าย/ขวา, แสดงวันเดือนปีภาษาไทย
- [x] 3.3 Header row: "ห้อง / เวลา" + คอลัมน์เวลา
- [x] 3.4 Room rows: ชื่อห้อง + ความจุคอลัมน์แรก, cell ตามเวลา
- [x] 3.5 Booking block: แสดงชื่อการจองเป็นบล็อกสี bg-tu-primary บน cell ของเวลาเริ่มต้น
- [x] 3.6 คลิก booking → เรียก `onSelectBooking(booking)` prop

## 4. สร้าง UpcomingBookings

- [x] 4.1 สร้าง `upcoming-bookings.tsx` — แสดงรายการจองเรียงตาม date+time
- [x] 4.2 แต่ละรายการ: title, room, organizer, status badge, date, time
- [x] 4.3 รองรับ empty state เมื่อไม่มีรายการ
- [x] 4.4 คลิก → `onSelect(booking)` prop + highlight selected

## 5. สร้าง CreateBookingDialog

- [x] 5.1 สร้าง `create-booking-dialog.tsx` — shadcn/ui `<Dialog>` สำหรับสร้าง/แก้ไขการจอง
- [x] 5.2 ฟอร์ม: title, room (dropdown), organizer, date, start/end time, participants, equipment checkboxes, notes
- [x] 5.3 Validate required fields, conflict check
- [x] 5.4 Submit → POST `/api/book-meeting` (หรือ PUT ถ้าแก้ไข), mutate SWR
- [x] 5.5 รองรับ `mode="edit"` — pre-fill ข้อมูลจาก booking เดิม

## 6. สร้าง BookingDetailSheet

- [x] 6.1 สร้าง `booking-detail-sheet.tsx` — shadcn/ui `<Sheet>` แสดงรายละเอียดการจอง
- [x] 6.2 Banner ส่วนหัว: status badge, title, date, time
- [x] 6.3 Sections: room info, organizer, participants, equipment, notes

## 7. เพิ่ม Statistics Cards

- [x] 7.1 เพิ่ม stat cards 4 ตัวบนสุดของหน้า: total rooms, available today, bookings today, bookings this week
- [x] 7.2 ใช้ component `StatCard` ที่มีอยู่แล้ว (หรือสร้างใหม่ถ้าไม่มี) — icon, value, label, trend, sub

## 8. ปรับปรุงหน้า Main Page

- [x] 8.1 แก้ไข `page.tsx` — ใช้ components ใหม่แทนของเดิม
- [x] 8.2 Rooms tab → SearchFilterBar + RoomCard grid
- [x] 8.3 Schedule tab → BookingCalendar + UpcomingBookings sidebar (grid 2 columns)
- [x] 8.4 My-bookings tab → UpcomingBookings (filtered by current user)
- [x] 8.5 Pending tab → UpcomingBookings (filtered by status=pending)
- [x] 8.6 History tab → UpcomingBookings (filtered by completed/cancelled)
- [x] 8.7 เชื่อมต่อ SWR data (`apiBookings`, `apiRooms`) เข้ากับ components ผ่าน props
- [x] 8.8 คง logic handleCreate, handleConfirm, handleCancel, handleEdit จากของเดิม
- [x] 8.9 ลบ components เก่า (RoomsTab, ScheduleTab, BookingsList, BookingModal) ที่ถูกแทนที่แล้ว

## 9. ปุ่มและสถานะห้อง

- [x] 9.1 เปลี่ยนชื่อปุ่ม "สร้างการจองใหม่" → "จองห้องประชุม"
- [x] 9.2 API rooms ตรวจสอบเฉพาะ status: "confirmed" — pending ไม่เปลี่ยนสถานะห้อง
- [x] 9.3 Schedule table แสดงเวลาเป็นช่วง "08:00 - 08:30"
- [x] 9.4 หัวข้อการจองจัดกึ่งกลางตลอดช่วงเวลา (gridColumn span)

## 10. ตรวจสอบและทดสอบ

- [x] 9.1 ตรวจสอบ compile errors ทุกไฟล์
- [x] 9.2 ทดสอบ tab rooms — กรอง, จอง
- [x] 9.3 ทดสอบ tab schedule — เลือกวัน, ดู booking, click booking
- [x] 9.4 ทดสอบ tab my-bookings / pending / history — แสดงถูกต้อง
- [x] 9.5 ทดสอบสร้าง booking — dialog → submit → mutate
- [x] 9.6 ทดสอบอนุมัติ/ยกเลิก booking
