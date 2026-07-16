## Context

ระบบ TULAW ONE PLATFORM มีโครงสร้าง MFA บางส่วนในปัจจุบัน:
- **Database**: มี `UserMfa` model (id, userId, secret, backupCode, isEnabled, verifiedAt) และ `UserStatus.MFA_PENDING` enum
- **MFA Setup Page**: `/settings/mfa-setup` มี UI พื้นฐาน (intro → setup → verify) แต่ใช้ placeholder secret และ QR code
- **MFA API**: `/api/mfa` รองรับ `check` และ `enable` actions แต่ใช้ `TULAW-MFA-PLACEHOLDER` แทน TOTP secret จริง
- **Auth Settings**: `/settings/auth-settings` มี toggle `mfaEnabled` แต่เป็น local state ยังไม่ผูกกับ enforcement จริง
- **Middleware**: `middleware.ts` ตรวจสอบ role level สำหรับ route protection แต่ยังไม่ตรวจสอบ MFA status
- **Login Flow**: `/login` ใช้ CredentialsProvider ผ่าน `next-auth` ไม่มีขั้นตอน OTP หลังล็อกอิน

ผู้ใช้ระดับ System Admin (level ≥ 80) ต้องถูกบังคับให้ตั้งค่า MFA ก่อนเข้าใช้งานระบบ

## Goals / Non-Goals

**Goals:**
- บังคับ MFA สำหรับ System Admin+ ทุกราย — หลังล็อกอินด้วยรหัสผ่านผ่านแล้ว ต้องตั้งค่า MFA ก่อนเข้าใช้ส่วนอื่น
- ใช้ TOTP จริง (RFC 6238) ผ่าน `otplib` เพื่อสร้างและตรวจสอบ OTP 6 หลัก
- แสดง QR Code จริงสำหรับแอป Authenticator (Google/Microsoft)
- เพิ่มขั้นตอน OTP verification ใน flow ล็อกอินสำหรับผู้ใช้ที่ตั้งค่า MFA แล้ว
- สร้างและแสดง Backup Codes สำหรับการกู้คืน (8 codes, ใช้ครั้งเดียว)
- บันทึก Audit Log ทุกการเปลี่ยนแปลง MFA (enable, disable, reset, backup code used)
- Middleware redirect ผู้ใช้ที่ต้องตั้งค่า MFA ไปยัง `/settings/mfa-setup`

**Non-Goals:**
- ไม่รองรับ MFA ผ่าน SMS หรือ Email (เฉพาะ TOTP เท่านั้น)
- ไม่รองรับ Hardware Security Key (FIDO2/WebAuthn)
- ไม่บังคับ MFA สำหรับ Dean, Dept Admin, User, Viewer (ยังคง optional)
- ไม่เปลี่ยน UI/UX design system ที่มีอยู่

## Decisions

### Decision 1: ใช้ otplib สำหรับ TOTP

**เลือก:** ใช้ `otplib` library

**เหตุผล:**
- `otplib` เป็นไลบรารี TOTP/HOTP ที่ mature และมีผู้ใช้มาก
- รองรับ `authenticator.generateSecret()` สำหรับสร้าง secret key
- รองรับ `authenticator.keyuri()` สำหรับสร้าง otpauth:// URI สำหรับ QR Code
- รองรับ `authenticator.check()` สำหรับตรวจสอบ OTP แบบ window-based
- มี TypeScript types ในตัว

**ทางเลือกที่พิจารณา:**
- `speakeasy` — deprecated, ไม่แนะนำให้ใช้กับโปรเจคใหม่
- เขียน TOTP เอง — เสี่ยง bug ด้านความปลอดภัย, ไม่ควร reinvent

### Decision 2: QR Code ผ่าน `qrcode` library (server-side generation)

**เลือก:** ใช้ `qrcode` library สร้าง QR code เป็น data URL บน server

**เหตุผล:**
- QR code ถูกสร้างบน server (API route) แล้วส่งเป็น data URL กลับไปให้ client
- ไม่ต้องพึ่ง client-side library สำหรับ QR generation
- `qrcode` library มีขนาดเล็กและใช้กันแพร่หลาย
- ลดความเสี่ยงที่ secret จะรั่วไหลผ่าน client-side rendering

