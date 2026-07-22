## 1. Settings — ลบ 3 tabs (categories, rooms, app-status)

- [x] 1.1 ลบ `categories`, `rooms`, `app-status` ออกจาก `TABS` array ใน `settings/page.tsx`
- [x] 1.2 ลบ components ที่เกี่ยวข้อง: CategoriesTab, RoomsTab, AppStatusTab (ถ้ามี)
- [x] 1.3 คง logic `storage.annCats`, `storage.projCats` ไว้ใน StorageTab

## 2. Application Hub — ปุ่มจัดการสถานะแอป

- [x] 2.1 เพิ่มปุ่ม "จัดการสถานะแอป" ใน header toolbar (เฉพาะผู้มีสิทธิ์)
- [x] 2.2 สร้าง AppStatusModal — แสดง 5 apps พร้อม dropdown เลือก status
- [x] 2.3 Save: PUT all statuses ไป `/api/settings/app-status`
- [x] 2.4 Refresh Application Hub หลัง save (mutate SWR)

## 3. Intranet — ปุ่มจัดการประเภทประกาศ

- [x] 3.1 เพิ่มปุ่ม "จัดการประเภทประกาศ" ใน header toolbar (เฉพาะ INTRANET_CREATE)
- [x] 3.2 สร้าง CategoryModal — แสดงรายการ categories, input ชื่อ + color picker, add/edit/delete
- [x] 3.3 Save: PATCH `/api/settings` (annCats)
- [x] 3.4 Refresh categories หลัง save

## 4. Book Meeting — ปุ่มจัดการห้องประชุม

- [x] 4.1 เพิ่มปุ่ม "จัดการห้องประชุม" ใน header toolbar (เฉพาะ BOOK_MEETING_APPROVE)
- [x] 4.2 สร้าง RoomModal — แสดงรายการ rooms, input ชื่อ/ความจุ/สถานที่, add/edit/delete
- [x] 4.3 Save: POST/PUT/DELETE `/api/book-meeting/rooms`
- [x] 4.4 Refresh rooms หลัง save

## 5. Projects — ปุ่มจัดการประเภทโครงการ

- [x] 5.1 เพิ่มปุ่ม "จัดการประเภทโครงการ" ใน header toolbar (เฉพาะ PROJECTS_MANAGE_ALL)
- [x] 5.2 สร้าง ProjectTypeModal — แสดงรายการ types, input ชื่อ, add/edit/delete
- [x] 5.3 สร้าง API route `/api/projects/types` (GET/POST/PUT/DELETE)
- [x] 5.4 Refresh project types + Settings หลัง save

## 6. ตรวจสอบความถูกต้อง

- [x] 6.1 ทดสอบ: App Status modal — เปลี่ยน status ได้, refresh แสดงผลทันที
- [x] 6.2 ทดสอบ: Category modal — เพิ่ม/ลบ/แก้ไข ได้, สีแสดงถูกต้อง
- [x] 6.3 ทดสอบ: Room modal — เพิ่ม/ลบ/แก้ไข ได้, ข้อมูลถูกต้อง
- [x] 6.4 ทดสอบ: Project Type modal — เพิ่ม/ลบ/แก้ไข ได้, types ใน dropdown โปรเจกต์อัปเดต
- [x] 6.5 ทดสอบ: Settings tabs `categories`, `rooms`, `app-status` ไม่อยู่แล้ว
- [x] 6.6 ทดสอบ: Real-time sync — ทุก modal หลัง save ข้อมูลแสดงผลทันทีโดยไม่ต้องรีเฟรชหน้า
- [x] 6.7 ทดสอบ: Cross-module consistency — เปลี่ยนข้อมูลใน modal → สะท้อนในโมดูลอื่น (เช่น เปลี่ยน categories → แสดงใน Intranet + Settings)
