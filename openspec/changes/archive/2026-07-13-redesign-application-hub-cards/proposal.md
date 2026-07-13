## Why

Application Hub card ปัจจุบันแสดง submodules ด้านในและ layout ไม่ตรงตาม mockup ต้องการ redesign ตาม `mockup/Application-Hub.png`: card layout แนวตั้ง (icon→ชื่อ→คำอธิบาย→จำนวนผู้ใช้→สถานะ), pin แสดงเฉพาะ hover, ระบบย่อยเอาออก (กดแล้วไม่นำทาง), ช่องค้นหาย้ายไปซ้ายของ Grid/List toggle

## What Changes

- ลบ submodules จาก AppGroup type และ data (เหลือ card เปล่า)
- เพิ่ม `userCount` field ให้แต่ละ app
- Redesign AppGroupCard: centered layout, icon→name→description→user count→status
- Pin button (star) แสดงเฉพาะเมื่อ hover ด้วย CSS `opacity-0 group-hover:opacity-100`
- ย้าย Search bar ไปซ้ายของ Grid/List toggle (แถวเดียวกัน)
- 5 cards ใน 1 แถว (grid grid-cols-5)
- กด card ไม่นำทาง (onClick removed)

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
<!-- None -->

## Impact

- `app/(dashboard)/application-hub/page.tsx` — redesign card, remove submodules, move search, add userCount
