## ADDED Requirements

### Requirement: Auth Events Audit Logging

ระบบ SHALL บันทึก Audit Log สำหรับเหตุการณ์ Authentication โดยอัตโนมัติ: USER_LOGIN (เข้าสู่ระบบสำเร็จ), USER_LOGOUT (ออกจากระบบ), USER_LOGIN_FAILED (เข้าสู่ระบบไม่สำเร็จ)

#### Scenario: Login success logged

- **WHEN** ผู้ใช้เข้าสู่ระบบสำเร็จ
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `USER_LOGIN`, module `auth`, isSuccess `true`

#### Scenario: Login failure logged

- **WHEN** ผู้ใช้เข้าสู่ระบบไม่สำเร็จ (รหัสผ่านผิด, บัญชีล็อก, MFA ไม่ผ่าน)
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `USER_LOGIN_FAILED`, module `auth`, isSuccess `false`

#### Scenario: Logout logged

- **WHEN** ผู้ใช้ออกจากระบบ
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `USER_LOGOUT`, module `auth`

### Requirement: Document Events Audit Logging

ระบบ SHALL บันทึก Audit Log สำหรับการดำเนินการกับเอกสาร: DOC_UPLOAD (อัปโหลด), DOC_DOWNLOAD (ดาวน์โหลด), DOC_DELETE (ลบ), DOC_SHARE (แชร์)

#### Scenario: Document upload logged

- **WHEN** ผู้ใช้อัปโหลดเอกสาร
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `DOC_UPLOAD`, module `documents`

#### Scenario: Document download logged

- **WHEN** ผู้ใช้ดาวน์โหลดเอกสาร
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `DOC_DOWNLOAD`, module `documents`

### Requirement: Project Events Audit Logging

ระบบ SHALL บันทึก Audit Log สำหรับการดำเนินการกับโครงการ: PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE, PROJECT_APPROVE, PROJECT_REJECT

#### Scenario: Project approval logged

- **WHEN** ผู้มีสิทธิ์อนุมัติโครงการ
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `PROJECT_APPROVE`, module `projects`

#### Scenario: Project rejection logged

- **WHEN** ผู้มีสิทธิ์ปฏิเสธโครงการ
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `PROJECT_REJECT`, module `projects`

### Requirement: Import/Export Events Audit Logging

ระบบ SHALL บันทึก Audit Log สำหรับการนำเข้าและส่งออกข้อมูล: CSV_IMPORT, CSV_EXPORT, AUDIT_EXPORT

#### Scenario: CSV import logged

- **WHEN** ผู้ใช้ Import CSV
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `CSV_IMPORT`, module `import-export`

#### Scenario: Audit log export logged

- **WHEN** ผู้ใช้ Export Audit Log
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `AUDIT_EXPORT`, module `import-export`

### Requirement: Permission Change Events Audit Logging

ระบบ SHALL บันทึก Audit Log เมื่อมีการเปลี่ยนแปลงสิทธิ์ผู้ใช้: ROLE_ASSIGN, PERMISSION_CHANGE

#### Scenario: Role assignment logged

- **WHEN** ผู้ดูแลระบบกำหนด Role ให้ผู้ใช้
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `ROLE_ASSIGN`, module `users`

#### Scenario: Permission change logged

- **WHEN** ผู้ดูแลระบบเปลี่ยนแปลง Permission
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `PERMISSION_CHANGE`, module `users`

### Requirement: Security Events Audit Logging

ระบบ SHALL บันทึก Audit Log สำหรับเหตุการณ์ด้านความปลอดภัย: MFA_RESET, ACCOUNT_UNLOCK, PASSWORD_RESET

#### Scenario: MFA reset logged

- **WHEN** ผู้ดูแลระบบรีเซ็ต MFA ของผู้ใช้
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `MFA_RESET`, module `auth`

#### Scenario: Account unlock logged

- **WHEN** ผู้ดูแลระบบปลดล็อกบัญชีผู้ใช้
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `ACCOUNT_UNLOCK`, module `users`

### Requirement: Data Sync Events Audit Logging

ระบบ SHALL บันทึก Audit Log เมื่อมีการซิงค์ข้อมูล: AD_SYNC

#### Scenario: AD sync logged

- **WHEN** ระบบทำการซิงค์ข้อมูลจาก Active Directory
- **THEN** ระบบ SHALL บันทึก AuditLog ด้วย action `AD_SYNC`, module `sync`

### Requirement: Comprehensive Audit Coverage

ระบบ SHALL บันทึก Audit Log สำหรับทุกการดำเนินการที่สำคัญของผู้ใช้งานและระบบโดยอัตโนมัติ โดยครอบคลุมอย่างน้อย: การเข้าสู่ระบบ, การออกจากระบบ, การเข้าสู่ระบบไม่สำเร็จ, การเพิ่ม/แก้ไข/ลบ/อนุมัติ/ปฏิเสธ/นำเข้า/ส่งออกข้อมูล, การอัปโหลดและดาวน์โหลดไฟล์, การเปลี่ยนแปลงสิทธิ์ผู้ใช้งาน, การเปลี่ยนแปลงการตั้งค่าระบบ, การเรียกใช้งาน API, การซิงค์ข้อมูล และเหตุการณ์สำคัญอื่น ๆ ที่เกี่ยวข้องกับความปลอดภัยและการดำเนินงานของระบบ

#### Scenario: Every mutation creates an audit log

- **WHEN** มีการดำเนินการใด ๆ ที่เปลี่ยนแปลงข้อมูลในระบบ (Create, Update, Delete, Approve, Reject, Import, Export)
- **THEN** ระบบ SHALL บันทึก AuditLog โดยอัตโนมัติผ่าน `logAction()` หรือ `createAuditLog()`
- **AND** AuditLog SHALL มี module และ action ที่ระบุประเภทเหตุการณ์ชัดเจน
