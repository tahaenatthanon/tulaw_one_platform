## Context

Book Meeting page ที่ `/book-meeting` ยังไม่มี สร้างใหม่ด้วย mock data และ UI ตาม requirement

## Goals / Non-Goals

**Goals:**
- Stats, 5 tabs, room cards, booking modal, MS Teams link
- Mock data สำหรับ rooms และ bookings
- Double-booking simulation

**Non-Goals:**
- ไม่เชื่อม API จริง (ใช้ mock data)
- ไม่ implement การแจ้งเตือนจริง

## Decisions

1. **All in one file** — components ย่อยในไฟล์เดียวกัน
2. **Mock data** — 6 rooms, sample bookings
3. **Double-booking** — check ใน booking handler ฝั่ง client
