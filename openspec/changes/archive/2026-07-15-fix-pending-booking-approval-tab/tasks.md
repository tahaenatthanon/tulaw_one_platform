## 1. Client — BookingsList เพิ่ม filterByUser prop

- [x] 1.1 เพิ่ม optional prop `filterByUser?: string` ใน `BookingsList` component
- [x] 1.2 ปรับ logic การ filter ใน `BookingsList` เมื่อ type เป็น `"pending"` ให้กรองเพิ่มด้วย `filterByUser` ถ้ามีค่า (กรอง `b.userId === filterByUser`)

## 2. Client — แก้ไขการแสดงผลแท็บ "รออนุมัติ"

- [x] 2.1 ลบ `canApprove` condition ที่ gate การ render `BookingsList` ในแท็บ pending (เหลือแค่ `activeTab === "pending"`)
- [x] 2.2 ส่ง `filterByUser={!canApprove ? currentUserId : undefined}` ไปยัง `BookingsList` เพื่อให้ผู้ใช้ทั่วไปเห็นเฉพาะของตัวเอง

## 3. Client — ซ่อนปุ่มทั้งหมดสำหรับผู้ใช้ทั่วไปในแท็บ pending

- [x] 3.1 ปรับ condition การแสดงปุ่มใน `BookingsList`: เมื่อ `type === "pending"` และ `!canApprove` → ไม่แสดงปุ่มใดๆ (ซ่อนทั้งยืนยันและยกเลิก)

## 4. API — ส่งแจ้งเตือนเมื่ออนุมัติ booking

- [x] 4.1 ใน `PUT /api/book-meeting` เมื่อ `status === "confirmed"` → หา `userId` และ `title` ของ booking
- [x] 4.2 สร้าง `Notification` + `NotificationRead` ตาม pattern เดียวกับ `announcements` route

## 5. Verification

- [x] 5.1 ทดสอบ: ผู้ใช้ทั่วไป (User role) จองห้อง → ไปที่แท็บ "รออนุมัติ" → เห็นรายการของตัวเอง แต่ไม่มีปุ่มใดๆ
- [x] 5.2 ทดสอบ: Admin/Dean ไปที่แท็บ "รออนุมัติ" → เห็น pending bookings ทั้งหมด และมีปุ่ม "ยืนยัน" และ "ยกเลิก"
- [x] 5.3 ทดสอบ: Admin กดยืนยัน → booking เปลี่ยนเป็น confirmed, หายจากแท็บรออนุมัติ, ไปปรากฏใน my-bookings เป็น confirmed, และอัปเดตในตารางเวลา
- [x] 5.4 ทดสอบ: หลังจาก Admin อนุมัติ → ผู้จองได้รับ notification แจ้งเตือน
