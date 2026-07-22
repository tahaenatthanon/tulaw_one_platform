## Context

Dashboard (`app/(dashboard)/dashboard/page.tsx`) ปัจจุบันใช้ mock data hardcoded สำหรับทุกแผนก — `DEPT_WEEKLY`, `DEPT_TREND`, `DEPT_PROPORTION`, `DEPT_COMPARISON` ทั้งหมดเป็น constants ที่ถูก import โดยตรงใน component การเปลี่ยนข้อมูลต้อง deploy code ใหม่

มี API `/api/dashboard/stats` สำหรับ org stats และ announcements แต่ยังไม่มี API สำหรับ chart data (weekly, trend, proportion, comparison)

RBAC มีอยู่แล้ว — `hasMinRoleLevel()`, `useHasPermission()`, `ROLE_LEVELS`, `data-scope.ts` — แต่ dashboard ยังไม่ได้นำมาใช้ในการกรองข้อมูล

## Goals / Non-Goals

**Goals:**
- API `/api/dashboard/stats` คืนข้อมูลตาม department + role ของผู้ใช้
- Chart views แสดง/ซ่อนตาม role level (Comparison → Dean+ only, Trend → Dept Admin+ ฯลฯ)
- Department tabs กรองตามสิทธิ์ — Dept Admin เห็นเฉพาะแผนกตัวเอง
- ผู้มี `DASHBOARD_EDIT` สามารถแก้ไขข้อมูล dashboard ของแผนกที่ได้รับสิทธิ์
- System Admin จัดการสิทธิ์ dashboard ผ่าน API
- ประกาศสำคัญเหมือนกันทุก role
- ข้อมูลอัตโนมัติจาก platform systems (org stats, projects, documents)

**Non-Goals:**
- ไม่เปลี่ยน chart components (OverviewChart, WeeklyBarChart, ฯลฯ)
- ไม่เปลี่ยน UI layout หลัก
- ไม่เปลี่ยน announcement system

## Decisions

### 1. Data Source — API-driven with Manual Override

**เลือก:** Dashboard data มาจาก 2 แหล่ง:
- **Auto**: org stats (live DB query), project counts, document counts — คำนวณทุก request
- **Manual**: weekly, trend, proportion, comparison data — ดึงจาก DB (`DashboardStat` table) แล้วถ้าไม่มีใช้ fallback default

**เหตุผล:** แยกข้อมูลที่ต้อง real-time (stats) กับข้อมูลที่ user อัปเดตเอง (charts) — manual override auto เมื่อมีข้อมูลใน DB

### 2. Role-based View Filtering — Frontend

**เลือก:** ใช้ `hasMinRoleLevel()` ใน frontend เพื่อกรอง views ที่แสดง และส่ง `departmentId` ไป API

```tsx
const isDeanOrHigher = useHasMinRoleLevel(70);
const visibleViews = isDeanOrHigher ? ALL_VIEWS : ALL_VIEWS.filter(v => v.id !== "comparison");
```

**เหตุผล:** ไม่ต้อง round-trip server — UI ปรับทันที, API ก็กรองซ้ำอีกชั้นเพื่อความปลอดภัย

### 3. Department Filter — API Backend

**เลือก:** `GET /api/dashboard/stats?department=it` — API ตรวจสอบว่า user มีสิทธิ์ดู department นั้นหรือไม่

| Role | Can view |
|---|---|
| Dean+ (70+) | Any department |
| Dept Admin (50+) | Own department only |
| User (30+) | Own department only |
| Viewer (10+) | Aggregated only |

### 4. DashboardStat Model

**เลือก:** สร้าง Prisma model:

```prisma
model DashboardStat {
  id          String   @id @default(uuid())
  department  String   // "academic" | "it" | "support"
  statType    String   // "weekly" | "trend" | "proportion" | "comparison"
  month       String   // "2026-07"
  values      Json     // actual data points
  updatedBy   String?
  updatedAt   DateTime @updatedAt
  @@unique([department, statType, month])
}
```

### 5. Permission Codes

| Code | Level Required | Description |
|---|---|---|
| `DASHBOARD_VIEW` | 10+ (all) | View dashboard |
| `DASHBOARD_EDIT` | 50+ (Dept Admin+) | Edit dashboard data for authorized departments |
| `DASHBOARD_MANAGE_ACCESS` | 80+ (System Admin+) | Manage who can edit dashboard data |

## Risks / Trade-offs

- **[Risk] Auto-computed data may be slow with many records** → Mitigation: SWR cache 5 minutes, parallel queries
- **[Risk] DashboardStat table grows over time** → Mitigation: upsert pattern — one row per department+type+month
- **[Risk] Non-admin roles cannot see category colors because `/api/settings` requires SETTINGS_VIEW permission** → Mitigation: include `announcementCategories` (with id, name, color) in `/api/dashboard/stats` response — all authenticated users can access
