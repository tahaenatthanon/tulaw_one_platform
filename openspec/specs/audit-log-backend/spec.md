# Audit Log Backend

## Purpose

TBD — Backend persistence and API specifications for Audit Log module.

## Requirements

### Requirement: Audit Log Data from Real Database

ระบบ SHALL แสดงบันทึกกิจกรรมทั้งหมด (System Activity Log) จาก `AuditLog` table ในฐานข้อมูลจริง แทนการใช้ Mock Data

#### Scenario: Activity log loads from database

- **WHEN** ผู้ใช้ที่มีสิทธิ์ `AUDIT_LOG_VIEW` เปิดหน้า Activity Log
- **THEN** ระบบ SHALL ดึงข้อมูลจาก `GET /api/audit-logs` พร้อม pagination
- **AND** SHALL แสดงข้อมูลจริงจากฐานข้อมูล

#### Scenario: No mock data in audit log

- **WHEN** ระบบแสดง Audit Log
- **THEN** ระบบ SHALL ไม่ใช้ `generateLogs()` หรือ Mock Data ใดๆ
- **AND** ข้อมูลทั้งหมด SHALL มาจาก `AuditLog` table

### Requirement: Audit Log Search and Multi-Filter

ระบบ SHALL รองรับการค้นหาและกรองข้อมูล Audit Log แบบหลายเงื่อนไข (Multi-filter) จากผู้ใช้งาน, Event Type, Module, ระดับความสำคัญ และช่วงวันที่

#### Scenario: Filter by user

- **WHEN** ผู้ใช้เลือกหรือพิมพ์ชื่อผู้ใช้งานใน Filter
- **THEN** ระบบ SHALL กรอง Audit Log เฉพาะรายการของผู้ใช้คนนั้น

#### Scenario: Filter by event type

- **WHEN** ผู้ใช้เลือก Event Type จาก dropdown
- **THEN** ระบบ SHALL กรองเฉพาะรายการที่มี Event Type ตรงกับที่เลือก

#### Scenario: Filter by module

- **WHEN** ผู้ใช้เลือก Module จาก dropdown
- **THEN** ระบบ SHALL กรองเฉพาะรายการที่เกิดใน Module นั้น

#### Scenario: Filter by date range

- **WHEN** ผู้ใช้เลือกช่วงวันที่เริ่มต้นและสิ้นสุด
- **THEN** ระบบ SHALL กรองเฉพาะรายการที่อยู่ในช่วงวันที่ที่เลือก

#### Scenario: Combine multiple filters

- **WHEN** ผู้ใช้เลือกหลายเงื่อนไขพร้อมกัน (เช่น User + Event Type + Date Range)
- **THEN** ระบบ SHALL กรองข้อมูลตามทุกเงื่อนไขที่เลือก (AND logic)

### Requirement: Audit Log Sorting

ระบบ SHALL รองรับการเรียงลำดับข้อมูลทุกคอลัมน์ใน Audit Log

#### Scenario: Sort by timestamp

- **WHEN** ผู้ใช้คลิกหัวคอลัมน์ Timestamp
- **THEN** ระบบ SHALL เรียงลำดับตามวันที่และเวลา (ascending/descending)

#### Scenario: Sort by event type

- **WHEN** ผู้ใช้คลิกหัวคอลัมน์ Event Type
- **THEN** ระบบ SHALL เรียงลำดับตามประเภทเหตุการณ์

### Requirement: Audit Log View Details

ระบบ SHALL รองรับการดูรายละเอียดของแต่ละรายการ Audit Log ใน Drawer ขนาด Large โดยแบ่งข้อมูลเป็น 6 Sections: General Information, User Information, Target Resource, Change History, Request Information, Additional Information

#### Scenario: View audit log detail with full sections

- **WHEN** ผู้ใช้คลิกที่รายการ Audit Log
- **THEN** ระบบ SHALL เปิด Drawer แสดง: Log ID, Timestamp, Event Type, Module, Action, Status
- **AND** User: Name, ID, Email, Role, Department
- **AND** Target Resource: Object Type, Record ID
- **AND** Change History: Before/After JSON แบบ Side-by-side พร้อม Syntax Highlight (หรือ "N/A")
- **AND** Request Info: IP Address, User Agent, Browser, OS, Device, Session ID, Request ID, Endpoint, HTTP Method
- **AND** Additional: Error Message (ถ้า Failed), Auth Method, Duration, Correlation ID

#### Scenario: JSON syntax highlighting in change history

- **WHEN** Before หรือ After มีค่า JSON
- **THEN** ระบบ SHALL แสดง JSON พร้อม syntax highlighting: key=blue, string=green, number=red, boolean=purple, null=gray

#### Scenario: Copy button available

- **WHEN** ผู้ใช้เปิด Detail Drawer
- **THEN** ทุก field ที่มีค่า SHALL มีปุ่ม Copy สำหรับคัดลอกไปยัง clipboard

#### Scenario: Collapse/Expand for large data

- **WHEN** JSON มีขนาดเกิน 200px
- **THEN** ระบบ SHALL แสดงปุ่ม Expand/Collapse เพื่อย่อหรือขยายการแสดงผล

### Requirement: Audit Log Export

ระบบ SHALL รองรับการ Export Audit Log เป็น CSV และ Excel

#### Scenario: Export as CSV

- **WHEN** ผู้ใช้ที่มีสิทธิ์ `AUDIT_LOG_EXPORT` กด Export CSV
- **THEN** ระบบ SHALL ดาวน์โหลดไฟล์ CSV พร้อมข้อมูลตาม filter ปัจจุบัน

