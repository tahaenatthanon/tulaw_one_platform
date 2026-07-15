## Context

โมดูล Book Meeting ได้รับการแก้ไขให้ทำงานกับฐานข้อมูลจริงผ่าน `fix-book-meeting-booking` และ `fix-pending-booking-approval-tab` ทำให้มี 5 tabs: รายการห้อง, ตารางเวลา, การจองของฉัน, รออนุมัติ, ประวัติ โดย 4 tabs แรกทำงานได้ถูกต้องตาม workflow แล้ว แต่**แท็บประวัติ**ยังมีปัญหา 2 ข้อ:
1. ไม่กรองตาม role (User เห็นประวัติของทุกคน)
2. ไม่แสดงรายการ `confirmed` ที่เลยเวลาไปแล้ว (แสดงเฉพาะ `completed` กับ `cancelled`)

โครงสร้างปัจจุบัน:
- `app/(dashboard)/book-meeting/page.tsx` — หน้า Client Component พร้อม 5 tabs
- `app/api/book-meeting/route.ts` — CRUD API (GET/POST/PUT/DELETE)
- `app/api/book-meeting/rooms/route.ts` — API ดึงข้อมูลห้อง
- `prisma/schema.prisma` — `MeetingRoom` และ `RoomBooking` models

## Goals / Non-Goals

**Goals:**
- แท็บประวัติแสดงผลตาม role: User เห็นเฉพาะของตัวเอง, Admin/Dean เห็นทั้งหมด
- แท็บประวัติรวมรายการ `confirmed` ที่เลยเวลาไปแล้ว (`endTime < now`)
- Admin/Dean สามารถยกเลิกรายการ `confirmed` จากแท็บประวัติได้
- ยืนยันว่าทุก tab อัปเดตพร้อมกันเมื่อมีการเปลี่ยนแปลงสถานะ

**Non-Goals:**
- ไม่เพิ่ม `location` field ใน `MeetingRoom` (ทำแยกอีก change)
- ไม่เพิ่ม mechanism อัตโนมัติเปลี่ยนสถานะเป็น `completed` (ใช้การ filter ฝั่ง client แทน)
- ไม่เพิ่ม pagination ในแท็บประวัติ (ใช้ filter + sort ที่มีอยู่แล้ว)
- ไม่แก้ไข UI layout หรือ style

## Decisions

### D1: ประวัติรวม `confirmed` ที่เลยเวลาแล้ว แทนที่จะเพิ่ม status `completed`

**ตัดสินใจ:** แท็บประวัติแสดง `confirmed` (ที่ `endTime < now`) + `completed` + `cancelled`

**เหตุผล:**
- ไม่ต้องเพิ่ม cron job หรือ background task เพื่อเปลี่ยนสถานะอัตโนมัติ
- ไม่ต้องแก้ไข Prisma schema (เพิ่ม enum `completed` ใน status)
- ใช้ logic ฝั่ง client/frontend ที่มีอยู่แล้ว (`BookingsList` component)
- API GET `/api/book-meeting` ส่ง `endTime` มาอยู่แล้ว — ใช้ filter ฝั่ง client ได้ทันที

**ทางเลือกที่พิจารณา:**
- ❌ สร้าง status `completed` และ cron job → ซับซ้อนเกินความจำเป็น, เพิ่ม maintenance burden
- ❌ ให้ API ส่ง query param `includePast=true` → เพิ่ม backend logic โดยไม่จำเป็น

### D2: Role-based filtering ใน History tab ใช้ client-side filter

**ตัดสินใจ:** ใช้ `currentUserId` และ `canApprove` ที่มีอยู่แล้วใน `BookingsList` component ในการกรองประวัติ — ถ้า `!canApprove` ให้แสดงเฉพาะ `b.userId === currentUserId`

**เหตุผล:**
- `BookingsList` component รับ `currentUserId` และ `canApprove` อยู่แล้ว
- ไม่ต้องเพิ่ม API endpoint ใหม่
- สอดคล้องกับ pattern ที่ใช้ใน `my-bookings` และ `pending` tabs

**ทางเลือกที่พิจารณา:**
- ❌ เพิ่ม `scope` query param ใน API → API มี `BOOK_MEETING_VIEW` guard อยู่แล้วซึ่งอนุญาตทุก role; การกรองควรเป็น client concern

### D3: แท็บประวัติเป็น Read-Only — ไม่มีปุ่มใดๆ

**ตัดสินใจ (อัปเดต):** แท็บประวัติไม่มีปุ่มใดๆ ทั้งสิ้น — ไม่มีปุ่มยกเลิกหรือยืนยันสำหรับทุก role (รวม Admin) ดูอย่างเดียว

**เหตุผล:**
- ประวัติควรเป็นบันทึกข้อมูลที่ผ่านไปแล้ว ไม่ควรให้ใครมาแก้ไขหรือยกเลิก
- ลดความซับซ้อนของ UI และป้องกันการดำเนินการที่ผิดพลาด
- การยกเลิก booking ควรทำจาก tab "การจองของฉัน" หรือ "รออนุมัติ" เท่านั้น

