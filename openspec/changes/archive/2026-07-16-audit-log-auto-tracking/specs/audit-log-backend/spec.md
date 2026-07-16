## MODIFIED Requirements

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
