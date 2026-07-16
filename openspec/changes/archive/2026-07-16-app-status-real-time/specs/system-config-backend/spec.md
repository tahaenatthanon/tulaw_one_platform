## MODIFIED Requirements

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

## ADDED Requirements

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
