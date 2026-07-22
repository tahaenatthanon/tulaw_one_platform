## Context

4 โมดูลต้องการปุ่มจัดการแบบ inline พร้อม modal CRUD — แทนที่การจัดการผ่านหน้า Settings เดิม การออกแบบใช้ pattern เดียวกัน: ปุ่มใน header toolbar → modal form → API call → refresh

## Goals / Non-Goals

**Goals:**
- Application Hub: ปุ่ม "จัดการสถานะแอป" → modal แสดง 5 apps พร้อม radio/select เปลี่ยน status (online/maintenance/offline) → PUT `/api/settings/app-status`
- Intranet: ปุ่ม "จัดการประเภทประกาศ" (เฉพาะผู้มีสิทธิ์ INTRANET_MANAGE) → modal CRUD — เพิ่ม, ลบ, แก้ไข (ชื่อ, สี) → PATCH `/api/settings` (storage.annCats)
- Book Meeting: ปุ่ม "จัดการห้องประชุม" (เฉพาะผู้มีสิทธิ์ BOOK_MEETING_APPROVE) → modal CRUD — เพิ่ม, ลบ, แก้ไข (ชื่อ, ความจุ, สถานที่) → PUT/POST/DELETE `/api/book-meeting/rooms`
- Projects: ปุ่ม "จัดการประเภทโครงการ" (เฉพาะผู้มีสิทธิ์ PROJECTS_MANAGE_ALL) → modal CRUD — เพิ่ม, ลบ, แก้ไข (ชื่อ) → PUT/POST/DELETE `/api/projects/types`
- **Real-time sync**: ทุก modal ต้องเรียก `mutate()` (SWR revalidate) หลัง API สำเร็จ — ข้อมูลแสดงผลทันทีโดยไม่ต้องรีเฟรช
- **Cross-module consistency**: ข้อมูลที่เปลี่ยนแปลง (เช่น categories, project types, rooms) ต้อง sync ระหว่างโมดูล — ใช้ shared data source (Settings API, SWR cache)
- Settings: ลบ 3 tabs — `categories`, `rooms`, `app-status`

**Non-Goals:**
- ไม่เปลี่ยน logic การทำงานของ Settings tabs ที่เหลือ (auth, sso, branding, storage, api-keys)
- ไม่เปลี่ยนฟังก์ชันหลักของแต่ละโมดูล

## Decisions

### 1. Modal pattern: single reusable pattern

**ตัดสินใจ**: ทุก modal ใช้โครงสร้างเดียวกัน — gradient header (หรือ flat), form fields, save/cancel buttons, loading/error states — ตามมาตรฐาน UI ของแพลตฟอร์ม

### 2. API endpoints

**ตัดสินใจ**:
- App status: ใช้ `/api/settings/app-status` (GET/PUT) ที่มีอยู่แล้ว — ปรับ PUT ให้รับ array ทั้งหมด
- Announcement categories: ใช้ `PATCH /api/settings` เพื่ออัปเดตเฉพาะ `storage.annCats`
- Meeting rooms: ใช้ `/api/book-meeting/rooms` (GET/POST/PUT/DELETE) ที่มีอยู่แล้ว
- Project types: สร้าง `/api/projects/types` ใหม่ (GET/POST/PUT/DELETE)

### 3. Settings tabs cleanup

**ตัดสินใจ**: ลบ `categories`, `rooms`, `app-status` ออกจาก `TABS` array + ลบ components ที่เกี่ยวข้อง — แต่คง logic `storage.projCats` และ `storage.annCats` ไว้ใน Settings

### 4. Real-time sync: SWR mutate() after every mutation

**ตัดสินใจ**: ทุก modal — หลัง API สำเร็จ เรียก `mutate()` บน SWR key ที่เกี่ยวข้อง — `mutate()` triggers re-fetch ทำให้ข้อมูลใน UI อัปเดตทันทีโดยไม่ต้องรีเฟรชหน้า

**เหตุผล**:
- SWR `mutate()` เรียก revalidation — ข้อมูล refresh ทันที
- Pattern เดียวกันที่ใช้แล้วใน Book Meeting, Projects, Intranet, Documents
- Cross-module consistency: ข้อมูลจาก Settings (categories, app status) ใช้ key เดียวกัน — mutate ที่จุดใดจุดหนึ่ง → อัปเดตทุกที่ที่ใช้ key นั้น

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| API route handler ยังไม่ได้สร้าง | สร้าง route handler สำหรับ project types; อัปเดต settings PATCH |
