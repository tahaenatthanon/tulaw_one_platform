## Context

Sidebar ปัจจุบันกว้าง 220px (หรือ 68px เมื่อ collapsed) ซึ่งแคบเกินไปสำหรับชื่อภาษาไทยและ Icon ประกอบ หน้า Dashboard ยังขาดโครงสร้างแบบ Enterprise — ไม่มี Module Header, สถิติองค์กรเป็น Card 3 ใบเล็ก, ประกาศสำคัญไม่มีจุดเด่น, และไม่มี Dashboard แยกตามฝ่าย

เทคโนโลยีที่ใช้: Next.js 16 (App Router), Tailwind CSS 4, Recharts, Lucide Icons, SWR, shadcn/ui

## Goals / Non-Goals

**Goals:**
- Sidebar กว้าง 280px เมื่อขยาย, 72px เมื่อ collapsed
- Sidebar มี Section Heading ชัดเจน (เมนูหลัก / ดูแลระบบ), Hover/Active แบบใหม่
- หน้า Dashboard มี Module Header (ชื่อ + คำอธิบาย + ปุ่ม Refresh)
- Organization Statistics เปลี่ยนเป็น 4-Col Grid, Card ใหญ่ มี Trend, Sub text, Hover Animation
- Important Announcements แสดงแบบ Timeline พร้อม Priority Badge
- Department Dashboard แยก 3 ฝ่าย (IT / วิชาการ / สนับสนุน) พร้อม Segmented Control 5 มุมมอง
- Charts ใช้ Recharts ตาม BI Color Guidelines (Semantic Colors)
- Card มี Radius 16-20px, Shadow บาง, Border 1px, Hover Transition 200ms

**Non-Goals:**
- ไม่เปลี่ยนโครงสร้าง Navigation (ยังคง Platform Modules + Admin Modules เหมือนเดิม)
- ไม่เพิ่ม dependency ใหม่ (Recharts มีอยู่แล้ว)
- ไม่เปลี่ยน API structure (ใช้ endpoint เดิม เพิ่ม query param สำหรับ department filter)
- ไม่เปลี่ยน Responsive behavior (Mobile sidebar ยังคงเป็น overlay)

## Decisions

### Decision 1: Sidebar Width — 280px (expanded), 72px (collapsed)

**Rationale:** 280px ให้พื้นที่พอสำหรับ Label ภาษาไทย (เช่น "จองห้องประชุม") โดยไม่ต้องตัดคำ, 72px สำหรับ collapsed ให้ Icon ขนาด 20px อยู่กลางได้พอดี

**Alternatives considered:** 300px (กว้างเกิน, กินพื้นที่ content), 250px (ยังแคบเกินสำหรับภาษาไทย)

### Decision 2: Sidebar Collapse ใช้ localStorage

**Rationale:** ใช้ pattern เดิมที่มีอยู่แล้ว (localStorage `sidebar-collapsed`) แค่ปรับ width CSS ไม่ต้องเปลี่ยน logic

### Decision 3: Department Dashboard — Dept Tabs Above, View Selector Below

**Rationale:** Layout เรียงตามลำดับ: Section Header ("Dashboard แยกรายฝ่าย" + description) → Department Tabs (ฝ่ายวิชาการ / ฝ่ายเทคโนโลยีสารสนเทศ / ฝ่ายสนับสนุน, pill-style) → Segmented Control 5 มุมมอง (Overview/Weekly/Trend/Proportion/Comparison, pill-style) → Chart Area (Recharts) — Department tabs อยู่เหนือ view selector เพราะเป็นตัวกรองหลัก — เมื่อเลือกฝ่าย ข้อมูลใน chart เปลี่ยนตามฝ่ายที่เลือกในทุกมุมมอง — ใช้ Recharts ตาม BI Color Guidelines

### Decision 4: Announcements — Section Header, Single-Row Items, Newest-First, Inline Detail Modal

**Rationale:** "ประกาศสำคัญ" เป็น Section Header (h2) ไม่อยู่ใน card header — แต่ละรายการ: Icon หมวดหมู่ซ้าย → ชื่อประกาศ (บรรทัดบน) → หมวดหมู่ Badge + วันที่ (บรรทัดล่าง ใต้ชื่อ) — เรียงจากใหม่ไปเก่า (date descending) เหมือน Intranet — กดที่รายการเพื่อเปิด Detail Modal แสดงชื่อ, ผู้ประกาศ, วันที่, และเนื้อหาเต็ม — ไม่ต้อง navigate ไปหน้า Intranet

