## Why

โมดูลจองห้องประชุมมี 4 ปัญหาที่กระทบ UX และความถูกต้องของข้อมูล: (1) แท็บประวัติแสดงข้อมูลเกิน scope — ผู้ใช้ระดับ User เห็นประวัติของคนอื่นทั้งที่ spec ระบุว่าให้เห็นเฉพาะของตนเอง, (2) เมื่อ user คนเดิมจองห้องใหม่ booking จะไม่ปรากฏในแท็บ "รออนุมัติ" สำหรับ approver, (3) ข้อผิดพลาดเวลาซ้ำซ้อนแสดงแค่ console ไม่แสดง inline ใน dialog ทำให้ผู้ใช้ไม่รู้ว่าจองไม่สำเร็จ, (4) แท็บประวัติแสดงเป็น list view ทำให้อ่านยาก — ควรแสดงเป็นตารางเพื่อให้เห็นข้อมูลสำคัญครบใน glance เดียว

## What Changes

- **แก้ไข scope แท็บประวัติ (History)**: กรองข้อมูลตาม role — User เห็นเฉพาะของตนเอง, Admin ขึ้นไปเห็นทั้งหมด (ตาม spec `book-meeting-history` ที่มีอยู่แล้ว)
- **แก้ไขการแสดงผลแท็บรออนุมัติ (Pending)**: เมื่อ user จองห้องใหม่ด้วย status `pending` จะต้องปรากฏในแท็บ "รออนุมัติ" ทันทีสำหรับ approver (หลัง `mutateBookings()` revalidate)
- **แสดงข้อผิดพลาดเวลาซ้ำซ้อนใน Dialog**: ข้อความ conflict เช่น "ช่วงเวลานี้มีผู้จองแล้ว" แสดงเป็น inline error ภายใน create/edit dialog โดยไม่ต้องปิด dialog
- **เปลี่ยนแท็บประวัติเป็นมุมมองตาราง (Table View)**: แทนที่ list view เดิมด้วยตารางที่มีคอลัมน์: วัน/เวลา (timestamp), หัวข้อ, ห้อง, จำนวนคน, รายละเอียด, ช่วงเวลา, ผู้จอง — เรียงตามวันเวลาล่าสุดขึ้นก่อน

## Capabilities

### New Capabilities
<!-- No new capabilities — all changes are fixes to existing behavior -->

### Modified Capabilities
- `book-meeting-history`: แก้ไขการกรองข้อมูลในแท็บประวัติ — เพิ่มการ scope ตาม userId สำหรับบทบาท User (level 30) และเปลี่ยนการแสดงผลเป็นตาราง (Table View)
- `book-meeting-ui-components`: แก้ไขการแสดงผลแท็บรออนุมัติให้ refresh ทันทีหลังสร้าง booking ใหม่ และเพิ่ม inline conflict error ใน Create/Edit dialog

## Impact

| พื้นที่ | ไฟล์ที่ได้รับผลกระทบ |
|---|---|
| Client | `app/(dashboard)/book-meeting/page.tsx` — flow handleCreate/handleUpdate |
| Client | `app/(dashboard)/book-meeting/upcoming-bookings.tsx` — history filter scoping + แยก HistoryTable component |
| Client | `app/(dashboard)/book-meeting/create-booking-dialog.tsx` — inline conflict + error display |
| API | `app/api/book-meeting/route.ts` — GET อาจต้องเพิ่ม scope filtering สำหรับ non-admin |
