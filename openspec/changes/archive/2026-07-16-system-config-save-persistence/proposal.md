## Why

หน้า System Configuration ปัจจุบันใช้ Auto-Save (debounce 600ms) ซึ่งทำให้ทุกการกดแป้นพิมพ์ส่ง API request ทันที ส่งผลให้เกิดปัญหา: (1) เขียนค่าที่ไม่สมบูรณ์ลง DB ระหว่างพิมพ์, (2) API call ถี่เกินไปโดยไม่จำเป็น, (3) ผู้ใช้ไม่สามารถยกเลิกการเปลี่ยนแปลงได้ ระบบต้องการเปลี่ยนกลับเป็น Explicit Save — ผู้ใช้ต้องกดปุ่ม **Save** เพื่อยืนยันการบันทึก และต้องรับประกันว่าทุกฟิลด์ทำงานถูกต้อง พร้อม Persistence เต็มรูปแบบ (DB, Refresh, Logout/Login)

## What Changes

### System Configuration — Explicit Save
- **เปลี่ยนจาก Auto-Save เป็น Explicit Save:** การเปลี่ยนแปลงค่าทั้งหมดจะยังไม่มีผลจนกว่าผู้ใช้จะกดปุ่ม **Save**
- **Save Button:** แสดงปุ่ม Save เมื่อมีการเปลี่ยนแปลง (dirty state) และซ่อนเมื่อยังไม่มีการเปลี่ยนแปลง
- **Save → Persistent Storage:** เมื่อกด Save สำเร็จ ระบบบันทึกข้อมูลลง `SystemConfig` table ผ่าน `PUT /api/settings`
- **Refresh Persistence:** หลังบันทึกสำเร็จ การรีเฟรชหน้าเว็บต้องแสดงค่าล่าสุดที่บันทึกไว้
- **Logout/Login Persistence:** ค่าที่บันทึกไว้ต้องคงอยู่หลังออกจากระบบและเข้าสู่ระบบใหม่
- **Cancel on No Save:** หากยังไม่ได้กด Save การเปลี่ยนแปลงต้องไม่ถูกบันทึก (เปลี่ยน tab หรือออกจากหน้าโดยไม่ Save → ค่าเดิม)

### System Configuration — Fields Coverage
- **Authentication:** Session Timeout, JWT Expiry, Max Login Attempts, MFA Enforcement — ทุกฟิลด์แก้ไขได้และบันทึกได้
- **SSO/LDAP:** LDAP URL, Base DN, Domain, Sync Interval, Enabled — ทุกฟิลด์แก้ไขได้และบันทึกได้
- **UI Branding:** อัปโหลดโลโก้, เปลี่ยนชื่อระบบ, เปลี่ยนสีหลัก (Primary), เปลี่ยนสีรอง (Secondary), CSS Variables อัปเดตทันทีหลัง Save
- **Storage:** กำหนด Storage Quota (GB), เพิ่ม/ลบ Allowed File Types — บันทึกได้
- **Categories:** เพิ่ม/แก้ไข/ลบ/เปลี่ยนสี หมวดหมู่ประกาศและหมวดหมู่โครงการ — บันทึกลง DB จริง (Persist Data) และใช้งานได้ทันทีใน Intranet และ Project Management โดยหมวดหมู่ประกาศที่เพิ่มหรือแก้ไขต้องอัปเดตและแสดงในหน้า Intranet ทันที หมวดหมู่โครงการที่เพิ่มหรือแก้ไขต้องอัปเดตและแสดงในหน้า Projects ทันที การแก้ไขหรือลบหมวดหมู่ต้องอัปเดตข้อมูลในทุกโมดูลที่เกี่ยวข้องโดยอัตโนมัติ หลังจากกด Save สำเร็จ การรีเฟรชหน้าเว็บต้องยังคงแสดงหมวดหมู่ล่าสุดที่บันทึกไว้
- **Meeting Rooms:** เพิ่ม/แก้ไข/ลบ ห้องประชุม — บันทึกลง `MeetingRoom` table
- **App Status:** เปิด/ปิดสถานะของแต่ละ Application — บันทึกลง `Application` table

## Capabilities

### New Capabilities

- `system-config-save-persistence`: ระบบ Save & Persistence สำหรับ System Configuration — เปลี่ยนจาก Auto-Save เป็น Explicit Save รับประกันว่าทุกฟิลด์บันทึกได้ ข้อมูลคงอยู่หลังรีเฟรชและ Logout/Login

### Modified Capabilities

- `system-config-backend`: แก้ไขพฤติกรรมการบันทึกจาก Auto-Save เป็น Explicit Save พร้อมเพิ่มข้อกำหนดเรื่องการยกเลิกการเปลี่ยนแปลงเมื่อไม่ได้กด Save และการคงอยู่ของข้อมูลหลัง Logout/Login

## Impact

- **Frontend:** `app/(dashboard)/settings/page.tsx` — ลบ auto-save logic, เพิ่ม Save button + dirty state, รับประกันทุกฟิลด์ทำงาน; `app/(dashboard)/intranet/page.tsx` และ `app/(dashboard)/projects/page.tsx` — อ่านหมวดหมู่จาก API จริง (ดึงจาก `SystemConfig` หรือ dedicated endpoint) เพื่อแสดงผลล่าสุด
- **API:** ไม่มีเปลี่ยนแปลง (ใช้ `PUT /api/settings` เดิม); Intranet/Projects ใช้ `GET /api/settings` เพื่ออ่านหมวดหมู่
- **Database:** ไม่มี schema เปลี่ยนแปลง
- **Dependencies:** Intranet ต้องอ่าน `AnnouncementCategory` จาก `SystemConfig` หรือ API; Projects ต้องอ่าน `ProjectType` จาก `SystemConfig` หรือ API