### Decision 5: Chart Colors ใช้ Semantic Palette แทน Brand-Only

**Rationale:** BI Dashboard ต้องการสีที่สื่อความหมายของข้อมูล (Revenue, Growth, Decline ฯลฯ) ไม่จำกัดแค่สี Brand (แดง-เหลือง) — ใช้ `--tu-primary`, `--tu-info`, `--tu-success`, `--tu-warning`, `--tu-error` เป็น base แล้ว generate เฉดอ่อนสำหรับ charts ตาม BI Color Guidelines

### Decision 6: Organization Statistics — 4 Cards Only, No Separate Breakdown

**Rationale:** สถิติองค์กรแสดงเฉพาะ 4 การ์ดใน Grid 4 คอลัมน์ (บุคลากร / ระบบออนไลน์ / โครงการ / นักศึกษา) — ไม่มี PersonnelBreakdown หรือ Widget สถิติแยกต่างหาก เพราะข้อมูลสัดส่วนบุคลากรซ้ำซ้อนกับ Stat Card "จำนวนบุคลากร" และสามารถดูรายละเอียดเพิ่มเติมได้ใน Department Dashboard

### Decision 7: Card Style ปรับเป็น Radius 16-20px, Shadow-sm, Border 1px

**Rationale:** เพิ่มความทันสมัย (modern card design) โดยไม่ฉูดฉาด — Shadow ใช้ `shadow-sm` (บาง), Border ใช้ `border-tu-border`, Hover ใช้ `hover:shadow-md transition-shadow duration-200`

### Decision 8: All UI colors reference globals.css CSS variables only

**Rationale:** ตาม Design Token Rules (Section 6.11 ของ CLAUDE.md): ห้ามใช้ raw hex values ใน components, ห้ามใช้ Tailwind palette colors สำหรับ brand colors, ต้องใช้เฉพาะ CSS variables ที่ประกาศใน `globals.css` เท่านั้น (`--tu-primary`, `--tu-surface`, `--tu-border`, `--tu-text-primary` ฯลฯ) — รวมถึง `@theme inline` mapping ที่ทำให้ใช้เป็น Tailwind classes ได้ (`bg-tu-primary`, `text-tu-text-muted` ฯลฯ)

**Implementation:** ทุก component ใช้ Tailwind classes ที่ map ไปยัง `--tu-*` variables (เช่น `bg-tu-surface`, `text-tu-primary`, `border-tu-border`) — ห้ามใช้ `bg-white`, `bg-gray-100`, `text-black`, `text-gray-900` หรือ raw hex โดยเด็ดขาด

## Risks / Trade-offs

- **[Risk] Sidebar 280px อาจกินพื้นที่ Content บนจอเล็ก (1366px)** → ใช้ collapsed mode (72px) เป็น default บนจอเล็ก หรือให้ผู้ใช้ collapse เอง
- **[Risk] Department Dashboard อาจโหลดข้อมูลช้า (5 views × 3 departments = 15 data sets)** → ใช้ SWR แยก key ต่อ view+department, load เฉพาะ view ที่ active (lazy load)
- **[Risk] จำนวนไฟล์ components อาจเพิ่มมากเกิน** → แยก Dashboard components เป็นไฟล์ย่อยใน `components/dashboard/` เพื่อความ maintainable

## Migration Plan

1. แก้ Sidebar CSS ใน `dashboard-layout.tsx` — เปลี่ยน width classes
2. สร้าง Dashboard components ใหม่ใน `components/dashboard/`
3. แก้ `app/(dashboard)/dashboard/page.tsx` — เปลี่ยนโครงสร้างใช้ components ใหม่
4. API `/api/dashboard` เพิ่ม query param `?department=it|academic|support`
5. ทดสอบทุก view + department + responsive

Rollback: เปลี่ยน width classes กลับเป็นค่าเดิม, เปลี่ยน page.tsx กลับเป็นเวอร์ชันก่อนหน้า

## Open Questions

- Department-specific data: ต้องการ API ใหม่หรือแค่ filter ฝั่ง client? (แนะนำ: filter ฝั่ง client ก่อน, เพิ่ม API filter ทีหลัง)
- ควรมี Dashboard จริงสำหรับแต่ละฝ่ายหรือ mock data? (แนะนำ: ใช้ mock data ก่อน, ทำ API จริงทีหลัง)
