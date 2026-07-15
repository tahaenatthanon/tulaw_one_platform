## Why

หลังจากฟีเจอร์ approval workflow ถูกรวมเข้าไปใน `fix-book-meeting-booking` แล้ว เมื่อผู้ใช้ทั่วไป (User role) จองห้องประชุม สถานะการจองจะเป็น "pending" (รออนุมัติ) แต่ผู้ใช้ไม่สามารถเห็นรายการจองของตัวเองในแท็บ "รออนุมัติ" ได้ เนื่องจากแท็บนี้ถูกซ่อนด้วย permission `BOOK_MEETING_APPROVE` ซึ่ง User role ไม่มี — ทำให้กดแท็บแล้วเห็นหน้าว่างเปล่า สร้างความสับสนว่าการจองสำเร็จหรือไม่

## What Changes

- แท็บ "รออนุมัติ" แสดงผลสำหรับ**ทุกผู้ใช้** (ไม่ gate ด้วย `canApprove` อีกต่อไป)
- สำหรับผู้ใช้ที่มี `BOOK_MEETING_APPROVE` (Admin/Dean): แสดงรายการ pending **ทั้งหมด** พร้อมปุ่มยืนยัน/ยกเลิก
- สำหรับผู้ใช้ที่ไม่มี `BOOK_MEETING_APPROVE` (User): แสดงเฉพาะรายการ pending **ของตัวเอง** โดย**ไม่มีปุ่มใดๆ** (ดูอย่างเดียว)
- เมื่อ Admin/Dean กดยืนยัน: อัปเดตทุก tab ทันที (รวมตารางเวลา) และส่งแจ้งเตือนกลับไปยังผู้จอง

## Capabilities

### Modified Capabilities
- `functional-core-modules`: เพิ่ม requirement ให้แท็บ "รออนุมัติ" แสดงผลกับทุกบทบาท โดยแยกตาม permission

## Impact

- `app/(dashboard)/book-meeting/page.tsx` — แก้ไข logic การแสดงผลแท็บ pending + ซ่อนปุ่มสำหรับ User
- `app/api/book-meeting/route.ts` — เพิ่ม notification เมื่ออนุมัติ booking
- `openspec/specs/functional-core-modules/spec.md` — เพิ่ม requirement scenario
