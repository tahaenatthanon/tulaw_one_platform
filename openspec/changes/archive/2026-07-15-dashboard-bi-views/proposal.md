## Why

ปัจจุบัน Dashboard แสดงผลข้อมูลด้วยกราฟแท่ง CSS ล้วน (hand-rolled div bars) ทั้ง 5 มุมมอง — ทำให้การนำเสนอข้อมูลขาดมิติ ขาดความหลากหลายทาง BI ที่เหมาะสมกับข้อมูลแต่ละประเภท และขาด interactivity (hover tooltip, animation, responsive resize) ผู้บริหารและผู้ดูแลระบบต้องการ Dashboard ที่สื่อสารข้อมูลเชิงลึกได้อย่างมืออาชีพ ด้วยรูปแบบการนำเสนอที่เหมาะสมกับข้อมูลแต่ละประเภท

## What Changes

- ติดตั้ง `recharts` เป็นไลบรารีแผนภูมิหลัก แทนการวาดกราฟด้วย CSS/div
- ออกแบบรูปแบบ BI ที่แตกต่างกัน 5 มุมมอง:
  - **Overview (ภาพรวม)** — KPI Cards + Area Chart แสดงแนวโน้มกิจกรรมรายสัปดาห์ + Sparkline ใน Stat Card
  - **Weekly (รายสัปดาห์)** — Bar Chart แสดงกิจกรรมรายวัน แยกสีตามประเภท (Documents, Bookings, Projects, Announcements)
  - **Trend (แนวโน้ม)** — Multi-series Line Chart แสดงแนวโน้ม 7 เดือนย้อนหลัง พร้อมจุดข้อมูลและ tooltip
  - **Proportion (สัดส่วน)** — Donut/Pie Charts แสดงสัดส่วนข้อมูลแยกตามแผนก + Horizontal Stacked Bar สำหรับสัดส่วนบุคลากร
  - **Comparison (เปรียบเทียบ)** — Grouped Bar Chart เทียบเดือนนี้กับเดือนก่อน พร้อม % การเปลี่ยนแปลง
- เพิ่ม Interactive Tooltip บนทุกแผนภูมิ — แสดงตัวเลข ร้อยละ และวันที่
- เพิ่ม Responsive Container ให้แผนภูมิปรับขนาดตามหน้าจอ
- เพิ่ม Animation การเปลี่ยนมุมมอง (transition ระหว่าง views)
- คง RBAC เดิม — Comparison view เฉพาะ Dean+ (level ≥ 70)
- คงการดึงข้อมูลจาก API เดิม — ปรับเฉพาะ frontend visualization

## Capabilities

### New Capabilities
- `dashboard-bi-charts`: ปรับปรุง Dashboard 5 มุมมองด้วยแผนภูมิ BI จาก recharts — Area, Bar, Line, Donut/Pie, Grouped Bar พร้อม tooltip, responsive, animation

### Modified Capabilities
<!-- None — existing specs don't have dashboard visualization requirements -->

## Impact

- **Dependencies**: เพิ่ม `recharts` (~180KB gzipped) — ไลบรารีแผนภูมิ React ยอดนิยม
- **Dashboard page** (`app/(dashboard)/dashboard/page.tsx`): แทนที่ div-bar charts ด้วย recharts components — เปลี่ยนแปลงประมาณ 60% ของไฟล์
- **Dashboard API** (`app/api/dashboard/stats/route.ts`): API คงเดิม — ใช้ข้อมูลจาก endpoint เดิม
- **Components**: อาจสร้าง `components/charts/` สำหรับ reusable chart components (ถ้าซับซ้อน)
- **Performance**: recharts ใช้ SVG-based rendering — ไม่กระทบ performance มากนัก, รองรับ responsive โดยใช้ `ResponsiveContainer`
