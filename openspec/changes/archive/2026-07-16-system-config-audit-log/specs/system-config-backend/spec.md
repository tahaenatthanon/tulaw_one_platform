## ADDED Requirements

### Requirement: Authentication Settings Persist to Database

ระบบ SHALL รองรับการเพิ่ม แก้ไข และปรับเปลี่ยนการตั้งค่า Authentication ทุกฟิลด์ (Session Timeout, JWT Expiry, Max Login Attempts, MFA Enforcement) โดยบันทึกลงฐานข้อมูล และการเปลี่ยนแปลงมีผลกับระบบทันที

#### Scenario: Save authentication settings

- **WHEN** ผู้ดูแลระบบแก้ไข Session Timeout, JWT Expiry, Max Login Attempts หรือ MFA Enforcement และกด Save
- **THEN** ระบบ SHALL ส่ง PUT ไปยัง `/api/settings?section=auth` และบันทึกลง `SystemConfig` table
- **AND** ค่าใหม่ SHALL มีผลกับระบบทันที

#### Scenario: Load authentication settings on page load

- **WHEN** ผู้ดูแลระบบเปิดแท็บ Authentication
- **THEN** ระบบ SHALL ดึงค่าจาก `GET /api/settings?section=auth` และแสดงในฟอร์ม

### Requirement: SSO/LDAP Settings Persist to Database

ระบบ SHALL รองรับการเพิ่ม แก้ไข และปรับเปลี่ยนการตั้งค่า SSO/LDAP ทุกฟิลด์ (LDAP URL, Base DN, Domain, Sync Interval, Enabled) โดยบันทึกลงฐานข้อมูล และการเปลี่ยนแปลงมีผลกับระบบทันที

#### Scenario: Save SSO/LDAP settings

- **WHEN** ผู้ดูแลระบบแก้ไข LDAP URL, Base DN, Domain, Sync Interval หรือ Enabled และกด Save
- **THEN** ระบบ SHALL ส่ง PUT ไปยัง `/api/settings?section=sso` และบันทึกลง `SystemConfig` table

#### Scenario: Load SSO/LDAP settings on page load

- **WHEN** ผู้ดูแลระบบเปิดแท็บ SSO/LDAP
- **THEN** ระบบ SHALL ดึงค่าจาก `GET /api/settings?section=sso` และแสดงในฟอร์ม

### Requirement: UI Branding Settings Persist to Database

ระบบ SHALL รองรับการอัปโหลดโลโก้ เปลี่ยนสีหลัก (Primary) เพิ่มธีมสีรอง (Secondary) และกำหนดรูปแบบการแสดงผล โดยบันทึกลงฐานข้อมูล และ CSS Variables อัปเดตทันที

#### Scenario: Upload logo

- **WHEN** ผู้ดูแลระบบอัปโหลดไฟล์โลโก้
- **THEN** ระบบ SHALL อัปโหลดไปยัง `/api/settings/upload-logo` และบันทึก path ใน `ThemeSetting` table
- **AND** โลโก้ใหม่ SHALL แสดงผลทันที

#### Scenario: Change primary color

- **WHEN** ผู้ดูแลระบบเปลี่ยนสี Primary และกด Save
- **THEN** ระบบ SHALL บันทึกลง `ThemeSetting` table
- **AND** CSS variable `--tu-primary` SHALL อัปเดตทันทีโดยไม่ต้องรีเฟรชหน้า

#### Scenario: Change secondary color

- **WHEN** ผู้ดูแลระบบเพิ่มหรือเปลี่ยนสี Secondary และกด Save
- **THEN** ระบบ SHALL บันทึกลง `ThemeSetting` table
- **AND** CSS variable `--tu-secondary` SHALL อัปเดตทันที

### Requirement: Storage Settings Persist to Database

ระบบ SHALL รองรับการกำหนดขนาดพื้นที่จัดเก็บสูงสุดต่อผู้ใช้ (Quota) และประเภทไฟล์ที่อนุญาต โดยบันทึกลงฐานข้อมูล และการเปลี่ยนแปลงมีผลกับระบบทันที

#### Scenario: Set storage quota

- **WHEN** ผู้ดูแลระบบกำหนดค่า Quota (GB) และกด Save
- **THEN** ระบบ SHALL บันทึกลง `SystemConfig` table
- **AND** การอัปโหลดไฟล์ของผู้ใช้ SHALL ถูกจำกัดตาม Quota ใหม่ทันที

#### Scenario: Set allowed file types

- **WHEN** ผู้ดูแลระบบเพิ่มหรือลบประเภทไฟล์ที่อนุญาตและกด Save
- **THEN** ระบบ SHALL บันทึกลง `SystemConfig` table
- **AND** การอัปโหลด SHALL ตรวจสอบตามรายการไฟล์ที่อนุญาตใหม่

### Requirement: API Keys Management with Real Backend

ระบบ SHALL รองรับการสร้าง (Create), หมุนเวียน (Rotate), ปิดใช้งาน (Disable) และลบ (Delete) API Key โดยดำเนินการผ่าน API จริงและมีผลทันที

#### Scenario: Create API Key

- **WHEN** ผู้ดูแลระบบกรอกชื่อ Client และกด Create
- **THEN** ระบบ SHALL สร้าง API Key ใหม่ผ่าน `POST /api/api-keys`
- **AND** แสดง Key แบบเต็มให้ผู้ดูแลระบบคัดลอกเพียงครั้งเดียว
- **AND** ระบบ SHALL เก็บเฉพาะ hash ของ key ในฐานข้อมูล