### D4: แท็บประวัติเรียงตามวันที่ (ล่าสุดก่อน)

**ตัดสินใจ:** เรียงรายการในแท็บประวัติจากวันที่ใหม่ที่สุดไปเก่าที่สุด

**เหตุผล:**
- API ส่งข้อมูลเรียงตาม `startTime: "asc"` อยู่แล้ว
- client-side `.sort()` หรือ `.reverse()` ได้ง่าย
- ผู้ใช้ต้องการดูล่าสุดก่อน

### D5: เก็บรูปแบบ UI เดิมของ BookingsList

**ตัดสินใจ:** ใช้ `BookingsList` component เดิม ปรับแค่ logic การ filter และการแสดงปุ่ม

**เหตุผล:**
- ไม่ต้องสร้าง component ใหม่
- รักษาความสอดคล้องกับ UIUX standard (claude.md §5)

### D6: ตารางเวลารีเฟรชผ่าน SWR mutateBookings หลังอนุมัติ

**ตัดสินใจ:** ใช้ `await mutateBookings()` ที่มีอยู่แล้วใน `handleConfirm` — หลัง PUT `/api/book-meeting` เปลี่ยนสถานะเป็น `"confirmed"` → `mutateBookings()` จะ re-fetch `GET /api/book-meeting` → ทุก tab (รวม `ScheduleTab`) re-render ด้วยข้อมูลใหม่

**เหตุผล:**
- กลไก SWR revalidation มีอยู่แล้วและทำงานถูกต้อง
- `ScheduleTab` กรองเฉพาะ `b.status === "confirmed"` — pending จะไม่ปรากฏจนกว่าจะอนุมัติ
- เมื่อ booking เปลี่ยนจาก `pending` → `confirmed` ผ่าน `PUT` แล้ว `mutateBookings()` จะดึงข้อมูลใหม่ → ตารางเวลาแสดง booking ทันที

**ทางเลือกที่พิจารณา:**
- ❌ เพิ่ม custom event หรือ websocket สำหรับ real-time update → over-engineered, SWR polling/revalidation เพียงพอแล้ว
- ❌ กรองเฉพาะ `confirmed` ใน `ScheduleTab` → จะทำให้ `pending` ไม่แสดงในตารางเวลาเลย, ควรแยก change หากต้องการ behavior นี้

### D7: แปลง ISO datetime → local time ก่อนเทียบใน ScheduleTab

**ตัดสินใจ:** `getBooking()` และ `getIsStart()` ใน `ScheduleTab` ใช้ `getLocalTime()` แปลง `b.startTime`/`b.endTime` (ISO string เช่น `"2026-07-15T02:00:00.000Z"`) เป็น local time (`"09:00"`) ก่อนเทียบกับ time slot (`"08:00"`, `"09:00"` ฯลฯ) พร้อมกรอง bookings ตามวันที่เลือก (`scheduleDate`)

**เหตุผล:**
- API `GET /api/book-meeting` ส่ง `startTime`/`endTime` เป็น ISO datetime string (UTC)
- `TIME_SLOTS` เก็บเฉพาะเวลา (`"08:00"`, `"08:30"` ...)
- การเทียบ `"2026-07-15T02:00:00.000Z" <= "08:00"` ด้วย string comparison ไม่มีความหมาย — ไม่มีทาง match
- ต้องแปลง ISO → local time ด้วย `new Date(iso).getHours()` / `.getMinutes()` → `"09:00"` (Bangkok +7)
- `dayBookings = safeBookings.filter(b => b.date === selectedDateStr)` เพื่อลด dataset และกรองข้ามวัน

**ทางเลือกที่พิจารณา:**
- ❌ เปลี่ยน `TIME_SLOTS` เป็น ISO datetime → ต้องเปลี่ยนทั้ง component structure, time slot array เป็น date-dependent
- ❌ ให้ API ส่งเวลาเป็น `"HH:mm"` แทน ISO → ต้องแก้ API response format, กระทบทุก consumer, ข้อมูลเวลาจะไม่มี date/timezone context

### D8: ตารางเวลาแสดงเฉพาะ booking ที่อนุมัติแล้ว (confirmed เท่านั้น)

**ตัดสินใจ:** `ScheduleTab.dayBookings` กรองเฉพาะ `b.status === "confirmed"` — pending booking จะไม่ปรากฏในตารางเวลาจนกว่าจะได้รับการอนุมัติ

**เหตุผล:**
- Workflow ที่ถูกต้อง: จอง → รออนุมัติ → อนุมัติ → ตารางเวลา
- ป้องกันความสับสน: ถ้า pending แสดงในตารางเวลา คนอื่นอาจเข้าใจผิดว่าห้องถูกจองแล้ว
- ห้องประชุมควรถูก reserve ในตารางเวลาเฉพาะเมื่อ booking ได้รับการยืนยันแล้วเท่านั้น

