## 1. Sidebar Redesign

- [x] 1.1 ปรับ Sidebar width จาก 220px → 280px (expanded) และ 68px → 72px (collapsed) ใน `dashboard-layout.tsx`
- [x] 1.2 ปรับ CSS classes: `lg:w-[280px]` (expanded), `lg:w-[72px]` (collapsed)
- [x] 1.3 ปรับ Section Heading "เมนูหลัก" และ "ดูแลระบบ" ให้ใช้ `text-[11px] font-semibold uppercase tracking-wider text-white/50` พร้อม padding ใหม่
- [x] 1.4 ปรับ Icon + Label gap เป็น 16px (`gap-4`) ใน nav items
- [x] 1.5 ปรับ Active state: `bg-tu-secondary text-tu-text-primary` พร้อม left border indicator 3px
- [x] 1.6 ปรับ Hover state: `hover:bg-white/10 hover:text-white` พร้อม `transition-colors duration-150`
- [x] 1.7 ปรับ Logo area ให้เหมาะสมกับ width ใหม่ (padding, alignment)
- [x] 1.8 ทดสอบ Collapse/Expand toggle บน Desktop และ Mobile

## 2. Dashboard Module Header

- [x] 2.1 เพิ่ม Module Header ที่ด้านบนของ Dashboard (`dashboard/page.tsx`)
- [x] 2.2 แสดงชื่อ Module "Dashboard" (H1, 28px, font-semibold) + Description "ภาพรวมคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์"
- [x] 2.3 เพิ่มปุ่ม Refresh พร้อม RefreshCw icon ด้านขวาของ Header
- [x] 2.4 ทำ RefreshCw icon หมุน (animate-spin) ขณะกำลัง re-fetch ข้อมูล
- [x] 2.5 ปรับ Layout ให้ responsive (stack บน mobile)

## 3. Organization Statistics Redesign

