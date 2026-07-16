## 1. ติดตั้งและเตรียมโครงสร้าง

- [x] 1.1 ติดตั้ง `recharts` package
- [x] 1.2 สร้าง custom hook `hooks/use-chart-colors.ts` สำหรับอ่าน CSS variables จาก Design System มาใช้ใน recharts
- [x] 1.3 สร้าง `components/charts/chart-tooltip.tsx` — custom tooltip component ที่ฟอร์แมตค่าเป็นภาษาไทย

## 2. Overview View — Area Chart + KPI Cards

- [x] 2.1 แทนที่ div bar chart ด้วย `<AreaChart>` จาก recharts แสดงกิจกรรมรายสัปดาห์ (7 วัน)
- [x] 2.2 แก้ไข `StatCard` — เพิ่ม `sparklineData` prop และ render mini sparkline (`<LineChart>` ไม่มี axes) ใต้ตัวเลข
- [x] 2.3 ส่งข้อมูล `weeklyByDay` จาก API ให้ AreaChart + Sparklines
- [x] 2.4 ใช้สีจาก `useChartColors` hook — `--tu-primary` สำหรับ area fill (opacity 15%) และ line

## 3. Weekly View — Bar Chart รายวัน

- [x] 3.1 สร้าง `<BarChart>` แสดง activity แยกตามวัน (จันทร์-อาทิตย์) ด้วยข้อมูล `weeklyByDay`
- [x] 3.2 ใช้สี 4 สีแยกตามประเภท: Documents (`--tu-primary`), Bookings (`--tu-info`), Projects (`--tu-secondary`), Announcements (`--tu-warning`)
- [x] 3.3 เพิ่ม custom tooltip — แสดงชื่อวัน, จำนวนรายการ, เปอร์เซ็นต์
- [x] 3.4 กำหนด X-axis labels เป็นชื่อวันภาษาไทย (จ., อ., พ., พฤ., ศ., ส., อา.)

## 4. Trend View — Multi-Series Line Chart

- [x] 4.1 สร้าง `<LineChart>` พร้อม 3 `<Line>` series จากข้อมูล `monthlyTrend` (documents, bookings, projects)
- [x] 4.2 แสดง data points (`dot`) บนทุกเส้น พร้อม tooltip ตอน hover
- [x] 4.3 X-axis แสดงชื่อเดือนภาษาไทย 7 เดือน (ม.ค., ก.พ., ...)
- [x] 4.4 Legend ด้านล่างหรือด้านขวา — แสดงชื่อ series เป็นภาษาไทย (เอกสาร, จองห้อง, โครงการ)

## 5. Proportion View — Donut + Stacked Bar

- [x] 5.1 สร้าง `<PieChart>` แบบ Donut (innerRadius 60%, outerRadius 80%) จากข้อมูล `userProportionByDept`
- [x] 5.2 แสดง label บนแต่ละ segment: ชื่อแผนกและเปอร์เซ็นต์
- [x] 5.3 สร้าง Horizontal Stacked Bar (`<BarChart layout="vertical">`) แสดงสัดส่วนบุคลากรตามประเภท
- [x] 5.4 ใช้สีจาก Design System ให้แต่ละแผนก/ประเภทมีสีต่างกัน

## 6. Comparison View — Grouped Bar Chart

- [x] 6.1 สร้าง `<BarChart>` พร้อม 2 `<Bar>` series: เดือนนี้ vs เดือนก่อน จากข้อมูล `comparison`
- [x] 6.2 แสดง label เปอร์เซ็นต์การเปลี่ยนแปลงบนแต่ละกลุ่มแท่ง (+สีเขียว / -สีแดง)
- [x] 6.3 ใช้ `<ReferenceLine>` แสดงเส้น baseline ที่ค่า 0
- [x] 6.4 คง RBAC — ซ่อนแท็บ Comparison สำหรับ role level < 70

## 7. Responsive & Animation

- [x] 7.1 ห่อทุก Chart ด้วย `<ResponsiveContainer width="100%" aspect={...}>`
- [x] 7.2 เปิด animation (`animationDuration={400}`, `animationEasing="ease"`) บนทุก chart
- [x] 7.3 ทดสอบ responsive — ย่อ/ขยายหน้าจอ, toggle sidebar, tablet/mobile ⚠ Manual test

## 8. Cleanup และ Polish

- [x] 8.1 ลบ CSS/div bar chart code เก่าที่ไม่ใช้แล้วทั้งหมด
- [x] 8.2 ปรับ view toggle pill ให้ใช้ standard pattern (Section 5.4a) ถ้ายังไม่ได้ใช้
- [x] 8.3 ทดสอบ loading state — แสดง skeleton charts ระหว่างโหลด
- [x] 8.4 ทดสอบ error state — แสดง fallback เมื่อ API error
- [x] 8.5 ตรวจสอบสีทั้งหมดใช้ CSS variables — ไม่มี hardcoded hex
