## 1. Client — History Tab: Role-Based Filtering

- [x] 1.1 ปรับ logic การ filter ใน `BookingsList` เมื่อ `type === "history"`: ถ้า `!canApprove` (User/Viewer) → แสดงเฉพาะ `b.userId === currentUserId`, ถ้า `canApprove` (Admin/Dean/Dept Admin) → แสดงทั้งหมด
- [x] 1.2 สำหรับ User role ในแท็บประวัติ: ซ่อนปุ่มทั้งหมด (ไม่มีปุ่มยกเลิกหรือยืนยัน)

## 2. Client — History Tab: Include Past Confirmed Bookings

- [x] 2.1 แก้ไข filter condition ใน `BookingsList` สำหรับ `type === "history"`: เพิ่ม `b.status === "confirmed"` ที่ `b.endTime` เลยเวลาปัจจุบันไปแล้ว (`new Date(b.endTime) < new Date()`) ในรายการที่แสดง
- [x] 2.2 ตรวจสอบว่า `endTime` จาก API อยู่ในรูปแบบที่ `new Date()` parse ได้ถูกต้อง (ISO string จาก `b.endTime.toISOString()`)

## 3. Client — History Tab: Sorting & Status Labels

- [x] 3.1 เพิ่ม `.sort()` ใน filtered list ของแท็บประวัติ: เรียงจากวันที่ใหม่สุดไปเก่าสุด (`date` descending, then `startTime` descending)
- [x] 3.2 แสดง status badge (`BOOKING_STATUS`) สำหรับทุกรายการในแท็บประวัติ (เลียนแบบ pattern ใน `type === "history"` ที่มีอยู่แล้ว)

## 4. Client — History Tab: No Action Buttons (Read-Only)

- [x] 4.1 ลบ condition การแสดงปุ่มยกเลิกในแท็บประวัติ: เอา `(type === "history" && canApprove && booking.status === "confirmed")` ออกจากเงื่อนไขการแสดงปุ่ม
- [x] 4.2 ตรวจสอบว่าแท็บประวัติไม่มีปุ่มใดๆ สำหรับทุก role (รวม Admin)

## 5. Schedule — Fix Time Comparison Bug

- [x] 5.1 แก้ไข `ScheduleTab.getBooking()`: แปลง `b.startTime`/`b.endTime` จาก ISO datetime → local time (`getHours()`/`getMinutes()`) ก่อนเทียบกับ time slot (`"HH:mm"`)
- [x] 5.2 เพิ่ม `dayBookings` filter: กรองเฉพาะ bookings ที่ `b.date === selectedDateStr` (วันที่เลือกใน date picker)
- [x] 5.3 แก้ไข `ScheduleTab.getIsStart()`: ใช้ `getLocalTime(b.startTime) === slot` แทนการเทียบ ISO string ตรงๆ

## 6. Schedule — Show Only Confirmed Bookings

- [x] 6.1 เปลี่ยน `ScheduleTab.dayBookings` filter จาก `b.status !== "cancelled"` เป็น `b.status === "confirmed"` — แสดงเฉพาะ booking ที่อนุมัติแล้ว
- [x] 6.2 ตรวจสอบว่า `handleConfirm` เรียก `await mutateBookings()` หลัง PUT สำเร็จ — ทำให้ `ScheduleTab` รีเฟรชข้อมูลอัตโนมัติเมื่อมีคนกดอนุมัติ
- [x] 6.3 ตรวจสอบว่า API `GET /api/book-meeting` ส่ง `endTime` ในรูปแบบ ISO string (`b.endTime.toISOString()`) เพื่อให้ client parse ได้ถูกต้อง

## 7. Booking Modal — Fix Double-Booking Conflict Detection

