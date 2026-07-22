## Why

ระบบ Dashboard ปัจจุบันใช้ข้อมูล mock/hardcoded และแสดงเหมือนกันทุก role — ไม่มีการกรองข้อมูลตามแผนก, ไม่มีการกำหนดสิทธิ์การแสดงผล, ไม่มีระบบให้ผู้ใช้งานอัปเดตข้อมูลด้วยตนเอง, และประกาศสำคัญควรแสดงเหมือนกันทุก role แต่ปัจจุบันดึงจาก API จริงโดยไม่คำนึงถึง RBAC data scope ต้องการปรับ Dashboard ให้เป็นระบบที่ขับเคลื่อนด้วยข้อมูลจริง ควบคุมด้วย RBAC และรองรับการอัปเดตข้อมูลจากผู้ใช้งานตามสิทธิ์

## What Changes

### ด้านสิทธิ์การเข้าถึง (RBAC Data Scope)
- **ผู้บริหาร (Dean 70+)**: เห็นข้อมูล Dashboard ทั้งหมดทุกแผนก (Overview, Weekly, Trend, Proportion, Comparison)
- **หัวหน้าแผนก (Dept Admin 50+)**: เห็นข้อมูลเฉพาะแผนกตนเอง — charts, stats, activity logs ทั้งหมดกรองตาม department
- **ผู้ใช้งาน (User 30+)**: เห็นข้อมูลภาพรวมบางส่วน + ข้อมูลแผนกตนเอง — ไม่เห็น Comparison view
- **Viewer (10+)**: เห็นเฉพาะ Overview + Weekly, ข้อมูลจำกัด, ไม่เห็น department-specific details

### ด้านการอัปเดตข้อมูล Dashboard
- สร้าง Route Handler `PUT /api/dashboard/stats` สำหรับผู้ที่ได้รับสิทธิ์อัปเดตข้อมูลของแผนกตนเอง
- เมื่ออัปเดตและบันทึก ระบบรีเฟรชข้อมูลใหม่ให้อัตโนมัติ (SWR revalidate)
- รองรับการแก้ไขข้อมูลย้อนหลังรายเดือนตามสิทธิ์ (Dept Admin+ แก้ไขของแผนกตัวเอง, Dean+ แก้ไขทุกแผนก)

### ด้านการจัดการสิทธิ์ (System Admin)
- `GET/PUT /api/dashboard/permissions` — กำหนดสิทธิ์การแสดงผล Dashboard ให้ผู้ใช้งาน
- กำหนดสิทธิ์การแก้ไขข้อมูล Dashboard ของแต่ละแผนก

### ชนิดของ Dashboard Data
- **ข้อมูลอัตโนมัติจาก TULAW ONE Platform**: org stats (personnel, active users, documents, projects, bookings) — อัปเดตอัตโนมัติ
- **ข้อมูลจากผู้ใช้งานแต่ละแผนก**: weekly activity, trend data — ผู้มีสิทธิ์อัปเดตเอง
- **ข้อมูลจากระบบ Project Management**: project counts — อัปเดตอัตโนมัติ
- **ข้อมูลจากระบบจัดเก็บเอกสาร**: document counts — อัปเดตอัตโนมัติ

### ประกาศสำคัญ
- ประกาศสำคัญแสดงเหมือนกันทุก role — ไม่กรองตาม department
- หมวดหมู่ประกาศ (announcement categories) ต้องแสดงสีให้ทุก role เห็น — ดึงจาก `/api/dashboard/stats` โดยตรง (ไม่ใช้ `/api/settings` ที่ต้องสิทธิ์ admin)
- คง logic เดิมจาก `AnnouncementsCard` + `/api/dashboard/stats`

## Capabilities

### New Capabilities
- `dashboard-rbac-scope`: ระบบสิทธิ์การแสดงผล Dashboard ตาม RBAC data scope — กรองข้อมูลตามบทบาทและแผนก, แสดง/ซ่อน views ตาม role level
- `dashboard-data-management`: ระบบจัดการข้อมูล Dashboard — อัปเดตข้อมูลรายเดือนตามสิทธิ์, admin กำหนดสิทธิ์การแก้ไข, แยกข้อมูลอัตโนมัติและ manual

### Modified Capabilities
- `rbac-role-definitions`: เพิ่ม data scope สำหรับ Dashboard — ระบุว่าแต่ละ role เห็นข้อมูลระดับใด (all/dept/self)
- `rbac-module-permissions`: เพิ่ม permission codes `DASHBOARD_EDIT` และ `DASHBOARD_MANAGE_ACCESS`

## Impact

- **`app/(dashboard)/dashboard/page.tsx`**: ปรับ UI ให้ดึงข้อมูลตาม department + role, ซ่อน views ตาม role, เพิ่ม Edit mode สำหรับผู้มีสิทธิ์
- **`app/api/dashboard/stats/route.ts`** (แก้ไข): GET กรองตาม department/role, PUT สำหรับอัปเดตข้อมูล
- **`app/api/dashboard/permissions/route.ts`** (ใหม่): จัดการสิทธิ์ Dashboard
- **`lib/data-scope.ts`** (มีอยู่แล้ว): ใช้ฟังก์ชัน `getDataScope` กรองข้อมูลตาม role
- **`lib/permissions.ts`**: เพิ่ม permission codes `DASHBOARD_EDIT`, `DASHBOARD_MANAGE_ACCESS`
- **`prisma/schema.prisma`**: (อาจจำเป็น) เพิ่ม model `DashboardStat`, `DashboardPermission` สำหรับเก็บข้อมูล manual
- **API**: คง existing endpoints — เพิ่ม PUT และ permissions routes
