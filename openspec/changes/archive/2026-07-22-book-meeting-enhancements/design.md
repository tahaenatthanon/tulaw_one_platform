## Context

ระบบจองห้องประชุมปัจจุบันมี API และ UI พื้นฐานครบ — GET/POST/PUT/DELETE, ตารางเวลา, รายการห้อง, upcoming bookings, pending, history, create/edit dialogs, booking detail sheet แต่ยังขาดฟีเจอร์สำคัญหลายอย่างตามที่ระบุใน proposal

## Goals / Non-Goals

**Goals:**
- Schedule ตารางเวลา: ขยาย time slots จาก 16:30 → 18:00 (17:00, 17:30, 18:00)
- My Bookings: เพิ่มปุ่ม edit/cancel พร้อม optimistic update
- Pending: แยกตามสิทธิ์ (user เห็นของตัวเอง, approver เห็นทั้งหมด), แสดงชื่อผู้จอง
- Form: ลบ organizer input, auto-fill จาก session user
- History: เก็บ status change log เมื่อ approve/reject
- Audit: สร้าง audit log ทุก action (create/edit/cancel/approve/reject)
- Notification: ส่งเมื่อ reject (ของเดิมมีเฉพาะ approve)

**Non-Goals:**
- ไม่เปลี่ยน BookingDetailSheet structure
- ไม่เพิ่ม model ใหม่ใน DB — ใช้ JSON field ใน RoomBooking หรือ add BookingHistory ถ้าจำเป็น
- ไม่เปลี่ยน RoomCard, StatCard, ScheduleTable layout หลัก

## Decisions

### 1. Schedule Time Slots — แค่เพิ่มใน constants

**เลือก:** เพิ่ม `TIME_SLOTS` array ใน `schedule-table.tsx` ให้เป็น `["08:00",...,"17:00","17:30"]` และจบที่ 18:00
**เหตุผล:** ง่ายที่สุด ไม่ต้องเปลี่ยน logic ใดๆ — แค่เพิ่ม string ใน array

### 2. Edit/Cancel ใน My Bookings — จัดการใน upcoming-bookings.tsx

**เลือก:** เพิ่ม prop และ rendering logic ใน `UpcomingBookings` component เมื่อ `type === "my-bookings"`
- ปุ่ม "แก้ไข" → เรียก `onEdit(b)` callback → page.tsx เปิด CreateBookingDialog ใน mode edit
- ปุ่ม "ยกเลิก" → เรียก `onCancel(b.id)` → PUT status: "cancelled" + optimistic update

**เหตุผล:** Reuse component เดิม ไม่ต้องสร้าง component ใหม่

### 3. Pending Scope — ใช้ permission check ใน upstream booking filter

**เลือก:**
- API `/api/book-meeting` GET ต้อง include `pending` status ด้วย (ปัจจุบัน exclude cancelled เท่านั้น — เปลี่ยนให้ include pending)
- Frontend: ถ้า `canApprove` → show all pending; ถ้าไม่ใช่ → filter by `currentUserId`

**เหตุผล:** แนวทางปัจจุบันกรอง pending ด้วย `filterByUser` อยู่แล้ว — แค่เปลี่ยน logic ตรง condition

### 4. Organizer Auto-Fill — ใช้ session user name

**เลือก:**
- ลบ `organizer` field จาก form UI
- ใช้ `session.user.firstNameTh + " " + session.user.lastNameTh` แสดงเป็น organizer
- API POST ใช้ `session.user.id` เป็น `userId` อยู่แล้ว — ไม่ต้องเปลี่ยน API

**เหตุผล:** API เก็บ userId อยู่แล้วใน RoomBooking — frontend แค่ต้อง join user data ตอน display

### 5. Booking History — JSON field ใน RoomBooking

**เลือก:** เพิ่ม `statusLog Json?` ใน `RoomBooking` model แทนการสร้าง table ใหม่
- Append-only: `[{ action: "approved", prevStatus: "pending", newStatus: "confirmed", performedBy: "uuid", performedAt: "ISO" }]`
- อ่านง่าย: 1 query ก็ได้ history เลย

**Alternatives considered:**
- BookingHistory table แยก — overkill สำหรับ use case นี้, join เพิ่ม overhead
- AuditLog reuse — AuditLog ออกแบบสำหรับ security/immutable ไม่เหมาะกับการแสดงผลใน UI

### 6. Audit Log — ใช้ `createAuditLog` จาก `lib/audit-log.ts`

**เลือก:** Call `createAuditLog()` ในทุก API action (POST, PUT approve, PUT cancel, PUT edit)
- Module: "BOOK_MEETING"
- Actions: CREATE, UPDATE, CANCEL, APPROVE, REJECT

**เหตุผล:** `lib/audit-log.ts` มี utility function ครบอยู่แล้ว — แค่เรียกใช้

### 7. Notification — extend existing pattern

**เลือก:** ใน PUT route (approve mode) เพิ่ม notification สำหรับ reject (cancelled) ด้วย
- Already มี notification สำหรับ confirmed → เพิ่มเงื่อนไข `status === "cancelled"` ด้วย

**เหตุผล:** โครงสร้าง notification มีอยู่แล้ว — แค่ copy pattern และเปลี่ยนข้อความ

## Risks / Trade-offs

- **[Risk] `statusLog` JSON field อาจใหญ่มากถ้ามีการเปลี่ยนสถานะบ่อย** → Mitigation: เก็บเฉพาะ approve/reject/cancel actions ไม่เก็บ edit
- **[Risk] Optimistic cancel อาจทำให้ UI flicker ถ้า API ล้มเหลว** → Mitigation: SWR revalidate จะ undo ให้อัตโนมัติ
