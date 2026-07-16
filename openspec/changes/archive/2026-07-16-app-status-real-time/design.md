## Context

Application Hub (`/application-hub`) แสดง 5 แอปพลิเคชัน (ERP, E-Office, Document Management, Academic, HR) ในรูปแบบ Grid/List View โดยใช้ `appGroups` Array แบบ Hardcoded — ทุกแอปมี `online: true` สถานะไม่เชื่อมต่อกับ Settings Page

Settings App Status tab (`/settings?tab=app-status`) ดึงข้อมูลจาก `GET /api/settings/app-status` และอัปเดตผ่าน `PUT /api/settings/app-status` โดยใช้ `Application` table ใน DB

## Goals / Non-Goals

**Goals:**
- Application Hub ดึงสถานะแอปพลิเคชันจาก API (ไม่ใช้ Hardcoded)
- แสดง Status Indicator (Online/Maintenance/Offline) บนไอคอนแอปพลิเคชัน
- การเปลี่ยนสถานะใน Settings → มีผลใน Application Hub แบบ Real-time
- บันทึก `APP_STATUS_CHANGE` ใน Audit Log ทุกครั้งที่เปลี่ยนสถานะ

**Non-Goals:**
- ไม่เปลี่ยนโครงสร้าง UI หรือ layout ของ Application Hub
- ไม่เพิ่ม/ลดจำนวนแอปพลิเคชันที่แสดง
- ไม่เปลี่ยน API endpoints (ใช้ของเดิม)

## Decisions

### 1. Data Source: Single API

**เลือก:** Application Hub ใช้ `useSWR("/api/settings/app-status")` ดึงสถานะจาก API — source เดียวกันกับ Settings
**กลไก:**
```ts
const { data: apps } = useSWR("/api/settings/app-status", swrFetcher);
const statusMap = new Map(apps.map(a => [a.id, a.status]));
```
**เหตุผล:** Single source of truth, ไม่ต้องสร้าง endpoint ใหม่, เมื่อ Settings Save → `mutate()` → Hub refetch

### 2. Status Indicator UI

**เลือก:** เพิ่ม colored dot บนไอคอนแอปพลิเคชัน
```
┌──────────────┐
│  🧮  ERP      │  🟢 Online
│  📄  E-Office │  🟡 Maintenance
│  📁  Documents│  🔴 Offline
└──────────────┘
```
**CSS:** `absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white`
- Online: `bg-tu-success`
- Maintenance: `bg-tu-warning animate-pulse`
- Offline: `bg-tu-error`

### 3. Real-time Sync Strategy

**เลือก:** ใช้ SWR default revalidation — เมื่อ user focus window หรือ navigate ไป Hub → SWR re-fetches → สถานะอัปเดต
**ทางเลือกที่พิจารณา:** WebSocket/SSE → overkill สำหรับ use case นี้

### 4. Audit Log Pattern

**เลือก:** ใน `PUT /api/settings/app-status` → อ่าน old status ก่อน → เปลี่ยน → `logAction(adminId, "settings", "APP_STATUS_CHANGE", { entityType: "Application", entityId, oldValue: oldStatus, newValue: newStatus })`

## Risks / Trade-offs

- **SWR cache delay:** อาจมี delay สูงสุด ~revalidate interval → ใช้ `mutate()` ทันทีหลัง Save ใน Settings
- **Status inconsistency:** ถ้า DB update แต่ Hub ยังไม่ re-fetch → ผู้ใช้เห็นสถานะเก่า → แสดง loading state ระหว่าง re-fetch
