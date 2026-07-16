## Context

Dashboard ปัจจุบันใช้กราฟแท่ง CSS ล้วน (div-based bars) — ไม่มีไลบรารีแผนภูมิ, ไม่มี tooltip, ไม่มี responsive resize, ไม่มี animation การเปลี่ยนข้อมูล มี 5 มุมมองที่ทำงานด้วยข้อมูลจาก `/api/dashboard/stats` และ `/api/dashboard/department-stats` โดย API ส่งข้อมูลที่สมบูรณ์พร้อมใช้งานแล้ว

## Goals / Non-Goals

**Goals:**
- แทนที่กราฟ CSS ด้วย recharts — ติดตั้ง `recharts` เป็น dependency ใหม่
- แต่ละมุมมองมีรูปแบบ BI ที่แตกต่างและเหมาะสม:
  - **Overview**: Area Chart + KPI Stat Cards พร้อม Sparkline
  - **Weekly**: Bar Chart รายวัน แยกสีตามประเภทกิจกรรม
  - **Trend**: Multi-series Line Chart 7 เดือน พร้อมจุดข้อมูล
  - **Proportion**: Donut Chart ตามแผนก + Horizontal Stacked Bar บุคลากร
  - **Comparison**: Grouped Bar Chart เดือนนี้ vs เดือนก่อน
- Interactive tooltip ทุกแผนภูมิ — แสดงค่าตัวเลข, หน่วย, วันที่
- Responsive — แผนภูมิปรับขนาดตาม container ด้วย `ResponsiveContainer`
- คง RBAC — Comparison view สำหรับ Dean+ เท่านั้น

**Non-Goals:**
- ไม่เปลี่ยน API endpoints
- ไม่เปลี่ยนโครงสร้างข้อมูล
- ไม่เพิ่มหน้าใหม่
- ไม่เปลี่ยน database schema
- ไม่เพิ่ม real-time polling (คงใช้ SWR revalidation เดิม)
- ไม่ย้าย business logic จาก page ไป custom hooks (scope กว้างเกินไป)

## Decisions

### Decision 1: เลือก recharts เป็นไลบรารีแผนภูมิ

**เลือก:** recharts (~180KB gzipped)

**เหตุผล:**
- เป็นไลบรารีแผนภูมิ React ที่นิยมที่สุด (25M+ downloads/week)
- Declarative API — ใช้ JSX components (`<LineChart>`, `<Bar>`, `<Tooltip>`)
- รองรับ Responsive ผ่าน `<ResponsiveContainer>`
- รองรับ Animation ในตัว (no extra dependency)
- รองรับ TypeScript types ในตัว
- ใช้ SVG rendering — sharp ทุก resolution
- มี components ครบ: Area, Bar, Line, Pie/Donut, Radar, Treemap

**ทางเลือกที่พิจารณา:**
- **Chart.js + react-chartjs-2** — Canvas-based, responsive ดี แต่ API ไม่ declarative เท่า, ต้องจัดการ resize เอง
- **Nivo** — สวยงาม, D3-based, แต่ bundle ใหญ่กว่า (400KB+) และ API ซับซ้อนกว่า
- **ECharts** — ทรงพลังมาก แต่ bundle ใหญ่ (1MB+), API configuration-based ไม่ใช่ JSX
- **Tremor** — UI library ที่มี charts ในตัว แต่ผูกกับ Tailwind และเปลี่ยน design system ทั้งหมด

### Decision 2: ใช้ `ResponsiveContainer` ทุกแผนภูมิ

**เลือก:** ทุกแผนภูมิห่อด้วย `<ResponsiveContainer width="100%" aspect={...}>`

**เหตุผล:**
- แผนภูมิปรับขนาดอัตโนมัติเมื่อ sidebar ย่อ/ขยาย หรือ responsive breakpoint เปลี่ยน
- `aspect` prop ควบคุมอัตราส่วนความสูงต่อความกว้าง (e.g., `aspect={2}` = กว้าง 2x สูง)
- ไม่ต้องใช้ `useRef` + `ResizeObserver` เอง

### Decision 3: Color palette ใช้ Design Token ของ TULAW

**เลือก:** ใช้ CSS variables `--tu-primary`, `--tu-secondary`, `--tu-success`, `--tu-warning`, `--tu-info`, `--tu-error`

**เหตุผล:**
- สอดคล้องกับ Design System (claude.md Section 6)
- ถ้า admin เปลี่ยน primary color ใน settings, charts จะเปลี่ยนตามอัตโนมัติ
- ใช้ `getComputedStyle` หรือ `CSS custom properties` ผ่าน `style` prop

**วิธีอ่าน CSS variables ใน recharts:**
```tsx
// ใน browser เท่านั้น ใช้ useEffect + useState
const [colors, setColors] = useState({ primary: "#A31D1D", ... });
useEffect(() => {
  const style = getComputedStyle(document.documentElement);
  setColors({
    primary: style.getPropertyValue("--tu-primary").trim(),
    secondary: style.getPropertyValue("--tu-secondary").trim(),
    // ...
  });
}, []);
```

### Decision 4: Tooltip — ใช้ recharts `<Tooltip>` ในตัว

**เลือก:** Custom `<Tooltip>` component ที่แสดงค่าในรูปแบบที่อ่านง่าย (ภาษาไทย)

**เหตุผล:**
- recharts มี `<Tooltip>` ที่ handle positioning อัตโนมัติ
- Custom content function สำหรับฟอร์แมตตัวเลข, ชื่อเดือนไทย, หน่วย
- cursor style: `cursor={{ strokeDasharray: '3 3' }}` สำหรับ grid line บน tooltip

### Decision 5: ใช้ข้อมูลจาก API เดิม — ไม่เปลี่ยนแปลง backend

**เลือก:** ใช้ข้อมูลจาก `GET /api/dashboard/stats` และ `GET /api/dashboard/department-stats` เหมือนเดิม

**เหตุผล:**
- API ส่งข้อมูลที่พร้อมใช้งานแล้ว (weeklyByDay, monthlyTrend, comparison, userProportionByDept)
- เปลี่ยนเฉพาะ frontend rendering — zero backend changes
- ลดความเสี่ยง — ถ้า chart พัง API ยังใช้ได้

### Decision 6: animation — ใช้ recharts animation ในตัว

**เลือก:** เปิด animation บน recharts components (default `animationDuration={400}`, `animationEasing="ease"`)

**เหตุผล:**
- recharts มี animation ในตัวทุก chart type — ไม่ต้องใช้ framer-motion หรือ CSS transition เพิ่ม
- animation ทำให้การเปลี่ยนมุมมอง (switching views) ดูลื่นไหล
- `isAnimationActive={false}` บน data update เพื่อป้องกัน animation ซ้ำเมื่อ SWR revalidate

## Risks / Trade-offs

- **[Trade-off] Bundle size +180KB** — recharts เพิ่ม bundle size ~180KB gzipped แต่เป็นการแลกที่คุ้มค่าสำหรับ BI visualization ที่ดีขึ้น → ใช้ dynamic import (`next/dynamic`) สำหรับ dashboard page ถ้ากังวล
- **[Risk] CSS variable ใน SVG** — recharts เป็น SVG, CSS custom properties ใน SVG อาจไม่ทำงานในบาง browser → ใช้ `useEffect` อ่าน CSS variable แล้วส่งเป็น JavaScript object แทน
- **[Risk] Responsive ถ้า parent ไม่มี width** — `ResponsiveContainer` ต้องการ parent ที่มี `width` ที่แน่นอน → ใช้ `width="100%"` และทดสอบในทุก breakpoint
