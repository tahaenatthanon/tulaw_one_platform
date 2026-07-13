## Why

Dashboard รุ่นปัจจุบันเป็น BI-style มี 5 views (Overview/Weekly/Trend/Proportion/Comparison) พร้อม charts ซับซ้อน ต้องการย้อนกลับไปใช้เวอร์ชันเรียบง่ายตาม mockup เดิม — เน้น 4 stat cards, org charts แบบ card, และ announcements

## What Changes

- เขียน `app/(dashboard)/dashboard/page.tsx` ใหม่ทั้งหมดตาม mockup
- 4 stat cards: จำนวนบุคลากร, จำนวนหลักสูตร, งานวิจัยทั้งหมด, จำนวนนักศึกษา
- แสดงสถิติองค์กร (personnel breakdown by type/department) แบบ card-based
- แสดงประกาศล่าสุด + ข่าวสารกิจกรรม
- ดึงข้อมูลจาก API `/api/dashboard/stats`

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
<!-- None -->

## Impact

- `app/(dashboard)/dashboard/page.tsx` — เขียนใหม่ทั้งหมด
