## Why

หน้า Book Meeting ปัจจุบันอยู่ใน Application Hub sub-route และยังเป็น mock data พื้นฐาน ต้องการ redesign ใหม่ตาม requirement: สถิติ, 5 tabs, room cards, booking modal ครบถ้วน

## What Changes

- สร้าง `app/(dashboard)/book-meeting/page.tsx` ใหม่ทั้งหมด
- 4 stat cards: ห้องทั้งหมด, ว่างขณะนี้, การจองวันนี้, การจองของฉัน
- 5 tabs: รายการห้อง, ตารางเวลา, การจองของฉัน, รออนุมัติ, ประวัติ
- Room cards: status badge ขวาบน, ชื่อ, สถานที่, capacity, ปุ่มจอง
- Booking modal: หัวข้อ/วัตถุประสงค์, เลือกห้อง dropdown, เวลาเริ่ม-สิ้นสุด, ผู้เข้าร่วม, หมายเหตุ
- Double-booking detection + alert
- Confirm/cancel flow
- MS Teams link ใน booking form

## Impact

- `app/(dashboard)/book-meeting/page.tsx` — ใหม่