- [x] 7.1 สร้าง helper `getLocalTimeFromString(timeStr)` → แปลง `"HH:mm"` เป็นนาที (`hours*60 + minutes`)
- [x] 7.2 สร้าง helper `getLocalTimeFromISO(iso)` → แปลง ISO datetime string เป็นนาที (`getHours()*60 + getMinutes()`)
- [x] 7.3 แก้ไข `checkConflict()`: ใช้ helper ทั้งสองแทนการเทียบ string ตรงๆ (`b.startTime < et` → `getLocalTimeFromISO(b.startTime) < etMin`)
- [x] 7.4 ตรวจสอบว่า server-side `POST /api/book-meeting` มี conflict check ด้วย `prisma.roomBooking.findFirst()` — double-booking prevention มี 2 ชั้น

## 8. Rooms API — Real-Time 3-Level Status

- [x] 8.1 แก้ไข `GET /api/book-meeting/rooms`: query bookings ที่ `status: { in: ["confirmed", "pending"] }` และ `endTime > now` (ยังไม่สิ้นสุด)
- [x] 8.2 แยกสถานะ: `startTime <= now` → `"in-use"`, `startTime > now` → `"booked"`, ไม่มี booking → `"available"`
- [x] 8.3 เพิ่ม `{ refreshInterval: 30000 }` ใน `useSWR("/api/book-meeting/rooms", ...)` เพื่อ polling ทุก 30 วินาที
- [x] 8.4 ตรวจสอบว่า `RoomsTab` ใช้ `STATUS_MAP` แสดงผล 3 สี (เขียว/แดง/เหลือง) ตรงตามสถานะที่ API คืน

## 9. Verification — End-to-End Workflow

- [x] 9.1 ทดสอบ: User จองห้อง → ปรากฏใน "การจองของฉัน" เป็น "รออนุมัติ" และปรากฏใน "รออนุมัติ" (เห็นของตัวเอง ไม่มีปุ่ม)
- [x] 9.2 ทดสอบ: Admin เห็นรายการ pending ใน "รออนุมัติ" และกด "ยืนยัน" → สถานะเปลี่ยนเป็น "confirmed" → ปรากฏใน "ตารางเวลา" ทุก role ทันทีโดยไม่ต้อง reload หน้า
- [x] 9.3 ทดสอบ: Pending booking ไม่ปรากฏในตารางเวลาจนกว่าจะได้รับการอนุมัติ
- [x] 9.4 ทดสอบ: หลังจาก booking เลยเวลา → ปรากฏในแท็บ "ประวัติ" (User เห็นของตัวเอง, Admin เห็นทั้งหมด) โดยไม่มีปุ่มใดๆ
- [x] 9.5 ทดสอบ: แท็บประวัติไม่มีปุ่มยกเลิกหรือยืนยันสำหรับทุก role (Admin ก็ไม่มี)
- [x] 9.6 ทดสอบ: User เห็นประวัติของตัวเองเท่านั้น (ไม่เห็นประวัติของคนอื่น)
- [x] 9.7 ทดสอบ: แท็บประวัติเรียงจากวันที่ใหม่สุดไปเก่าสุด
- [x] 9.8 ทดสอบ: ตารางเวลารีเฟรชทันทีเมื่อ Admin อนุมัติ booking — ไม่ต้อง reload หน้า
- [x] 9.9 ทดสอบ: จองห้องซ้ำซ้อน (ห้องเดิม วันเดิม เวลาทับซ้อน) → แจ้งเตือน "ช่วงเวลานี้มีผู้จองแล้ว" + ปุ่ม "จองห้อง" ถูก disable
- [x] 9.10 ทดสอบ: เปลี่ยนวัน/เวลา/ห้อง ใน booking form → conflict check รันใหม่ทุกครั้งที่เปลี่ยน (real-time validation)
- [x] 9.11 ทดสอบ: RoomsTab แสดงสถานะห้อง 3 ระดับ: "ว่าง" (เขียว), "กำลังใช้งาน" (เหลือง), "ถูกจองแล้ว" (แดง) — อัปเดตอัตโนมัติทุก 30 วิ
