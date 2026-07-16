## ADDED Requirements

### Requirement: Explicit Save — Changes Deferred Until Save

การเปลี่ยนแปลงค่าการตั้งค่าทั้งหมดใน System Configuration SHALL ยังไม่มีผลจนกว่าผู้ใช้จะกดปุ่ม **Save**

#### Scenario: Changes not saved until Save button clicked

- **WHEN** ผู้ใช้แก้ไขค่าใดๆ ในฟอร์ม Settings โดยยังไม่ได้กด Save
- **THEN** ค่าในฐานข้อมูล SHALL ยังคงเป็นค่าเดิม
- **AND** ระบบ SHALL แสดงปุ่ม Save เพื่อให้ผู้ใช้ยืนยัน

#### Scenario: Save button commits all changes

- **WHEN** ผู้ใช้กดปุ่ม Save หลังจากแก้ไขค่าในฟอร์ม
- **THEN** ระบบ SHALL ส่ง PUT `/api/settings` พร้อมค่าทั้งหมดจากทุก section
- **AND** บันทึกลง `SystemConfig` table
- **AND** แสดงข้อความ "บันทึกสำเร็จ"

#### Scenario: Unsaved changes discarded on tab switch

- **WHEN** ผู้ใช้แก้ไขค่าในแท็บ Authentication โดยยังไม่ได้กด Save แล้วเปลี่ยนไปแท็บ SSO/LDAP
- **THEN** ค่าที่แก้ไขในแท็บ Authentication SHALL ยังคงอยู่ในฟอร์ม (ไม่หาย)
- **AND** ผู้ใช้สามารถกลับมาแก้ไขต่อและกด Save ได้

#### Scenario: Unsaved changes discarded on page leave

- **WHEN** ผู้ใช้แก้ไขค่าโดยยังไม่ได้กด Save และพยายามออกจากหน้า (เปลี่ยน route หรือปิด browser)
- **THEN** ระบบ SHALL แสดงคำเตือนว่ามีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก

### Requirement: Save Persistence — Refresh and Logout

เมื่อกด Save สำเร็จ ข้อมูล SHALL คงอยู่หลังจากรีเฟรชหน้าเว็บ และหลังจากออกจากระบบและเข้าสู่ระบบใหม่

#### Scenario: Data persists after page refresh

- **WHEN** ผู้ใช้กด Save สำเร็จ แล้วรีเฟรชหน้าเว็บ
- **THEN** ฟอร์ม Settings SHALL แสดงค่าล่าสุดที่บันทึกไว้ (ดึงจาก API → DB)

#### Scenario: Data persists after logout and login

- **WHEN** ผู้ใช้กด Save สำเร็จ แล้วออกจากระบบ และเข้าสู่ระบบใหม่
- **THEN** ฟอร์ม Settings SHALL แสดงค่าที่บันทึกไว้ก่อนออกจากระบบ

#### Scenario: No unsaved banner after save

- **WHEN** ผู้ใช้กด Save สำเร็จ
- **THEN** Save Banner SHALL หายไป (dirty = false)
- **AND** ไม่มีการแจ้งเตือนว่ายังไม่ได้บันทึก

### Requirement: Save Button Visibility

ระบบ SHALL แสดงปุ่ม Save เมื่อมีการเปลี่ยนแปลง (dirty state) และซ่อนเมื่อยังไม่มีการเปลี่ยนแปลงหรือบันทึกสำเร็จแล้ว

#### Scenario: Save button appears on change

- **WHEN** ผู้ใช้แก้ไขค่าใดๆ ในฟอร์ม
- **THEN** ปุ่ม Save SHALL ปรากฏที่ด้านบนของหน้า

#### Scenario: Save button hidden after successful save

- **WHEN** ผู้ใช้กด Save และการบันทึกสำเร็จ
- **THEN** ปุ่ม Save SHALL หายไป (dirty = false)

#### Scenario: Save button hidden when no changes

- **WHEN** ผู้ใช้เปิดหน้า Settings โดยยังไม่ได้แก้ไขอะไร
- **THEN** ปุ่ม Save SHALL ไม่แสดง

### Requirement: All Editable Fields Functional

ทุกฟิลด์ที่แก้ไขได้ใน System Configuration ทุกแท็บ SHALL สามารถแก้ไขและบันทึกได้จริง

#### Scenario: Authentication fields

- **WHEN** ผู้ใช้แก้ไข Session Timeout, JWT Expiry, Max Login Attempts หรือ MFA Enforcement
- **THEN** ทุกฟิลด์ SHALL แก้ไขได้ และค่าที่แก้ไข SHALL ถูกส่งไปยัง API เมื่อกด Save

#### Scenario: SSO/LDAP fields

- **WHEN** ผู้ใช้แก้ไข LDAP URL, Base DN, Domain, Sync Interval หรือ Enabled
- **THEN** ทุกฟิลด์ SHALL แก้ไขได้ และค่าที่แก้ไข SHALL ถูกส่งไปยัง API เมื่อกด Save

#### Scenario: Branding fields

- **WHEN** ผู้ใช้เปลี่ยนชื่อระบบ เปลี่ยนสีหลัก เปลี่ยนสีรอง หรืออัปโหลดโลโก้
- **THEN** ทุกฟิลด์ SHALL แก้ไขได้ และ CSS variables SHALL อัปเดตหลัง Save

