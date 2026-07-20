## Why

Sidebar ปัจจุบันแคบเกินไป (ประมาณ 220px) ทำให้แสดง Label ไม่เต็มและดูอึดอัด ประกอบกับหน้า Dashboard ยังขาดโครงสร้างที่ชัดเจน — ไม่มี Module Header, สถิติองค์กรยังเป็น Card เล็ก, ประกาศสำคัญยังไม่มีจุดเด่น และยังไม่มี Dashboard แยกตามฝ่าย (IT / วิชาการ / สนับสนุน) การ redesign นี้จะยกระดับ UX ทั้ง Sidebar และ Dashboard ให้ดูเป็น Enterprise มากขึ้น

## What Changes

- **Sidebar** ขยายความกว้างเป็น 280px, เพิ่มปุ่ม Collapse/Expand, ปรับ Hover/Active state ใหม่, จัดระยะ Icon + Label ใหม่, เพิ่ม Section Heading ให้ชัดขึ้น
- **Dashboard Module Header** เพิ่มชื่อ Module พร้อมคำอธิบาย และ Action Button (Refresh) ด้านขวา
- **Organization Statistics** เปลี่ยนจาก Grid 3 column เป็น 4 column, Card ใหญ่ขึ้น มีตัวเลขเด่น, Trend indicator, Icon, Sub text, และ Hover Animation — แสดงเฉพาะ 4 การ์ด (บุคลากร / ระบบออนไลน์ / โครงการ / นักศึกษา) ไม่มี Breakdown หรือ Widget สถิติซ้ำซ้อนแยกต่างหาก
- **Important Announcements** "ประกาศสำคัญ" เป็น Section Header — แต่ละรายการ: Icon หมวดหมู่ (ซ้าย) / ชื่อประกาศ / หมวดหมู่ Badge + วันที่ (ใต้ชื่อ) — เรียงจากใหม่ไปเก่า — กดดู detail modal ได้จาก Dashboard เลยเหมือนใน Intranet
- **Department Dashboard** Section "Dashboard แยกรายฝ่าย" + "ข้อมูล BI แสดงผลตามมุมมองที่เลือก" — ด้านล่างมีแท็บเลือกฝ่าย 3 ฝ่าย (ฝ่ายวิชาการ / ฝ่ายเทคโนโลยีสารสนเทศ / ฝ่ายสนับสนุน) แบบ pill-style — ถัดลงมาเป็น Segmented Control 5 มุมมอง (Overview / Weekly / Trend / Proportion / Comparison) — ด้านล่างสุดเป็น Chart Area ใช้ Recharts — เมื่อเลือกฝ่ายข้อมูลเปลี่ยนตามฝ่ายนั้นในทุกมุมมอง
- **Colors** ทุก UI component ใช้ CSS Variables จาก `globals.css` เท่านั้น — ห้ามใช้ raw hex colors, ห้ามใช้ Tailwind palette colors, ใช้เฉพาะ `--tu-*` design tokens ที่ประกาศใน `:root` และ `@theme inline`

## Capabilities

### New Capabilities
- `sidebar-redesign`: Sidebar กว้าง 280px, Collapse ได้, Hover/Active state ใหม่, Icon+Label จัดระยะใหม่, Section Heading ชัดเจน
- `dashboard-module-header`: ส่วนหัวของหน้า Dashboard แสดงชื่อ Module, Description, และ Action Button (Refresh)
- `dashboard-org-statistics`: Grid สถิติองค์กร 4 Columns, Card ใหญ่ พร้อม Trend, Icon, Sub text, Hover Animation
- `dashboard-announcement-timeline`: ประกาศสำคัญ 3 รายการ — Section Header, บรรทัดเดียว (Icon/ชื่อ/Badge/วันที่), เรียงใหม่ไปเก่า, กดดู Detail Modal
- `dashboard-department-tabs`: Dashboard แยกตามฝ่าย (IT/Academic/Support) พร้อม Segmented Control 5 มุมมอง (Overview/Weekly/Trend/Proportion/Comparison)

### Modified Capabilities
- `dashboard-bi-charts`: ปรับ Charts ทั้ง 5 มุมมองให้รองรับการกรองตามฝ่าย, เพิ่ม Chart ประเภทใหม่ (Donut, Stacked Bar, Grouped Bar, Heatmap), ปรับใช้ BI Color Guidelines แบบ Semantic Colors, และปรับ Card Style ใหม่ (Radius 16-20px, Shadow บาง, Hover Transition 200ms)

## Impact

- **Affected code:** `components/layouts/dashboard-layout.tsx` (Sidebar), `app/(dashboard)/dashboard/page.tsx` (Dashboard หลัก)
- **New files:** 可能需要แยก Dashboard components เป็นไฟล์ย่อยเพื่อลดความซับซ้อน
- **API:** `/api/dashboard` อาจต้องเพิ่ม endpoint สำหรับ Department-specific data
- **Dependencies:** Recharts (มีอยู่แล้ว), ไม่มี dependency ใหม่
