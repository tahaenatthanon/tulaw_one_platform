## Context

Book Meeting module ถูก implement เสร็จแล้วผ่าน 3 changes (`fix-book-meeting-booking`, `fix-pending-booking-approval-tab`, `book-meeting-workflow`) แต่ยังมีปัญหา 2 ข้อที่กระทบ UX โดยตรง:

1. **PUT handler** `/api/book-meeting` รองรับเฉพาะ `{ id, status }` ด้วย `BOOK_MEETING_APPROVE` — ไม่มีวิธีแก้ไขข้อมูล booking
2. **`mutateBookings()` ไม่ force revalidate เสมอ** — SWR อาจใช้ cache เดิมหลัง PUT สำเร็จ ทำให้ UI ไม่แสดง status ใหม่

## Goals / Non-Goals

**Goals:**
- Admin กดอนุมัติ → status เปลี่ยนใน UI ทันที (optimistic update + force revalidate)
- User แก้ไขข้อมูลการจองของตัวเองได้ (title, วันที่, เวลา, จำนวนคน, หมายเหตุ)
- PUT endpoint รองรับทั้ง approve (status change) และ edit (field update) โดย permission/ownership ต่างกัน
- Edit modal ใช้ `BookingModal` เดิมในโหมดแก้ไข (pre-fill ข้อมูล)

**Non-Goals:**
- ไม่เพิ่ม delete ถาวร (soft delete ใช้ status=cancelled อยู่แล้ว)
- ไม่แก้ไข UI layout หรือ style
- ไม่เพิ่ม pagination ใน API

## Decisions

### D1: PUT endpoint แยก 2 โหมด — approve vs edit

**ตัดสินใจ:** PUT `/api/book-meeting` ตรวจสอบ body:
- ถ้ามีเฉพาะ `{ id, status }` → `BOOK_MEETING_APPROVE` (เหมือนเดิม)
- ถ้ามี field อื่นๆ (`title`, `startTime`, `endTime` ฯลฯ) → `BOOK_MEETING_EDIT` + ownership check (แก้ได้เฉพาะของตัวเอง)
- ถ้าเป็น Admin (`minRoleLevel >= 50`) → แก้ของใครก็ได้

**เหตุผล:**
- แยก concern ชัดเจน: อนุมัติ = privilege, แก้ไข = ownership
- ไม่ต้องสร้าง endpoint ใหม่
- RBAC `BOOK_MEETING_EDIT` มีอยู่แล้วใน `ROLE_PERMISSIONS` (Super Admin, System Admin, Dean, Dept Admin)
- User role ไม่มี `BOOK_MEETING_EDIT` — แต่ควรแก้ของตัวเองได้ → ใช้ ownership check แทน permission

**ทางเลือกที่พิจารณา:**
- ❌ สร้าง `PATCH /api/book-meeting` → เพิ่ม endpoint โดยไม่จำเป็น
- ❌ ใช้ `BOOK_MEETING_EDIT` สำหรับทุกคน → User role ไม่มี permission นี้ตาม RBAC

### D2: Ownership model สำหรับ edit

**ตัดสินใจ:** ทุกคนที่ล็อกอินแก้ไข booking ของตัวเองได้ (ไม่ต้องมี `BOOK_MEETING_EDIT` permission) — เฉพาะ User/Viewer ต้องเป็นเจ้าของ booking

```
Level >= 50 (Dept Admin+): edit booking ของใครก็ได้
Level < 50  (User/Viewer): edit เฉพาะ booking ของตัวเอง (userId === session.user.id)
```

**เหตุผล:**
- User ควรแก้ไขการจองที่ตัวเองสร้างได้
- RBAC `BOOK_MEETING_EDIT` สงวนไว้สำหรับ Admin ที่จะแก้ของคนอื่น
- ถ้า User แก้ไข booking → status ควรกลับเป็น `"pending"` เพื่อให้ Admin อนุมัติใหม่ (ถ้าเปลี่ยนวัน/เวลา/ห้อง)

### D3: Edit เปลี่ยนเวลา → status กลับเป็น pending

**ตัดสินใจ:** เมื่อ User แก้ไข `startTime`, `endTime`, `roomId` หรือ `date` → status เปลี่ยนเป็น `"pending"` โดยอัตโนมัติ (ต้องรอ Admin อนุมัติใหม่) ส่วน field อื่น (`title`, `attendeeCount`, `purpose`) แก้ไขได้โดยไม่เปลี่ยน status

**เหตุผล:**
- เปลี่ยนวันเวลา = ข้อมูลสำคัญที่ต้องตรวจสอบใหม่
- ป้องกัน conflict กับ booking อื่น
- สอดคล้องกับ workflow: แก้ไขสำคัญ → ต้องขออนุมัติใหม่

### D4: Optimistic update + force revalidate ใน handleConfirm

**ตัดสินใจ:** ใช้ pattern 3 ขั้น:
1. Optimistic: `mutateBookings(data => data.map(b => b.id===id ? {...b, status:"confirmed"} : b), { revalidate: false })`
2. PUT request
3. Force revalidate: `mutateBookings()` — SWR จะ fetch `/api/book-meeting` ใหม่จาก server

