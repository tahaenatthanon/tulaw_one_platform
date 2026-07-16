## Context

`lib/audit-log.ts` มี `createAuditLog()` และ `logAction()` / `logFailedAction()` ทำงานแล้ว ใช้ใน 4 API routes: `users`, `settings`, `api-keys` (ประมาณ 10 call sites)

ต้องขยาย coverage ไปยังทุก module ที่เหลือโดยไม่เปลี่ยน architecture เดิม

## Goals / Non-Goals

**Goals:**
- เพิ่ม `logAction()` calls ในทุก API route handler สำหรับ Create/Update/Delete/Approve/Reject/Import/Export
- เพิ่ม audit log ใน Auth flow: login success, login failed, logout
- เพิ่ม audit log ใน Document operations: upload, download
- เพิ่ม audit log ใน Project operations: create, approve, reject
- เพิ่ม audit log ใน Permission/Role changes
- เพิ่ม audit log ใน Import/Export operations (CSV Import, CSV Export, Audit Export)
- **หลักการ:** ทุก API route handler ที่ทำการเปลี่ยนแปลงข้อมูล (mutation) ต้องเรียก `logAction()`

**Non-Goals:**
- ไม่เปลี่ยน schema หรือ `createAuditLog()` function
- ไม่เปลี่ยน UI ของ Audit Log
- ไม่ implement real-time notification ของ audit events

## Decisions

### 1. Pattern: Add logAction() at Return Point

**เลือก:** เพิ่ม `await logAction(session.user.id, module, action, detail)` ก่อน `return apiSuccess()` ในทุก mutation handler
**เหตุผล:** minimal invasion, ไม่กระทบ logic หลัก, consistent pattern เดียวกับที่มีอยู่แล้ว
**ตัวอย่าง:**
```ts
// Existing pattern in users/route.ts:
await logAction(session.user.id, "users", "USER_DELETE", { entityType: "User", entityId: userId });
return apiSuccess({ deleted: true });

// New pattern in documents/route.ts:
await logAction(session.user.id, "documents", "DOC_UPLOAD", { entityType: "Document", entityId: doc.id });
return apiSuccess(doc);
```

### 2. Auth Event Logging

**เลือก:** เพิ่ม audit log ใน NextAuth callbacks (`jwt`, `signIn`) และ `signOut` event
**ตำแหน่ง:** 
- `jwt` callback → ตรวจสอบว่าเป็น login ใหม่ → `logAction(userId, "auth", "USER_LOGIN")`
- `signIn` callback → ถ้า error → `logFailedAction(userId, "auth", "USER_LOGIN_FAILED")`
- `signOut` → ผ่าน NextAuth events → `logAction(userId, "auth", "USER_LOGOUT")`

### 3. Event Type Naming Convention

**เลือก:** `{MODULE}_{ACTION}` format — เช่น `DOCUMENT_UPLOAD`, `PROJECT_CREATE`, `CSV_IMPORT`
**เหตุผล:** สอดคล้องกับ existing: `USER_DELETE`, `CONFIG_UPDATE`, `API_KEY_CREATE`

### 4. Audit Log Module List

| Module | Events |
|--------|--------|
| `auth` | USER_LOGIN, USER_LOGOUT, USER_LOGIN_FAILED, MFA_RESET |
| `users` | USER_CREATE, USER_UPDATE, USER_DELETE, USER_UNLOCK, ROLE_ASSIGN, PERMISSION_CHANGE, BULK_* (existing) |
| `documents` | DOC_UPLOAD, DOC_DOWNLOAD, DOC_DELETE, DOC_SHARE |
| `projects` | PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE, PROJECT_APPROVE, PROJECT_REJECT |
| `settings` | CONFIG_UPDATE, API_KEY_* (existing) |
| `import-export` | CSV_IMPORT, CSV_EXPORT, AUDIT_EXPORT |
| `sync` | AD_SYNC |
| `eoffice` | EOFFICE_CREATE, EOFFICE_APPROVE, EOFFICE_REJECT |
| `book-meeting` | BOOKING_CREATE, BOOKING_CANCEL |

## Risks / Trade-offs

- **Performance:** `logAction()` เป็น async แต่ไม่ await ในบางกรณี (fire-and-forget) → อาจมี log ตกหล่นถ้า process crash → ใช้ `await` เสมอ
- **Auth events:** NextAuth callbacks อาจไม่มี `session.user.id` → ใช้ `account.providerAccountId` หรือ `token.sub` แทน