#### Scenario: Rotate API Key

- **WHEN** ผู้ดูแลระบบกด Rotate บน API Key ที่มีอยู่
- **THEN** ระบบ SHALL สร้าง Key ใหม่และ invalidate Key เก่าทันที

#### Scenario: Disable API Key

- **WHEN** ผู้ดูแลระบบกด Disable บน API Key
- **THEN** ระบบ SHALL ตั้ง `isActive: false` ผ่าน API
- **AND** Key นั้น SHALL ไม่สามารถใช้งานได้ทันที

#### Scenario: Delete API Key

- **WHEN** ผู้ดูแลระบบกด Delete บน API Key
- **THEN** ระบบ SHALL soft-delete Key ผ่าน API

### Requirement: Categories Management with Real Backend

ระบบ SHALL รองรับการเพิ่ม แก้ไข ลบ เปลี่ยนสี และปรับเปลี่ยนการตั้งค่าหมวดหมู่ (Announcement Categories, Project Categories) โดยบันทึกลงฐานข้อมูล และการเปลี่ยนแปลงมีผลทันที

#### Scenario: Add category

- **WHEN** ผู้ดูแลระบบเพิ่มหมวดหมู่ใหม่พร้อมชื่อและสี
- **THEN** ระบบ SHALL บันทึกลง `AnnouncementCategory` หรือ `ProjectType` table

#### Scenario: Edit category

- **WHEN** ผู้ดูแลระบบแก้ไขชื่อหรือสีของหมวดหมู่
- **THEN** ระบบ SHALL อัปเดตในฐานข้อมูลทันที

#### Scenario: Delete category

- **WHEN** ผู้ดูแลระบบลบหมวดหมู่
- **THEN** ระบบ SHALL ลบออกจากฐานข้อมูล (หรือ soft-delete ถ้ามีข้อมูลอ้างอิง)

### Requirement: Meeting Rooms Management with Real Backend

ระบบ SHALL รองรับการเพิ่ม แก้ไข และปรับเปลี่ยนข้อมูลห้องประชุมทุกฟิลด์ รวมถึงกำหนดสถานที่ โดยบันทึกลงฐานข้อมูล และการเปลี่ยนแปลงมีผลทันที

#### Scenario: Add meeting room

- **WHEN** ผู้ดูแลระบบเพิ่มห้องประชุมพร้อมชื่อ, ความจุ, สถานที่
- **THEN** ระบบ SHALL บันทึกลง `MeetingRoom` table
- **AND** ห้องใหม่ SHALL ปรากฏใน Book Meeting ทันที

#### Scenario: Edit meeting room

- **WHEN** ผู้ดูแลระบบแก้ไขข้อมูลห้องประชุม
- **THEN** ระบบ SHALL อัปเดตในฐานข้อมูลทันที

### Requirement: App Status Management with Real Backend

ระบบ SHALL รองรับการเปิด/ปิด และปรับเปลี่ยนสถานะการใช้งานของแต่ละระบบ โดยบันทึกลงฐานข้อมูล และการเปลี่ยนแปลงมีผลทันที

#### Scenario: Toggle app status

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะแอปพลิเคชันเป็น "maintenance"
- **THEN** ระบบ SHALL อัปเดตใน `Application` table
- **AND** Application Hub SHALL แสดง badge "maintenance" ทันที

#### Scenario: Enable disabled app

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะจาก "maintenance" เป็น "active"
- **THEN** ระบบ SHALL อัปเดตในฐานข้อมูล
- **AND** แอปพลิเคชัน SHALL กลับมาใช้งานได้ทันที

### Requirement: Data Persistence — System Configuration

การเพิ่ม (Create), แก้ไข (Update) และลบ (Delete) ข้อมูลทุกส่วนของ System Configuration SHALL บันทึกข้อมูลลงแหล่งข้อมูลจริง (Persistent Storage) และมีผลกับระบบจริง

#### Scenario: Settings persist after page refresh

- **WHEN** ผู้ดูแลระบบแก้ไขการตั้งค่าใดๆ กด Save แล้วรีเฟรชหน้าเว็บ
- **THEN** ค่าที่แก้ไข SHALL ยังคงอยู่ตามที่บันทึกไว้ ไม่ใช่ค่า default

#### Scenario: Editable fields update real data

- **WHEN** ผู้ดูแลระบบแก้ไขค่าในช่องกรอกใดๆ และกด Save
- **THEN** ระบบ SHALL ส่งค่าผ่าน API และบันทึกลงฐานข้อมูลจริง
- **AND** ไม่ใช่เพียงเปลี่ยนค่าใน Local State หรือหน้าจอเท่านั้น

#### Scenario: Updated data visible everywhere

- **WHEN** การดำเนินการสำเร็จ
- **THEN** ระบบ SHALL แสดงข้อมูลล่าสุดทันทีในทุกหน้าหรือส่วนที่เกี่ยวข้อง

#### Scenario: Data survives logout and login

- **WHEN** ผู้ดูแลระบบแก้ไขการตั้งค่า Logout แล้ว Login ใหม่
- **THEN** ข้อมูลที่แก้ไข SHALL ยังคงอยู่
