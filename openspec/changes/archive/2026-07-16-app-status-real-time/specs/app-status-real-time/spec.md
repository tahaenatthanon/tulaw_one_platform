## ADDED Requirements

### Requirement: Application Hub Shows Real Application Status

Application Hub SHALL ดึงสถานะของแต่ละ Application จาก API จริง (`GET /api/settings/app-status`) แทนการใช้ข้อมูล Hardcoded

#### Scenario: Hub loads app status from API

- **WHEN** ผู้ใช้เปิดหน้า Application Hub
- **THEN** ระบบ SHALL ดึงข้อมูลจาก `GET /api/settings/app-status`
- **AND** แสดงสถานะจริงของแต่ละแอปพลิเคชัน (Online/Maintenance/Offline)

#### Scenario: Hub updates when status changes in Settings

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะแอปพลิเคชันใน Settings Page และกด Save
- **THEN** เมื่อผู้ใช้เข้า Application Hub ใหม่ สถานะ SHALL ตรงกับที่บันทึกใน Settings

### Requirement: Status Indicator on Application Icons

แต่ละ Application ใน Application Hub SHALL แสดง Status Indicator (จุดสี) บนไอคอนที่แตกต่างตามสถานะ: Online (เขียว), Maintenance (เหลือง), Offline (แดง)

#### Scenario: Online indicator

- **WHEN** แอปพลิเคชันมีสถานะ "online"
- **THEN** ไอคอน SHALL แสดงจุดสีเขียว (`bg-tu-success`) ที่มุมขวาบน

#### Scenario: Maintenance indicator

- **WHEN** แอปพลิเคชันมีสถานะ "maintenance"
- **THEN** ไอคอน SHALL แสดงจุดสีเหลือง (`bg-tu-warning animate-pulse`) ที่มุมขวาบน

#### Scenario: Offline indicator

- **WHEN** แอปพลิเคชันมีสถานะ "offline"
- **THEN** ไอคอน SHALL แสดงจุดสีแดง (`bg-tu-error`) ที่มุมขวาบน

### Requirement: Real-time Status Effect Across All Users

การเปลี่ยนแปลงสถานะ Application SHALL มีผลกับผู้ใช้งานทุกคนทันทีโดยไม่ต้องรีสตาร์ทระบบ

#### Scenario: Status change visible to all users immediately

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะแอปพลิเคชันจาก "online" เป็น "maintenance" ใน Settings และกด Save
- **THEN** ผู้ใช้ทุกคนที่เปิด Application Hub SHALL เห็นสถานะใหม่เมื่อเข้าใช้งานครั้งถัดไป (หรือเมื่อ SWR re-fetch)
- **AND** ไม่ต้องรีสตาร์ทระบบหรือรีเฟรชหน้า

### Requirement: App Status Change Audit Log

ระบบ SHALL บันทึกการเปลี่ยนแปลงสถานะ Application ลงใน Audit Log โดยระบุผู้ดำเนินการ, วันที่และเวลา, สถานะเดิม และสถานะใหม่

#### Scenario: Status change logged in Audit Log

- **WHEN** ผู้ดูแลระบบเปลี่ยนสถานะ Application ใน Settings
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `APP_STATUS_CHANGE`, module `settings`
- **AND** oldValue SHALL ระบุสถานะเดิม
- **AND** newValue SHALL ระบุสถานะใหม่
- **AND** entityId SHALL ระบุ ID ของ Application

#### Scenario: Old status and new status recorded

- **WHEN** ผู้ดูแลระบบเปลี่ยนจาก "online" เป็น "maintenance"
- **THEN** AuditLog oldValue SHALL เป็น "online"
- **AND** AuditLog newValue SHALL เป็น "maintenance"