**เหตุผล:**
- Optimistic: UI เปลี่ยนทันที (instant feedback)
- Force revalidate: ดึงข้อมูลจริงจาก DB ยืนยันว่าตรงกัน
- Pattern นี้เคยใช้แล้วได้ผลดีใน session ก่อนหน้า

### D5: Edit Modal — reuse BookingModal เป็น EditMode

**ตัดสินใจ:** เพิ่ม `mode` prop ใน `BookingModal`:
- `mode="create"` (default) — ฟอร์มเปล่า, POST
- `mode="edit"` — pre-fill ข้อมูลจาก booking ที่มีอยู่, PUT (แก้ไข field) + POST ถ้าเปลี่ยนวันเวลา

เรียกใช้จาก `BookingsList` ในแท็บ `my-bookings` — เพิ่มปุ่ม "แก้ไข" สำหรับ booking ที่ `status !== "cancelled"`

### D7: ย้ายปุ่มยืนยันออกจากแท็บ "การจองของฉัน" — แสดงเฉพาะใน "รออนุมัติ"

**ตัดสินใจ:** ปุ่ม "ยืนยัน" แสดงเฉพาะในแท็บ "รออนุมัติ" (`type === "pending"`) — ไม่แสดงในแท็บ "การจองของฉัน" แม้ผู้ใช้จะมี `BOOK_MEETING_APPROVE` ก็ตาม

**เหตุผล:**
- "รออนุมัติ" คือหน้าจัดการอนุมัติ — Admin/Dean ควรทำงานจากที่นี่
- "การจองของฉัน" คือหน้าจัดการส่วนตัว — มีเฉพาะแก้ไขและยกเลิก
- ลดความสับสน: Admin ไม่ควรสับสนว่า tab ไหนใช้ทำอะไร

## Risks / Trade-offs

- **[Risk] Edit แล้ว status กลับเป็น pending → booking อาจหายจาก ScheduleTab** → **Mitigation:** ทำให้ workflow ชัดเจนตั้งแต่แรก, user เห็น booking ใน pending tab
- **[Risk] PUT handler ซับซ้อนขึ้น (approve vs edit logic)** → **Mitigation:** แยกเป็น early return ตาม type of request
- **[Trade-off] BookingModal ใน edit mode ต้องจัดการ startTime/endTime format ต่างจาก create** → **Mitigation:** ใช้ `getLocalTime()` convert กลับเป็น `"HH:mm"` format สำหรับ pre-fill

### D6: ลด SWR polling interval สำหรับ rooms status

**ตัดสินใจ:** ลด `refreshInterval` ใน `useSWR("/api/book-meeting/rooms")` จาก 30,000ms → 10,000ms (10 วินาที) เพื่อให้สถานะห้องอัปเดตใกล้ real-time มากขึ้น

**เหตุผล:**
- 30 วินาทีนานเกินไป — ผู้ใช้เห็นข้อมูลเก่าเมื่อมีการจอง/อนุมัติ/ยกเลิก ถ้าไม่ใช่คนที่ทำการกระทำนั้นเอง
- 10 วินาทีให้ความสมดุลระหว่าง real-time experience และ server load
- `mutateRooms()` ถูกเรียกหลังทุก mutation (create/confirm/cancel/edit) — รับประกันอัปเดตทันทีสำหรับผู้ที่ทำการกระทำ
- Polling 10 วิช่วยให้ผู้ใช้**คนอื่น**เห็นสถานะเปลี่ยนอัตโนมัติ (เช่น booking เปลี่ยนจาก booked → in-use เมื่อ startTime ถึง, หรือการจองของคนอื่นปรากฏเป็น booked)

**ทางเลือกที่พิจารณา:**
- ❌ 5 วินาที → อาจกดดัน server มากเกินไปสำหรับข้อมูลที่ไม่เปลี่ยนบ่อย
- ❌ WebSocket/SSE → over-engineered สำหรับ use case นี้

### D8: ประวัติแสดงเฉพาะ booking ที่ได้รับการอนุมัติ — ไม่รวม cancelled

**ตัดสินใจ:** แท็บประวัติกรองเฉพาะ `confirmed` (ที่ `endTime < now`) และ `completed` — booking ที่ถูกยกเลิก (`cancelled`) จะไม่ปรากฏในประวัติ

**เหตุผล:**
- ประวัติควรแสดงเฉพาะการใช้งานที่เกิดขึ้นจริง — booking ที่ถูกยกเลิกไม่เคยใช้งานจริง
- ลด noise ในแท็บประวัติ
- ผู้ใช้สามารถดู booking ที่ถูกยกเลิกได้จาก API โดยตรงหากจำเป็น

### D9: ConfirmDialog ก่อนยกเลิก booking

**ตัดสินใจ:** เพิ่ม `ConfirmDialog` จาก `@/components/ui/confirm-dialog` พร้อม `variant="danger"` — ผู้ใช้ต้องกดยืนยันอีกครั้งก่อนยกเลิก booking

**เหตุผล:**
- ป้องกันการยกเลิกโดยไม่ตั้งใจ (misclick)
- `ConfirmDialog` มีอยู่แล้วใน project — reuse component
- Danger variant (ปุ่มสีแดง) สื่อถึงความสำคัญของการกระทำ
- Flow: `handleRequestCancel(id)` → set `cancelTargetId` → ConfirmDialog เปิด → ยืนยัน → `handleCancelConfirm()` → `handleCancel(id)` → API call
