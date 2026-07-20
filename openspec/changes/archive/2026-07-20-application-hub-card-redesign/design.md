## Context

หน้า Application Hub (`app/(dashboard)/application-hub/page.tsx`) แสดง stat cards 4 ใบ + รายการแอปพลิเคชันแบบ Grid/List พร้อม pin/unpin

## Goals / Non-Goals

**Goals:**
- Stat Cards ใช้รูปแบบเดียวกับ Intranet/Dashboard
- ลบ userCount ออกจากทุกที่
- Grid/List toggle ใช้ container ใหม่
- Card ใช้ `rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02]`

**Non-Goals:**
- ไม่เปลี่ยน API, RBAC, pin logic, search

## Decisions

- ใช้ `StatCard` component เดียวกับ Intranet (label ซ้าย, icon ขวา, `text-4xl`)
- `AppGroup` interface ลบ `userCount`
- Toggle ใช้ `inline-flex p-1 rounded-xl bg-tu-bg/70`

## Risks / Trade-offs

- **[Trade-off]** Stat "อัตราออนไลน์" แสดง % แทนจำนวน user → ข้อมูลคนละมิติแต่มีประโยชน์ในมุม admin
