## Why

หลัง revert dashboard เป็น mockup แล้ว ส่วน "Dashboard แยกรายฝ่าย" และ "5 มุมมอง (Overview/Weekly/Trend/Proportion/Comparison)" หายไป จำเป็นต้องนำกลับมาเพื่อให้ผู้ใช้สามารถดูข้อมูลแยกรายฝ่ายและเปลี่ยนมุมมองได้

## What Changes

- เพิ่ม Department Cards (IT, Academic, Support) พร้อม mini-chart
- เพิ่ม View Mode Tab Selector: Overview, Weekly, Trend, Proportion, Comparison
- เพิ่ม DeptMiniChart component แสดง chart ตาม view mode
- ดึงข้อมูลจาก API `/api/dashboard/department-stats`

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
<!-- None -->

## Impact

- `app/(dashboard)/dashboard/page.tsx` — เพิ่ม dept section + 5 view modes + DeptMiniChart