#### Scenario: Storage fields

- **WHEN** ผู้ใช้กำหนด Storage Quota หรือเพิ่ม/ลบ Allowed File Types
- **THEN** ทุกฟิลด์ SHALL แก้ไขได้ และค่าที่แก้ไข SHALL ถูกส่งไปยัง API เมื่อกด Save

### Requirement: Categories CRUD with Real Persistence

ระบบ SHALL รองรับการเพิ่ม แก้ไข ลบ และเปลี่ยนสีหมวดหมู่ประกาศและหมวดหมู่โครงการ โดยบันทึกลงฐานข้อมูลจริงและสามารถใช้งานได้ทันทีในทุกระบบที่เกี่ยวข้อง

#### Scenario: Add announcement category

- **WHEN** ผู้ใช้เพิ่มหมวดหมู่ประกาศใหม่พร้อมชื่อและสี แล้วกด Save
- **THEN** หมวดหมู่ใหม่ SHALL ถูกบันทึกลง `SystemConfig` table ภายใต้ key `storage.annCats`
- **AND** สามารถใช้งานในระบบ Intranet ได้ทันที
- **AND** ข้อมูล SHALL คงอยู่หลังรีเฟรช

#### Scenario: Add project category

- **WHEN** ผู้ใช้เพิ่มหมวดหมู่โครงการใหม่พร้อมชื่อและสี แล้วกด Save
- **THEN** หมวดหมู่ใหม่ SHALL ถูกบันทึกลง `SystemConfig` table ภายใต้ key `storage.projCats`
- **AND** สามารถใช้งานในระบบ Project Management ได้ทันที

#### Scenario: Edit category

- **WHEN** ผู้ใช้แก้ไขชื่อหรือสีของหมวดหมู่ประกาศหรือโครงการ แล้วกด Save
- **THEN** การเปลี่ยนแปลง SHALL ถูกบันทึกลงฐานข้อมูลและมีผลทันทีทั่วทั้งระบบ

#### Scenario: Delete category

- **WHEN** ผู้ใช้ลบหมวดหมู่ประกาศหรือโครงการ แล้วกด Save
- **THEN** หมวดหมู่ SHALL ถูกลบออกจากฐานข้อมูล
- **AND** หมวดหมู่ที่ถูกลบ SHALL ไม่ปรากฏในระบบ Intranet หรือ Project Management อีกต่อไป

#### Scenario: Categories reorder reflects immediately

- **WHEN** ผู้ใช้เพิ่ม แก้ไข หรือลบหมวดหมู่แล้วกด Save
- **THEN** รายการหมวดหมู่ใน Intranet และ Project Management SHALL อัปเดตทันทีตามข้อมูลล่าสุดจากฐานข้อมูล

#### Scenario: Announcement categories update in Intranet after save

- **WHEN** ผู้ใช้เพิ่มหรือแก้ไขหมวดหมู่ประกาศใน Settings และกด Save
- **THEN** หมวดหมู่ใหม่ที่เพิ่มหรือแก้ไข SHALL ปรากฏในหน้า Intranet ทันที (เมื่อเข้า Intranet ใหม่หรือรีเฟรช)
- **AND** ระบบ Intranet SHALL อ่านข้อมูลจาก `GET /api/settings` → `storage.annCats`

#### Scenario: Project categories update in Projects after save

- **WHEN** ผู้ใช้เพิ่มหรือแก้ไขหมวดหมู่โครงการใน Settings และกด Save
- **THEN** หมวดหมู่ใหม่ที่เพิ่มหรือแก้ไข SHALL ปรากฏในหน้า Projects ทันที (เมื่อเข้า Projects ใหม่หรือรีเฟรช)
- **AND** ระบบ Projects SHALL อ่านข้อมูลจาก `GET /api/settings` → `storage.projCats`

#### Scenario: Deleted category removed from all modules

- **WHEN** ผู้ใช้ลบหมวดหมู่ใน Settings และกด Save
- **THEN** หมวดหมู่ที่ถูกลบ SHALL ไม่ปรากฏใน Intranet, Projects และทุกโมดูลที่เกี่ยวข้องอีกต่อไป

#### Scenario: Categories persist after refresh

- **WHEN** ผู้ใช้เพิ่มหรือแก้ไขหมวดหมู่ใน Settings กด Save แล้วรีเฟรชหน้า Settings, Intranet หรือ Projects
- **THEN** หมวดหมู่ล่าสุดที่บันทึกไว้ SHALL ยังคงแสดงผลถูกต้องในทุกหน้า

### Requirement: App Status Toggle with Real Persistence

ระบบ SHALL รองรับการเปิด/ปิดสถานะการใช้งานของแต่ละ Application โดยบันทึกลง `Application` table และแสดงผลใน Application Hub ทันที

#### Scenario: Toggle app to maintenance

- **WHEN** ผู้ใช้เปลี่ยนสถานะแอปพลิเคชันเป็น "maintenance" และกด Save
- **THEN** Application Hub SHALL แสดง badge "maintenance" บนแอปพลิเคชันนั้น

#### Scenario: Toggle app back to active

- **WHEN** ผู้ใช้เปลี่ยนสถานะจาก "maintenance" เป็น "active" และกด Save
- **THEN** แอปพลิเคชัน SHALL กลับมาแสดงสถานะปกติใน Application Hub
