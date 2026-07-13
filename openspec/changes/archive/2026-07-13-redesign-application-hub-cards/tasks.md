## 1. Data model

- [x] 1.1 ลบ `SubModule` interface, เปลี่ยน `AppGroup` — เอา `subs` ออก, เพิ่ม `userCount`
- [x] 1.2 อัปเดต `appGroups` — ลบ submodules, เพิ่ม userCount

## 2. Card redesign

- [x] 2.1 เขียน `AppGroupCard` ใหม่ — centered layout: icon/name/description/userCount/status แยกบรรทัด
- [x] 2.2 Pin button แสดงเฉพาะ hover (`opacity-0 group-hover:opacity-100`)
- [x] 2.3 กด card ไม่ทำอะไร (no onClick)

## 3. Layout

- [x] 3.1 5 cards ใน 1 แถว — `grid-cols-5`
- [x] 3.2 Search bar ไปซ้ายของ Grid/List toggle ใน flex-row เดียวกัน

## 4. Clean up

- [x] 4.1 ลบ imports ที่ไม่ใช้ (`useRouter`, submodule icons)
- [x] 4.2 TypeScript — zero errors
