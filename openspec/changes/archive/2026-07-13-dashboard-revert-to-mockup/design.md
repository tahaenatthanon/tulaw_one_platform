## Context

Dashboard ต้องแสดงภาพรวมองค์กรแบบง่าย: stat cards ด้านบน, สถิติองค์กร + สัดส่วนบุคลากร ตรงกลาง, ประกาศ + ข่าวสาร ด้านล่าง ตาม mockup ทั้ง 5 ภาพ

## Goals / Non-Goals

**Goals:**
- แทนที่ BI dashboard ด้วย dashboard แบบ card-based ตาม mockup
- 4 stat cards (บุคลากร, หลักสูตร, งานวิจัย, นักศึกษา)
- Personnel breakdown by type/department
- Latest announcements + news

**Non-Goals:**
- ไม่ลบ 5 view mode tabs (เอา Overview มาใช้เป็น default แทน)

## Decisions

1. **ใช้ API `/api/dashboard/stats` เดิม** — ดึงข้อมูลจาก Prisma แบบ real-time
2. **Layout แบบ 2-column cards** (เหมือน mockup): stat cards 4 ใบเรียงแถวบน → org stats + personnel breakdown ตรงกลาง → announcements + news ด้านล่าง
3. **ไม่ใช้ recharts/chart.js** — ใช้ card-based UI ล้วนๆ ตาม mockup
