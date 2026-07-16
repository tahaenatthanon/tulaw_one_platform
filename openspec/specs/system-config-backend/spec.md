# System Config Backend

## Purpose

TBD — Backend persistence and API specifications for System Configuration module.

## Requirements

### Requirement: Authentication Settings Persist to Database

ระบบ SHALL รองรับการเพิ่ม แก้ไข และปรับเปลี่ยนการตั้งค่า Authentication ทุกฟิลด์ (Session Timeout, JWT Expiry, Max Login Attempts, MFA Enforcement) โดยการเปลี่ยนแปลง SHALL ยังไม่มีผลจนกว่าผู้ใช้จะกดปุ่ม Save เมื่อกด Save ระบบ SHALL บันทึกค่าลง `SystemConfig` table และข้อมูล SHALL คงอยู่หลังรีเฟรชและ Logout/Login

#### Scenario: Save authentication settings

- **WHEN** ผู้ดูแลระบบแก้ไข Session Timeout, JWT Expiry, Max Login Attempts หรือ MFA Enforcement และกด Save
- **THEN** ระบบ SHALL ส่ง PUT `/api/settings` และบันทึกลง `SystemConfig` table
- **AND** ค่าใหม่ SHALL มีผลกับระบบทันที
- **AND** หากยังไม่ได้กด Save การเปลี่ยนแปลง SHALL ไม่ถูกบันทึก

#### Scenario: Load authentication settings on page load

- **WHEN** ผู้ดูแลระบบเปิดแท็บ Authentication
- **THEN** ระบบ SHALL ดึงค่าจาก `GET /api/settings` และแสดงในฟอร์ม
- **AND** หลังจาก Save และรีเฟรช ค่า SHALL ยังคงเป็นค่าที่บันทึกไว้ล่าสุด

### Requirement: SSO/LDAP Settings Persist to Database

ระบบ SHALL รองรับการเพิ่ม แก้ไข และปรับเปลี่ยนการตั้งค่า SSO/LDAP ทุกฟิลด์ (LDAP URL, Base DN, Domain, Sync Interval, Enabled) โดยการเปลี่ยนแปลง SHALL ยังไม่มีผลจนกว่ากด Save เมื่อกด Save ระบบ SHALL บันทึกค่าลง `SystemConfig` table

#### Scenario: Save SSO/LDAP settings

- **WHEN** ผู้ดูแลระบบแก้ไข LDAP URL, Base DN, Domain, Sync Interval หรือ Enabled และกด Save
- **THEN** ระบบ SHALL บันทึกลง `SystemConfig` table
- **AND** ค่าที่แก้ไข SHALL คงอยู่หลังรีเฟรช

#### Scenario: Load SSO/LDAP settings on page load

- **WHEN** ผู้ดูแลระบบเปิดแท็บ SSO/LDAP
- **THEN** ระบบ SHALL ดึงค่าจาก API และแสดงในฟอร์ม

### Requirement: UI Branding Settings Persist to Database

ระบบ SHALL รองรับการอัปโหลดโลโก้ เปลี่ยนชื่อระบบ เปลี่ยนสีหลัก (Primary) เปลี่ยนสีรอง (Secondary) โดยการเปลี่ยนแปลง SHALL ยังไม่มีผลจนกว่ากด Save เมื่อ Save สำเร็จ CSS Variables SHALL อัปเดตทันที

#### Scenario: Change colors and save

- **WHEN** ผู้ดูแลระบบเปลี่ยนสี Primary หรือ Secondary และกด Save
- **THEN** ระบบ SHALL บันทึกลง `SystemConfig` table
- **AND** CSS variables `--tu-primary`, `--tu-secondary` SHALL อัปเดตทันที
- **AND** หากยังไม่ได้กด Save สี SHALL ไม่เปลี่ยนแปลง

#### Scenario: Upload logo and save

- **WHEN** ผู้ดูแลระบบอัปโหลดโลโก้ใหม่และกด Save
- **THEN** ระบบ SHALL บันทึก path ใน `ThemeSetting` table
- **AND** โลโก้ใหม่ SHALL แสดงผลหลัง Save

#### Scenario: Change system name and save

- **WHEN** ผู้ดูแลระบบแก้ไขชื่อระบบและกด Save
- **THEN** ระบบ SHALL บันทึกลง `SystemConfig` table
- **AND** ชื่อใหม่ SHALL แสดงผลใน UI ทันที

### Requirement: Storage Settings Persist to Database

ระบบ SHALL รองรับการกำหนด Storage Quota และการเพิ่ม/ลบ Allowed File Types โดยการเปลี่ยนแปลง SHALL ยังไม่มีผลจนกว่ากด Save

#### Scenario: Set storage quota

