## 1. Auth Events — NextAuth Integration

- [x] 1.1 เพิ่ม `logAction(userId, "auth", "USER_LOGIN", { ipAddress })` ใน JWT callback เมื่อเป็น session ใหม่
- [x] 1.2 เพิ่ม `logFailedAction(userId, "auth", "USER_LOGIN_FAILED", ipAddress)` ใน signIn callback เมื่อ login ล้มเหลว
- [x] 1.3 เพิ่ม `logAction(userId, "auth", "USER_LOGOUT")` ใน NextAuth events (signOut)

## 2. Security Events

- [x] 2.1 เพิ่ม `logAction(adminId, "auth", "MFA_RESET", { entityType: "User", entityId: targetUserId })` ใน `/api/users/[id]/reset-mfa/route.ts`
- [x] 2.2 เพิ่ม `logAction(adminId, "users", "ACCOUNT_UNLOCK", { entityType: "User", entityId: targetUserId })` ใน `/api/users/[id]/unlock/route.ts`
- [x] 2.3 เพิ่ม `logAction(adminId, "users", "MFA_RESET")` ใน PATCH bulk action `reset-mfa`

## 3. Permission & Role Events

- [x] 3.1 เพิ่ม `logAction(adminId, "users", "PERMISSION_CHANGE", { entityType: "Permission" })` ใน permission management API
- [x] 3.2 เพิ่ม `logAction(adminId, "users", "ROLE_ASSIGN", { entityType: "UserRole", entityId: userId })` ใน role assignment (ทั้ง single และ bulk)

## 4. Document Events

- [x] 4.1 เพิ่ม `logAction(userId, "documents", "DOC_UPLOAD", { entityType: "Document", entityId: docId })` ใน document upload handler
- [x] 4.2 เพิ่ม `logAction(userId, "documents", "DOC_DOWNLOAD", { entityType: "Document", entityId: docId })` ใน document download handler
- [x] 4.3 เพิ่ม `logAction(userId, "documents", "DOC_DELETE", { entityType: "Document", entityId: docId })` ใน document delete handler

## 5. Project Events

- [x] 5.1 เพิ่ม `logAction(userId, "projects", "PROJECT_CREATE", { entityType: "Project", entityId: projectId })` ใน project create handler
- [x] 5.2 เพิ่ม `logAction(userId, "projects", "PROJECT_UPDATE", { entityType: "Project", entityId: projectId })` ใน project update handler
- [x] 5.3 เพิ่ม `logAction(userId, "projects", "PROJECT_APPROVE", { entityType: "Project", entityId: projectId })` ใน project approve handler
- [x] 5.4 เพิ่ม `logAction(userId, "projects", "PROJECT_REJECT", { entityType: "Project", entityId: projectId })` ใน project reject handler

## 6. Import/Export Events

- [x] 6.1 เพิ่ม `logAction(userId, "import-export", "CSV_IMPORT")` ใน CSV import handler (ที่มีอยู่แล้วใน `/api/users/import-csv`)
- [x] 6.2 เพิ่ม `logAction(userId, "import-export", "CSV_EXPORT")` ใน CSV export handler (ที่มีอยู่แล้วใน `/api/users/export-csv`)
- [x] 6.3 เพิ่ม `logAction(userId, "import-export", "AUDIT_EXPORT")` ใน audit log export handler

## 7. E-Office & Meeting Events

- [x] 7.1 เพิ่ม `logAction(userId, "eoffice", "EOFFICE_CREATE", { entityType: "EofficeDocument", entityId: docId })` ใน e-office create handler
- [x] 7.2 เพิ่ม `logAction(userId, "eoffice", "EOFFICE_APPROVE", { entityType: "EofficeDocument", entityId: docId })` ใน e-office approve handler
- [x] 7.3 เพิ่ม `logAction(userId, "book-meeting", "BOOKING_CREATE", { entityType: "RoomBooking", entityId: bookingId })` ใน booking create handler
- [x] 7.4 เพิ่ม `logAction(userId, "book-meeting", "BOOKING_CANCEL", { entityType: "RoomBooking", entityId: bookingId })` ใน booking cancel handler

## 8. Audit Log UI — Event Type Updates

- [x] 8.1 อัปเดต `EVENT_TYPES` array ใน `app/(dashboard)/audit-log/activity-log/page.tsx` ให้รวม event types ใหม่ทั้งหมด
- [x] 8.2 อัปเดต `EVENT_META` mapping ให้มีสีและ label สำหรับ event types ใหม่
- [x] 8.3 ทดสอบว่า event types ใหม่ปรากฏใน filter dropdown

## 9. Verification

- [x] 9.1 ทดสอบ: Login → ตรวจสอบว่ามี USER_LOGIN ใน AuditLog
- [x] 9.2 ทดสอบ: Login failed → ตรวจสอบว่ามี USER_LOGIN_FAILED ใน AuditLog
- [x] 9.3 ทดสอบ: Upload document → ตรวจสอบว่ามี DOC_UPLOAD ใน AuditLog
- [x] 9.4 ทดสอบ: Create project → ตรวจสอบว่ามี PROJECT_CREATE ใน AuditLog
- [x] 9.5 ทดสอบ: Approve project → ตรวจสอบว่ามี PROJECT_APPROVE ใน AuditLog
- [x] 9.6 ทดสอบ: Import CSV → ตรวจสอบว่ามี CSV_IMPORT ใน AuditLog
- [x] 9.7 ทดสอบ: Export Audit Log → ตรวจสอบว่ามี AUDIT_EXPORT ใน AuditLog
- [x] 9.8 ทดสอบ: Reset MFA → ตรวจสอบว่ามี MFA_RESET ใน AuditLog
- [x] 9.9 ทดสอบ: ทุก event type ใหม่ปรากฏใน Audit Log UI filter dropdown