#### Scenario: Export as Excel

- **WHEN** ผู้ใช้ที่มีสิทธิ์ `AUDIT_LOG_EXPORT` กด Export Excel
- **THEN** ระบบ SHALL ดาวน์โหลดไฟล์ Excel (XLSX) พร้อมข้อมูลตาม filter ปัจจุบัน

#### Scenario: Export respects date range

- **WHEN** ผู้ใช้กำหนดช่วงวันที่และกด Export
- **THEN** ไฟล์ที่ส่งออก SHALL มีเฉพาะข้อมูลในช่วงวันที่ที่กำหนด

### Requirement: Audit Log Event Types

ระบบ SHALL บันทึกและแสดง Audit Log สำหรับประเภทเหตุการณ์ (Event Type) อย่างน้อย: DOC_UPLOAD, CONFIG_UPDATE, PROJECT_APPROVE, AD_SYNC, USER_LOGIN, USER_LOGIN_FAILED, DASHBOARD_VIEW, ROLE_CREATE, USER_LOGOUT, USER_CREATE, USER_UPDATE, USER_DELETE, DOC_DOWNLOAD, DOC_DELETE, DOC_SHARE, PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE, PROJECT_REJECT, CSV_IMPORT, CSV_EXPORT, AUDIT_EXPORT, PERMISSION_CHANGE, ROLE_ASSIGN, MFA_RESET, ACCOUNT_UNLOCK, PASSWORD_RESET, API_KEY_CREATE, API_KEY_ROTATE, API_KEY_DISABLE, API_KEY_DELETE, BULK_ASSIGN_ROLE, BULK_ENABLE, BULK_DISABLE, BULK_UNLOCK, BULK_RESET_MFA, EOFFICE_CREATE, EOFFICE_APPROVE, EOFFICE_REJECT, BOOKING_CREATE, BOOKING_CANCEL และเหตุการณ์สำคัญอื่น ๆ

#### Scenario: All event types displayed

- **WHEN** ระบบแสดง Audit Log
- **THEN** Filter Event Type SHALL มีตัวเลือกครบทุกประเภทที่กำหนด
- **AND** แต่ละรายการ SHALL แสดง Event Type badge ด้วยสีที่แตกต่างกัน

#### Scenario: Auto-logging covers all mutations

- **WHEN** มีการดำเนินการใด ๆ ใน API route handler ที่เป็น mutation (POST/PUT/PATCH/DELETE)
- **THEN** ระบบ SHALL เรียก `logAction()` หรือ `logFailedAction()` ก่อน return response
- **AND** AuditLog SHALL มี userId, module, action, และ detail ครบถ้วน

### Requirement: Before/After Change Tracking

ระบบ SHALL บันทึกข้อมูล Before (oldValue) และ After (newValue) สำหรับการแก้ไขข้อมูลที่สำคัญ

#### Scenario: Config update records before/after

- **WHEN** ผู้ดูแลระบบเปลี่ยนค่า Configuration
- **THEN** ระบบ SHALL บันทึก oldValue และ newValue ใน AuditLog

#### Scenario: User edit records before/after

- **WHEN** ผู้ดูแลระบบแก้ไขข้อมูลผู้ใช้
- **THEN** ระบบ SHALL บันทึกค่าเดิมและค่าใหม่ใน AuditLog

### Requirement: Immutable Audit Log

ระบบ SHALL บันทึก Audit Log แบบอัตโนมัติ และข้อมูล Audit Log SHALL ไม่สามารถแก้ไขหรือลบย้อนหลังผ่านระบบได้ (Immutable / Append-only)

#### Scenario: Cannot modify audit log entry

- **WHEN** ผู้ใช้พยายามแก้ไขหรือลบรายการ Audit Log ผ่าน API
- **THEN** ระบบ SHALL ไม่มี API endpoint สำหรับ UPDATE หรือ DELETE AuditLog
- **AND** ข้อมูล Audit Log SHALL คงอยู่ตามเดิม

#### Scenario: Audit log auto-recording

- **WHEN** เกิดเหตุการณ์สำคัญในระบบ (เช่น Config Update, User Create, Role Change)
- **THEN** ระบบ SHALL บันทึก AuditLog โดยอัตโนมัติผ่าน `createAuditLog()` utility

### Requirement: Data Persistence — Audit Log

การเพิ่ม (Create) และดึงข้อมูล (Read) ทุกส่วนของ Audit Log SHALL ใช้ข้อมูลจากแหล่งข้อมูลจริง (Persistent Storage — AuditLog table) และข้อมูล SHALL คงอยู่หลังจากรีเฟรชหน้าหรือออกจากระบบ

#### Scenario: Audit log entries persist after refresh

- **WHEN** ผู้ใช้เปิดหน้า Audit Log รีเฟรชหน้าเว็บ
- **THEN** ข้อมูล Audit Log SHALL ยังคงอยู่ครบถ้วน (มาจากฐานข้อมูล ไม่ใช่ Mock Data)

#### Scenario: New audit entries appear after refresh

- **WHEN** มีการสร้าง Audit Log entry ใหม่ผ่าน `createAuditLog()`
- **THEN** หลังจากรีเฟรชหน้า Audit Log รายการใหม่ SHALL ปรากฏในตาราง

#### Scenario: Exported data matches database

- **WHEN** ผู้ใช้ Export Audit Log เป็น CSV หรือ Excel
- **THEN** ข้อมูลที่ส่งออก SHALL ตรงกับข้อมูลใน `AuditLog` table