- **WHEN** ผู้ดูแลระบบกำหนดค่า Quota (GB) และกด Save
- **THEN** ระบบ SHALL บันทึกลง `SystemConfig` table
- **AND** การอัปโหลดไฟล์ของผู้ใช้ SHALL ถูกจำกัดตาม Quota ใหม่

#### Scenario: Add/Remove allowed file types

- **WHEN** ผู้ดูแลระบบเพิ่มหรือลบประเภทไฟล์ที่อนุญาตและกด Save
- **THEN** ระบบ SHALL บันทึกและบังคับใช้ตามรายการใหม่

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

### Requirement: Categories Settings — Cross-Module Synchronization

ระบบ SHALL รองรับการเพิ่ม แก้ไข ลบ และเปลี่ยนสีหมวดหมู่ประกาศและหมวดหมู่โครงการ โดยบันทึกลง Persistent Storage และอัปเดตในทุกโมดูลที่เกี่ยวข้องโดยอัตโนมัติ

#### Scenario: Announcement categories sync to Intranet

- **WHEN** ผู้ดูแลระบบเพิ่มหรือแก้ไขหมวดหมู่ประกาศใน Settings และกด Save
- **THEN** หมวดหมู่ใหม่ SHALL ปรากฏในหน้า Intranet ทันทีเมื่อเข้าใช้งาน
- **AND** ระบบ Intranet SHALL อ่านหมวดหมู่จาก `GET /api/settings` key `storage.annCats`

#### Scenario: Project categories sync to Projects

- **WHEN** ผู้ดูแลระบบเพิ่มหรือแก้ไขหมวดหมู่โครงการใน Settings และกด Save
- **THEN** หมวดหมู่ใหม่ SHALL ปรากฏในหน้า Projects ทันทีเมื่อเข้าใช้งาน
- **AND** ระบบ Projects SHALL อ่านหมวดหมู่จาก `GET /api/settings` key `storage.projCats`

#### Scenario: Deleted category removed from all modules

- **WHEN** ผู้ดูแลระบบลบหมวดหมู่ใน Settings และกด Save
- **THEN** หมวดหมู่ที่ถูกลบ SHALL ไม่ปรากฏใน Intranet, Projects และทุกโมดูลที่เกี่ยวข้องอีกต่อไป

#### Scenario: Categories persist across refresh

- **WHEN** ผู้ดูแลระบบแก้ไขหมวดหมู่ กด Save แล้วรีเฟรชหน้า Settings, Intranet หรือ Projects
- **THEN** หมวดหมู่ล่าสุดที่บันทึกไว้ SHALL ยังคงแสดงผลถูกต้องในทุกหน้า

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
- **AND** ระบบ SHALL บันทึก AuditLog `APP_STATUS_CHANGE` พร้อม oldValue และ newValue

#### Scenario: Enable disabled app

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะจาก "maintenance" เป็น "active" หรือ "online"
- **THEN** ระบบ SHALL อัปเดตในฐานข้อมูล
- **AND** แอปพลิเคชัน SHALL กลับมาใช้งานได้ทันที
- **AND** Application Hub SHALL แสดงสถานะใหม่ทันที

#### Scenario: Status change visible to all users

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะ Application
- **THEN** ผู้ใช้ทุกคนที่เปิด Application Hub SHALL เห็นการเปลี่ยนแปลง
- **AND** ไม่ต้องรีสตาร์ทระบบ

### Requirement: App Status Change Audit Logging

ระบบ SHALL บันทึก `APP_STATUS_CHANGE` ใน Audit Log ทุกครั้งที่มีการเปลี่ยนสถานะ Application

#### Scenario: Audit log records status change details

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะ Application ใน Settings
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย:
  - module: "settings"
  - action: "APP_STATUS_CHANGE"
  - entityType: "Application"
  - entityId: ID ของ Application
  - oldValue: สถานะเดิม
  - newValue: สถานะใหม่
  - userId: ID ของผู้ดูแลระบบที่ดำเนินการ

### Requirement: Data Persistence — System Configuration

การเพิ่ม (Create), แก้ไข (Update) และลบ (Delete) ข้อมูลทุกส่วนของ System Configuration SHALL บันทึกข้อมูลลง Persistent Storage เมื่อกด Save และข้อมูล SHALL คงอยู่หลังรีเฟรชและ Logout/Login

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

#### Scenario: Unsaved changes lost on logout

- **WHEN** ผู้ดูแลระบบแก้ไขค่าโดยยังไม่ได้กด Save และ Logout
- **THEN** หลังจาก Login ใหม่ ค่า SHALL เป็นค่าที่บันทึกไว้ก่อนหน้านี้ (ค่าที่ยังไม่ได้ Save SHALL หายไป)
