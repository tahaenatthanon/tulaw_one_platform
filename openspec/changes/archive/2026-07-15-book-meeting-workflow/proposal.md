## Why

หลังจากที่โมดูล Book Meeting ได้รับการแก้ไขให้ทำงานกับฐานข้อมูลจริงและมี workflow การอนุมัติแล้ว (`fix-book-meeting-booking`, `fix-pending-booking-approval-tab`) แต่ยังมีช่องโหว่ในส่วนของ **แท็บประวัติ** และความสมบูรณ์ของ **workflow แบบ end-to-end** — แท็บประวัติปัจจุบันแสดงรายการจองของผู้ใช้ทั้งหมดโดยไม่สนใจ role และไม่แสดงรายการจองที่ผ่านไปแล้วที่สถานะยังเป็น `confirmed` ทำให้ผู้ใช้ไม่สามารถดูประวัติการจองของตนเองได้ครบถ้วน และ workflow จาก "จอง → รออนุมัติ → อนุมัติ → ตารางเวลา → ประวัติ" ยังไม่สมบูรณ์

## What Changes

- **แท็บประวัติ แสดงประวัติตาม role**: User เห็นเฉพาะประวัติของตัวเอง, Admin/Dean เห็นประวัติทั้งหมด (ตาม data scope)
- **แท็บประวัติ รวมรายการจองที่ผ่านไปแล้ว**: นอกเหนือจาก `completed` และ `cancelled` แล้ว ยังแสดง `confirmed` ที่ `endTime` เลยเวลาปัจจุบันไปแล้ว
- **แท็บประวัติ ไม่มีปุ่มใดๆ (Read-Only)**: แท็บประวัติเป็น read-only — ไม่มีปุ่มยกเลิกหรือยืนยันสำหรับทุก role (รวม Admin)
- **ตารางเวลาแสดงเฉพาะ booking ที่อนุมัติแล้ว**: ScheduleTab แสดงเฉพาะ booking ที่มีสถานะ `confirmed` เท่านั้น — pending booking จะไม่ปรากฏในตารางจนกว่าจะได้รับการอนุมัติ
- **ระบบป้องกันการจองซ้ำซ้อน (Double Booking) แบบ real-time**: Client-side conflict detection แปลงเวลาเป็นนาทีก่อนเทียบ (แทนการเทียบ string ตรงๆ), เมื่อห้องถูกจองแล้วจะแจ้งเตือนทันทีและปุ่ม "จองห้อง" จะถูก disable, server-side มี conflict check ซ้ำอีกชั้น
- **แก้ไข bug ตารางเวลาเทียบเวลาไม่ตรง**: `ScheduleTab` เดิมเทียบ ISO datetime string (`"2026-07-15T02:00:00.000Z"`) ตรงๆ กับ time slot (`"08:00"`) ทำให้ไม่มีรายการใดแสดงในตารางเวลาเลย แก้โดยแปลง ISO → local time (`getHours()/getMinutes()`) และกรองเฉพาะวันที่เลือกก่อนเทียบ
- **แสดงรายการห้องประชุมแบบ Real-time**: API `/api/book-meeting/rooms` คำนวณสถานะห้อง 3 ระดับ (`available`, `booked`, `in-use`) โดยตรวจสอบทั้ง booking ที่กำลังใช้งานอยู่ (`startTime <= now < endTime`) และที่กำลังจะมาถึง (`startTime > now`) ครอบคลุมทั้ง `confirmed` และ `pending`, ฝั่ง client ใช้ SWR `refreshInterval: 30000` เพื่อ polling ทุก 30 วินาที
- **ยืนยัน end-to-end workflow**: การจอง → รออนุมัติ → Admin อนุมัติ → ตารางเวลาอัปเดตทันที → แสดงในตารางเวลาทุก role → เก็บในประวัติ

## Capabilities

### New Capabilities
- `book-meeting-history`: แท็บประวัติการจองพร้อม role-based data scoping และแสดงรายการที่ผ่านไปแล้ว

### Modified Capabilities
- `functional-core-modules`: ปรับปรุง requirement ของ Book Meeting ให้รวมการทำงานของแท็บประวัติและ end-to-end workflow ให้สมบูรณ์

## Impact

- `app/(dashboard)/book-meeting/page.tsx` — แก้ไข `BookingsList` component: History เป็น read-only (ไม่มีปุ่ม), กรองตาม role, รวม `confirmed` ที่เลยเวลาแล้ว
- `app/(dashboard)/book-meeting/page.tsx` — แก้ไข `ScheduleTab`: แสดงเฉพาะ `confirmed`, แปลง ISO → local time ก่อนเทียบ
- `app/(dashboard)/book-meeting/page.tsx` — แก้ไข `BookingModal.checkConflict`: แปลงเวลาเป็นนาที (`getHours()*60+getMinutes()`) ก่อนเทียบ แทนการเทียบ string ตรงๆ
- `app/api/book-meeting/rooms/route.ts` — แก้ไข query: ตรวจสอบทั้ง `confirmed` และ `pending`, แยก `in-use` (`startTime <= now`) กับ `booked` (`startTime > now`), คืนสถานะ 3 ระดับ
- `app/api/book-meeting/route.ts` — Server-side double-booking check ใน POST, PUT คืนค่า booking ที่อัปเดตแล้ว
- ไม่มีการเปลี่ยนแปลง DB schema
- ไม่มี dependency ใหม่
