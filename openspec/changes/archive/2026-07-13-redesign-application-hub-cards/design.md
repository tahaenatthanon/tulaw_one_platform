## Context

Application Hub มี 5 app groups (ERP, E-Office, Document Management, Academic Management, HR Management) การ์ดปัจจุบันแสดง submodules tag และ navigate เมื่อคลิก ต้องการทำให้การ์ดเรียบง่ายขึ้นตาม mockup

## Goals / Non-Goals

**Goals:**
- Card layout แนวตั้ง: icon → name → description → userCount → status
- Pin แสดงเฉพาะ hover
- 5 cards ใน 1 แถว (grid-cols-5)
- Search bar ซ้ายของ toggle
- ลบ submodules ทั้งหมด — card เปล่าไม่นำทาง

**Non-Goals:**
- ไม่เปลี่ยน stats section
- ไม่เปลี่ยน Grid/List toggle pattern

## Decisions

1. **ลบ `SubModule` ออกจาก `AppGroup` type** — ลดความซับซ้อน
2. **ใช้ `opacity-0 group-hover:opacity-100` สำหรับ pin button** — CSS-only ไม่ต้อง state
3. **Search + toggle ใน flex-row เดียวกัน** — `justify-between` with search on left
