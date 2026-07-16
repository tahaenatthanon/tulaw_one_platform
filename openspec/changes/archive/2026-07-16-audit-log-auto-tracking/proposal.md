## Why

`lib/audit-log.ts` มี utility `createAuditLog()` และ `logAction()` อยู่แล้ว แต่ปัจจุบันใช้เพียง 4 จุด (user CRUD, settings, API keys) ระบบยังขาดการบันทึก Audit Log สำหรับเหตุการณ์สำคัญอื่น ๆ เช่น Login/Logout/Login Failed, เอกสาร (Upload/Download), โครงการ (Create/Approve/Reject), Import/Export, Permission Change, AD Sync และการดำเนินการด้านความปลอดภัยอื่น ๆ การเพิ่ม auto-tracking ครอบคลุมทุกเหตุการณ์สำคัญจะทำให้ Audit Log เป็นแหล่งข้อมูลที่สมบูรณ์สำหรับการตรวจสอบย้อนหลังและการปฏิบัติตามข้อกำหนดด้านความปลอดภัย

## What Changes

- **Auth Events:** บันทึก USER_LOGIN, USER_LOGOUT, USER_LOGIN_FAILED โดยอัตโนมัติใน Auth flow
- **Document Events:** บันทึก DOC_UPLOAD, DOC_DOWNLOAD เมื่อมีการอัปโหลดหรือดาวน์โหลดไฟล์
- **Project Events:** บันทึก PROJECT_CREATE, PROJECT_UPDATE, PROJECT_APPROVE, PROJECT_REJECT ใน Projects API
- **Import/Export Events:** บันทึก CSV_IMPORT, CSV_EXPORT, AUDIT_EXPORT เมื่อมีการนำเข้าหรือส่งออกข้อมูล
- **Permission Events:** บันทึก PERMISSION_CHANGE, ROLE_ASSIGN เมื่อมีการเปลี่ยนแปลงสิทธิ์ผู้ใช้
- **Data Sync Events:** บันทึก AD_SYNC เมื่อมีการซิงค์ข้อมูล Active Directory
- **API Events:** บันทึกการเรียกใช้งาน API ที่สำคัญผ่าน API Keys
- **Security Events:** บันทึกเหตุการณ์ด้านความปลอดภัย เช่น MFA Reset, Account Lock/Unlock, Password Reset
- **Existing coverage stays:** `users`, `settings`, `api-keys` routes คงไว้ตามเดิม

## Capabilities

### New Capabilities

- `audit-log-auto-tracking`: ระบบบันทึก Audit Log อัตโนมัติสำหรับทุกเหตุการณ์สำคัญ — Auth, Documents, Projects, Import/Export, Permissions, Data Sync, API, Security

### Modified Capabilities

- `audit-log-backend`: เพิ่ม Event Types ใหม่และขยายขอบเขตการบันทึกอัตโนมัติให้ครอบคลุมทุก module

## Impact

- **Backend:** `app/api/auth/[...nextauth]/route.ts` — เพิ่ม audit log ใน login/logout flow; `app/api/documents/route.ts`, `app/api/projects/route.ts`, `app/api/users/route.ts` — เพิ่ม audit log calls
- **Utility:** `lib/audit-log.ts` — เพิ่ม helper functions สำหรับเหตุการณ์เฉพาะ (logAuthEvent, logDocumentEvent, logProjectEvent)
- **Database:** ใช้ `AuditLog` table ที่มีอยู่ — ไม่มี schema เปลี่ยนแปลง
- **Dependencies:** ไม่มี dependency ใหม่