**ทางเลือกที่พิจารณา:**
- ❌ แสดง pending ในตารางเวลาด้วยสีที่ต่าง → ซับซ้อน UI, อาจทำให้ผู้ใช้สับสน

### D9: Client-side double-booking check ด้วย time comparison แบบนาที

**ตัดสินใจ:** `BookingModal.checkConflict()` แปลงเวลาทั้ง `startTime`/`endTime` (ISO string) และ time slot (`"09:00"`) เป็นจำนวนนาที (`getHours()*60 + getMinutes()`) ก่อนเทียบ

**เหตุผล:**
- Bug เดิม: `checkConflict` เทียบ `b.startTime < et && b.endTime > st` โดยตรง — `b.startTime` เป็น ISO string (`"2026-07-15T02:00:00.000Z"`) แต่ `st`/`et` เป็นเวลาเพียวๆ (`"09:00"`) — string comparison ไม่มีความหมาย
- แก้ด้วยการแปลงทั้งสองฝั่งเป็นนาที: `getLocalTimeFromISO(b.startTime)` → `540` (9:00), `getLocalTimeFromString(st)` → `540` → เทียบได้ถูกต้อง
- Server-side `POST /api/book-meeting` มี conflict check ด้วย `prisma.roomBooking.findFirst()` ใช้ `new Date()` เปรียบเทียบ DateTime ได้ถูกต้องอยู่แล้ว — double-booking prevention มี 2 ชั้น (client + server)

**ทางเลือกที่พิจารณา:**
- ❌ พึ่ง server-side check อย่างเดียว → ผู้ใช้ไม่เห็น feedback ทันที, ต้องรอ submit แล้วถึงรู้ว่าจองไม่ได้
- ❌ ใช้ library เปรียบเทียบเวลา → เพิ่ม dependency โดยไม่จำเป็น

### D10: สถานะห้อง 3 ระดับ Real-time ผ่าน API + SWR polling

**ตัดสินใจ:** API `/api/book-meeting/rooms` คืนค่า 3 สถานะ: `"in-use"` (กำลังใช้งาน), `"booked"` (ถูกจองล่วงหน้า), `"available"` (ว่าง) โดย query bookings ที่ยังไม่สิ้นสุด (`endTime > now`) ทั้ง `confirmed` และ `pending` แล้วแยกตาม `startTime <= now` (in-use) vs `startTime > now` (booked) ฝั่ง client เพิ่ม `refreshInterval: 30000` ใน SWR

**เหตุผล:**
- API เดิมคืนค่าแค่ `"available"` กับ `"in-use"` — `STATUS_MAP` มี `"booked"` ไว้แต่ API ไม่เคยใช้
- Query เดิมกรองเฉพาะ `confirmed` และ `startTime <= now` — ทำให้พลาด booking ที่ upcoming (จองล่วงหน้า) และ pending
- การเปลี่ยนเป็น query `{ status: { in: ["confirmed", "pending"] }, endTime: { gt: now } }` แล้วแยก in-use/booked ใน application code ให้ข้อมูลสมบูรณ์
- SWR `refreshInterval: 30000` ทำให้ RoomsTab อัปเดตอัตโนมัติทุก 30 วินาทีโดยไม่ต้อง reload หน้า

**ทางเลือกที่พิจารณา:**
- ❌ WebSocket สำหรับ real-time → over-engineered, 30s polling เพียงพอสำหรับสถานะห้อง
- ❌ Query แยก 2 รอบ (in-use กับ booked) → เพิ่ม round trip โดยไม่จำเป็น, รวมใน query เดียวแล้ววนลูปแยก efficient กว่า

## Risks / Trade-offs

- **[Risk] `confirmed` ที่เลยเวลาแล้วยังอยู่ใน booking list ทั้งหมด** → API GET `/api/book-meeting` ไม่ได้กรอง `endTime` ออก ทำให้ response payload ใหญ่ขึ้นเรื่อยๆ → **Mitigation:** ในอนาคตเมื่อข้อมูลเยอะขึ้น อาจเพิ่ม pagination หรือ archived flag; ตอนนี้ข้อมูลน้อยยังไม่เป็นปัญหา
- **[Risk] ผู้ใช้เห็นประวัติของตัวเองสับสน (ไม่มี `completed` status ที่ชัดเจน)** → **Mitigation:** แสดง `BOOKING_STATUS` label ในแท็บประวัติให้ชัดเจน (`confirmed` → "ยืนยัน", `cancelled` → "ยกเลิก", `completed` → "เสร็จสิ้น")
- **[Trade-off] ไม่เพิ่ม `completed` status อัตโนมัติ** → แท็บประวัติต้องกรอง `endTime < now` ทุกครั้งที่ render ซึ่งเป็น O(n) filter — แต่ด้วยจำนวน booking ที่ยังน้อย ไม่กระทบ performance
