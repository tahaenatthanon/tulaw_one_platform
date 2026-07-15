## Why

หลังจาก book-meeting-workflow ถูก implement เสร็จแล้ว พบปัญหา 5 ข้อ:
1. **สถานะไม่เปลี่ยนใน UI เมื่อ Admin กดอนุมัติ** — `PUT /api/book-meeting` สำเร็จ (200) และ DB ถูกอัปเดตแล้ว แต่ UI ไม่แสดงผล status ใหม่ เนื่องจาก `mutateBookings()` ไม่ force revalidate ทำให้ SWR ใช้ cache เก่า
2. **ผู้ใช้ไม่สามารถแก้ไขข้อมูลการจองของตัวเองได้** — PUT endpoint รองรับเฉพาะ `{ id, status }` และต้องการ `BOOK_MEETING_APPROVE` permission เท่านั้น ไม่มี mechanism ให้ User แก้ไข title, วันที่, เวลา, หรือรายละเอียดอื่นๆ ของ booking ที่ตัวเองสร้าง
3. **สถานะห้อง (ว่าง/ไม่ว่าง) ไม่อัปเดตแบบ real-time** — SWR polling ตั้งไว้ที่ 30 วินาทีซึ่งนานเกินไปสำหรับการแสดงสถานะห้องแบบ real-time ทำให้ผู้ใช้เห็นข้อมูลเก่าเมื่อมีการจองหรือยกเลิก
4. **ประวัติแสดงรายการยกเลิกที่ไม่ควรเก็บ** — แท็บประวัติแสดง `cancelled` bookings ซึ่งไม่ใช่ประวัติการใช้งานจริง ควรแสดงเฉพาะ booking ที่ได้รับการอนุมัติแล้วเท่านั้น
5. **ไม่มีปุ่มยืนยันก่อนยกเลิก** — การยกเลิก booking ทำทันทีโดยไม่มีการยืนยัน ทำให้ผู้ใช้อาจเผลอกดยกเลิกโดยไม่ตั้งใจ

## What Changes

- **แก้ไข SWR mutation ให้ force revalidate หลัง PUT**: ใช้ `mutateBookings()` + `mutateRooms()` แบบ explicit revalidate แทนการใช้ default behavior ที่อาจใช้ cache
- **เพิ่ม optimistic update กลับมา**: UI เปลี่ยน status ทันทีโดยไม่ต้องรอ server response — เมื่อ revalidation เสร็จข้อมูลจะตรงกัน
- **PUT endpoint รองรับการแก้ไขข้อมูล booking**: แก้ไข PUT `/api/book-meeting` ให้รับ field อื่นนอกเหนือจาก `status` (เช่น `title`, `startTime`, `endTime`, `attendeeCount`, `purpose`) พร้อม permission `BOOK_MEETING_EDIT` และ ownership check (แก้ได้เฉพาะของตัวเอง ยกเว้น Admin)
- **เพิ่ม Edit Modal ใน UI**: ปุ่มแก้ไขในแท็บ "การจองของฉัน" สำหรับ booking ที่ยังเป็น `pending` หรือ `confirmed` (ยังไม่ผ่านไป)
- **ย้ายปุ่มยืนยันออกจากแท็บ "การจองของฉัน"**: ปุ่ม "ยืนยัน" แสดงเฉพาะในแท็บ "รออนุมัติ" เท่านั้น — แท็บ "การจองของฉัน" มีเฉพาะปุ่มแก้ไขและยกเลิก
- **ลด SWR polling interval สำหรับ rooms**: จาก 30 วินาที → 10 วินาที เพื่อให้สถานะห้อง (ว่าง/กำลังใช้งาน/ถูกจองแล้ว) อัปเดตใกล้ real-time มากขึ้น
- **ประวัติแสดงเฉพาะ booking ที่อนุมัติแล้ว**: แท็บประวัติกรองเฉพาะ `confirmed` (ที่เลยเวลาแล้ว) และ `completed` — ไม่แสดงรายการ `cancelled`
- **เพิ่ม ConfirmDialog ก่อนยกเลิก**: `ConfirmDialog` (danger variant) แสดงข้อความ "คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?" พร้อมปุ่ม "ยกเลิกการจอง" และ "ยกเลิก" (ปิด dialog)

## Capabilities

### Modified Capabilities
- `functional-core-modules`: ปรับปรุง Book Meeting requirement ให้รวมการแก้ไข booking และการยืนยันว่าสถานะเปลี่ยนใน UI ทันที

## Impact

- `app/(dashboard)/book-meeting/page.tsx` — `handleConfirm`: เพิ่ม optimistic update + force revalidate
- `app/(dashboard)/book-meeting/page.tsx` — เพิ่ม `EditBookingModal` component และปุ่มแก้ไขใน `BookingsList` สำหรับ my-bookings tab
- `app/(dashboard)/book-meeting/page.tsx` — ลด `refreshInterval` ใน `useSWR("/api/book-meeting/rooms")` จาก 30000 → 10000
- `app/(dashboard)/book-meeting/page.tsx` — ปรับ history filter: เอา `cancelled` ออกจากผลลัพธ์, แสดงเฉพาะ `confirmed` (past) + `completed`
- `app/(dashboard)/book-meeting/page.tsx` — เพิ่ม `ConfirmDialog` ก่อนยกเลิก: `cancelTargetId` state + `handleRequestCancel` + `handleCancelConfirm`
- `app/api/book-meeting/route.ts` — แก้ไข `PUT` handler: รองรับ field อื่นๆ, แยก permission ระหว่าง approve (`BOOK_MEETING_APPROVE`) กับ edit (`BOOK_MEETING_EDIT`), เพิ่ม ownership check
- ไม่มีการเปลี่ยนแปลง DB schema
- ไม่มี dependency ใหม่