### Decision 3: MFA Enforcement ใน Middleware

**เลือก:** ใช้ `middleware.ts` ตรวจสอบ MFA status ใน JWT token และ redirect ไป `/settings/mfa-setup`

**เหตุผล:**
- Middleware ทำงานก่อน rendering ทุก route — มั่นใจได้ว่าไม่มีหน้าไหน leak ก่อน MFA
- MFA status (`mfaVerified: boolean`) ถูกเพิ่มใน JWT token ผ่าน `jwt` callback ของ NextAuth
- หลังจากตั้งค่า MFA สำเร็จ, client refresh token เพื่อให้ JWT ใหม่มี `mfaVerified: true`
- Middleware ตรวจสอบเฉพาะ path ที่ต้องการ authentication (ตาม `config.matcher`)

**Flow:**
```
Login (password) → Check MFA required (role >= 80)
  ├─ MFA Enabled → Show OTP input → Verify OTP → Issue JWT (mfaVerified: true) → Dashboard
  └─ MFA Not Setup → Issue JWT (mfaVerified: false) → Redirect to /settings/mfa-setup
```

### Decision 4: OTP Window Tolerance

**เลือก:** ใช้ window size = 1 (allow 1 step before/after current)

**เหตุผล:**
- TOTP เปลี่ยนทุก 30 วินาที, clock drift อาจทำให้ OTP ใช้ไม่ได้
- Window size 1 หมายถึงยอมรับ current, previous, next OTP (ครอบคลุม ±30 วินาที)
- เป็นค่ามาตรฐานที่สมดุลระหว่าง usability และ security

### Decision 5: Backup Codes — 8 codes, SHA-256 hashed

**เลือก:** สร้าง backup codes 8 ชุด, เก็บเป็น SHA-256 hash ใน DB

**เหตุผล:**
- Backup code ยาว 10 ตัวอักษร (ตัวเลข+ตัวอักษร) — ทายยาก
- เก็บเฉพาะ hash ใน DB (เหมือน password) — ถ้า DB รั่ว codes ก็ยังปลอดภัย
- แสดง codes ทั้งหมดให้ user ครั้งเดียวตอน setup (ไม่สามารถดูซ้ำได้)
- แต่ละ code ใช้ได้ครั้งเดียว — ใช้แล้วลบ hash ออกจาก DB

### Decision 6: MFA Session Persistence

**เลือก:** MFA verification ผูกกับ session — ไม่ต้อง verify ทุก request

**เหตุผล:**
- JWT token มี `mfaVerified` flag และ `iat` (issued at)
- Session timeout ตามค่าใน auth settings (default 8 ชั่วโมง)
- หลังจาก session หมดอายุ ต้อง verify MFA อีกครั้งตอน login ใหม่

## Risks / Trade-offs

- **[Risk] TOTP clock drift** → ใช้ window size = 1 เพื่อ tolerance ±30 วินาที
- **[Risk] ผู้ใช้ทำ backup codes หาย** → Super Admin สามารถ reset MFA ให้ผู้ใช้ได้ (ผ่าน Users page) พร้อม audit log
- **[Risk] `otplib` dependency vulnerability** → `otplib` เป็น pure JS implementation ไม่มี native dependencies
- **[Trade-off] MFA เพิ่มขั้นตอน login** → เป็นข้อแลกที่ยอมรับได้สำหรับบัญชีที่มีสิทธิ์สูง
- **[Risk] QR code library compatibility** → `qrcode` เป็น library เล็ก, stable, ไม่มี dependency อื่น

## Migration Plan

1. ติดตั้ง dependencies: `npm install otplib qrcode`
2. สร้าง spec ใหม่ `mfa-enforcement`
3. ปรับปรุง flow ตามลำดับ:
   a. MFA API (`/api/mfa`) — รองรับ TOTP จริง, backup codes
   b. MFA Setup page — QR code จริง, backup codes display
   c. Login flow — OTP verification step
   d. Middleware — MFA enforcement redirect
   e. Auth Settings — ผูก toggle กับ enforcement
4. **Rollback**: ลบ MFA enforcement ออกจาก middleware (เหลือเฉพาะ optional) โดยไม่ลบข้อมูล MFA ใน DB
