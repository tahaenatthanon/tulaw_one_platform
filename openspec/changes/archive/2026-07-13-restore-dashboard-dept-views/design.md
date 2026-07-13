## Context

Dashboard page ต้องมี section "Dashboard แยกรายฝ่าย" พร้อม 5 view mode tabs และ department cards 3 ใบที่แสดง mini-chart ตามมุมมอง ใช้ `useSearchParams` เพื่อเก็บ view state ใน URL

## Goals / Non-Goals

**Goals:**
- คืนค่า dept section + 5 view modes ที่หายไป
- คง mockup layout (4 stat cards + org stats + announcements) ไว้

**Non-Goals:**
- ไม่เพิ่มฟีเจอร์ใหม่

## Decisions

1. **ใช้ code เดิมจาก BI dashboard** — DeptMiniChart, dept cards, views tabs
2. **ใช้ API `/api/dashboard/department-stats`** — มีอยู่แล้ว
