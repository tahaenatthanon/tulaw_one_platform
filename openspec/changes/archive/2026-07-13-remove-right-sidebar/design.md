## Context

ทุกหน้าใน `(dashboard)` route group ใช้ `DashboardLayout` ซึ่งมี right sidebar แสดง mini calendar และ upcoming events RightSidebar แสดงเฉพาะบน `xl` breakpoint ขึ้นไป (`hidden xl:flex`) กินพื้นที่ `w-72` (288px)

## Goals / Non-Goals

**Goals:**
- ลบ RightSidebar ออกจากทุกหน้า dashboard
- ลบ toggle button ใน Header
- ลบ state `rightPanelOpen` และ imports ที่ไม่ใช้

**Non-Goals:**
- ไม่ลบฟีเจอร์ปฏิทินจากหน้า Intranet

## Decisions

1. **ลบทั้ง component แทนการ set default `rightPanelOpen = false`**
   - **เหตุผล**: ถ้าไม่มีใครใช้ right panel อีกต่อไป การเก็บ code ไว้เป็น dead code ไม่ดี การลบทั้งหมดสะอาดกว่าและลด bundle size

## Risks / Trade-offs

- **[Risk]**: ผู้ใช้ที่เคยดู upcoming events จาก right sidebar จะไม่เห็นอีก → **Mitigation**: upcoming events มีในหน้า Intranet และ Dashboard อยู่แล้ว