- [x] 3.1 เปลี่ยน Grid จาก 3-col เป็น 4-col (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- [x] 3.2 สร้าง StatCard component ใหม่ (หรือ refactor เดิม) ให้มี: ค่าใหญ่ (text-4xl, font-bold), Trend indicator, Icon, Sub-text
- [x] 3.3 เพิ่ม Trend indicator: แสดง "+X% จากเดือนก่อน" พร้อมลูกศร TrendingUp/TrendingDown, สีเขียว/แดง ตามทิศทาง
- [x] 3.4 ปรับ 4 metrics เป็น: จำนวนบุคลากร, ระบบออนไลน์, โครงการ, จำนวนนักศึกษา
- [x] 3.5 ปรับ Card Style: `rounded-2xl`, `shadow-sm`, `border border-tu-border`, `bg-tu-surface`
- [x] 3.6 เพิ่ม Hover Animation: `hover:shadow-md hover:scale-[1.02] transition-all duration-200`
- [x] 3.7 `prefers-reduced-motion`: ปิด animation เมื่อผู้ใช้ตั้งค่า reduce motion
- [x] 3.8 ลบ PersonnelBreakdown component — สถิติองค์กรมีแค่ 4 การ์ดใน Grid เท่านั้น ไม่มี breakdown แยก

## 4. Important Announcements Timeline

- [x] 4.1 "ประกาศสำคัญ" เป็น Section Header (h2) นอก card — ไม่มี card wrapper
- [x] 4.2 Layout: Icon ซ้าย / ชื่อ (บรรทัดบน) / Badge + วันที่ (บรรทัดล่าง ใต้ชื่อ)
- [x] 4.3 Badge หมวดหมู่ใช้ category จาก Intranet (ประกาศด่วน, เชิญชวน, ประกาศผล, นโยบาย, ทั่วไป)
- [x] 4.4 กดที่รายการ → เปิด Detail Modal (เหมือน Intranet) แสดงชื่อ, ผู้ประกาศ, วันที่, เนื้อหาเต็ม
- [x] 4.5 แสดงเฉพาะ 3 ประกาศล่าสุด เรียงจากใหม่ไปเก่า (date descending)
- [x] 4.6 Hover: `hover:bg-tu-surface-hover`, title → `text-tu-primary`, transition 150ms
- [x] 4.7 ลบ NewsCard "ข่าวสารและกิจกรรม"

## 5. Department Dashboard Tabs & Views

- [x] 5.1 Department Tabs: แท็บ 3 ฝ่าย — "ฝ่ายวิชาการ" / "ฝ่ายเทคโนโลยีสารสนเทศ" / "ฝ่ายสนับสนุน" (pill-style, ไม่มี "ทั้งหมด")
- [x] 5.2 Department Tabs อยู่ใต้ Section Header "ข้อมูล BI แสดงผลตามมุมมองที่เลือก"
- [x] 5.3 Segmented Control 5 มุมมองอยู่ใต้ Department Tabs
- [x] 5.4 URL sync: `?dept=academic|it|support` + `?view=overview|weekly|trend|proportion|comparison`
- [x] 5.5 เมื่อเลือกฝ่าย → ข้อมูลใน Chart เปลี่ยนตามฝ่ายนั้นในทุกมุมมอง
- [x] 5.6 Comparison view: ซ่อนเมื่อ role level < 70 (Dean+ only)
- [x] 5.7 Mock data สำหรับแต่ละฝ่าย (academic, it, support)
- [x] 5.8 Charts ใช้ Recharts ตาม BI Color Guidelines

## 6. BI Charts Enhancement (Recharts)

- [x] 6.1 Overview: Area Chart + KPI Cards พร้อม sparklines (LineChart ขนาด 80×32 ไม่มีแกน)
- [x] 6.2 Overview: เพิ่ม Recent Activity feed (5 รายการล่าสุด)
- [x] 6.3 Weekly: Bar Chart + Data Table (วัน, เอกสาร, การจอง, โครงการ, ประกาศ, รวม) พร้อม alternating row colors
- [x] 6.4 Trend: Line Chart + Heatmap strip (7-cell, สีเข้มตาม activity) + Growth indicator
- [x] 6.5 Proportion: Donut Charts พร้อม center label (total count) + Stacked Bar breakdown
- [x] 6.6 Comparison: Side-by-side comparison cards + Grouped Bar Chart (current vs last month)
- [x] 6.7 ปรับ `useChartPalette` hook ให้ support BI semantic colors (8+ distinct colors)
- [x] 6.8 Chart heights: Overview 250px, Weekly 300px, Trend 300px, Proportion 280px, Comparison 300px

## 7. Card Design System Update

- [x] 7.1 ปรับทุก Card ใน Dashboard ใช้ `rounded-2xl` (16px border-radius)
- [x] 7.2 ใช้ `shadow-sm` แทน shadow เดิม (บางลง)
- [x] 7.3 ใช้ `border border-tu-border` (1px)
- [x] 7.4 Hover: `hover:shadow-md transition-shadow duration-200`
- [x] 7.5 ตรวจสอบ Card ทุกประเภทใน Dashboard (StatCard, ChartCard, TimelineCard) ใช้ style ใหม่

## 8. Color Compliance — globals.css Design Tokens

- [x] 8.1 ตรวจสอบทุก UI component (Sidebar, Header, Cards, Charts, Buttons, Inputs) ใช้เฉพาะ `--tu-*` CSS variables จาก `globals.css`
- [x] 8.2 ห้ามใช้ raw hex colors (`#xxxxxx`) ในทุก component — ใช้ Tailwind classes ที่ map ไปยัง `--tu-*` tokens
- [x] 8.3 ห้ามใช้ Tailwind palette colors (`bg-white`, `text-gray-900`, `bg-red-500` ฯลฯ) — ใช้ `bg-tu-surface`, `text-tu-text-primary`, `bg-tu-error` แทน
- [x] 8.4 ตรวจสอบ Chart colors ใช้ `useChartPalette` hook ซึ่งดึงสีจาก `globals.css` CSS variables
- [x] 8.5 ตรวจสอบ Sidebar ใช้ `bg-tu-primary-active`, `text-white`, `bg-tu-secondary` (ซึ่งทั้งหมด map ไปยัง `--tu-*`)
- [x] 8.6 ตรวจสอบ Badge/Tag/Priority colors ใช้ `bg-tu-error/10`, `text-tu-error`, `border-tu-error/20` pattern

## 9. Testing & Responsive

- [x] 9.1 ทดสอบ Sidebar บน Desktop (1920px, 1366px), Tablet (1024px, 768px), Mobile (375px)
- [x] 9.2 ทดสอบ Collapse/Expand + localStorage persistence
- [x] 9.3 ทดสอบ Department Tabs: เปลี่ยน tab → data เปลี่ยน, URL update
- [x] 9.4 ทดสอบ View Segmented Control: เปลี่ยน view → chart เปลี่ยน
- [x] 9.5 ทดสอบ Refresh button: icon หมุน, data re-fetch
- [x] 9.6 ทดสอบ Role-gating: Comparison view ซ่อนสำหรับ User/Viewer/Dept Admin
- [x] 9.7 ทดสอบ Responsive: Grid ปรับ column ตาม viewport, Timeline อ่านได้บน mobile
- [x] 9.8 ทดสอบ `prefers-reduced-motion`: animation ปิดทั้งหมด
- [x] 9.9 ทดสอบ Color Compliance: ตรวจสอบว่าไม่มี raw hex หรือ Tailwind palette colors หลุดใน components
