## 1. ติดตั้ง Dependencies และเตรียมโครงสร้าง

- [x] 1.1 ติดตั้ง `otplib` สำหรับ TOTP generation / verification
- [x] 1.2 ติดตั้ง `qrcode` สำหรับสร้าง QR Code data URL (server-side)
- [x] 1.3 ตรวจสอบ `UserMfa` model ใน `prisma/schema.prisma` — เพิ่มฟิลด์ `backupCodes` (Json) และ `failedAttempts` (Int) พร้อม `lastFailedAt` (DateTime) ถ้ายังไม่มี
- [x] 1.4 Run `npx prisma db push` เพื่อ sync schema กับ database

## 2. ปรับปรุง MFA API (`app/api/mfa/route.ts`)

- [x] 2.1 แทน placeholder secret ด้วย `authenticator.generateSecret()` จาก otplib ใน action `setup`
- [x] 2.2 เพิ่ม action `verify-setup` — รับ OTP + temp secret, ตรวจสอบด้วย `authenticator.check()`, บันทึกลง DB ถ้าถูกต้อง
- [x] 2.3 เพิ่ม action `verify-login` — รับ OTP, อ่าน secret จาก DB, ตรวจสอบด้วย `authenticator.check()` พร้อม window size = 1
- [x] 2.4 เพิ่ม action `generate-backup` — สร้าง backup codes 8 ชุด (10 chars), เก็บ SHA-256 hash ใน DB, return plaintext codes (แสดงครั้งเดียว)
- [x] 2.5 เพิ่ม action `verify-backup` — รับ backup code, hash แล้วเทียบกับ DB, ลบ hash ที่ใช้แล้ว, ออก JWT ใหม่ถ้าถูกต้อง
- [x] 2.6 เพิ่ม action `disable` — ปิด MFA สำหรับผู้ใช้ (self หรือ admin reset)
- [x] 2.7 เพิ่ม rate limiting — นับ `failedAttempts`, ล็อค 5 นาทีถ้าผิด 5 ครั้งติด
- [x] 2.8 เพิ่ม audit log entries (`MFA_ENABLED`, `MFA_DISABLED`, `MFA_BACKUP_CODE_USED`, `MFA_RESET`) ทุก action
- [x] 2.9 สร้าง QR code data URL (`qrcode.toDataURL()`) สำหรับ `otpauth://` URI ใน action `setup`

## 3. ปรับปรุง MFA Setup Page (`app/(dashboard)/settings/mfa-setup/page.tsx`)

- [x] 3.1 ดึง TOTP secret และ QR code จาก API `/api/mfa` action `setup`
- [x] 3.2 แสดง QR Code จริง (เป็น `<img>` จาก data URL) แทน placeholder
- [x] 3.3 แสดง Secret Key สำหรับ manual entry
- [x] 3.4 เปลี่ยน verify flow — ส่ง OTP ไป API action `verify-setup` แทน `enable`
- [x] 3.5 หลังจาก verify สำเร็จ, แสดง Backup Codes (8 codes) พร้อมปุ่ม Download/Copy
- [x] 3.6 เพิ่มปุ่ม "ดูไม่เห็น QR Code?" สำหรับ manual entry
- [x] 3.7 แสดงสถานะ MFA ปัจจุบัน (Enabled/Disabled/Pending) ให้ชัดเจน

## 4. ปรับปรุง JWT Token ให้มี MFA Status

- [x] 4.1 เพิ่ม `mfaVerified` field ใน JWT token ผ่าน `jwt` callback ใน `lib/auth.ts`
- [x] 4.2 เพิ่ม logic ใน `jwt` callback: ถ้า role level ≥ 80 → ตรวจสอบ `UserMfa.isEnabled` → set `mfaVerified` ตามผลลัพธ์
- [x] 4.3 เพิ่ม `session` callback ให้ส่ง `mfaVerified` ไปยัง client session
- [x] 4.4 อัปเดต type definition ใน `types/next-auth.d.ts` ให้มี `mfaVerified?: boolean`

## 5. ปรับปรุง Login Flow (`app/(auth)/login/page.tsx`)

- [x] 5.1 หลังจาก signIn สำเร็จด้วย credentials, ตรวจสอบ session ว่าต้องการ MFA หรือไม่
- [x] 5.2 ถ้าต้องการ MFA และตั้งค่าแล้ว → แสดง OTP input สำหรับ `verify-login`
- [x] 5.3 ถ้าต้องการ MFA แต่ยังไม่ได้ตั้งค่า → redirect ไป `/settings/mfa-setup`
- [x] 5.4 เพิ่มปุ่ม "ใช้ Backup Code" ในหน้า login สำหรับกรณีเข้า Authenticator ไม่ได้
- [x] 5.5 แสดง error message ชัดเจนเมื่อ OTP ไม่ถูกต้อง หรือถูกล็อค
- [x] 5.6 หลังจาก verify OTP สำเร็จ → refresh session เพื่อให้ JWT ใหม่มี `mfaVerified: true`

## 6. ปรับปรุง Middleware (`middleware.ts`)

- [x] 6.1 อ่าน `mfaVerified` จาก JWT token ใน middleware
- [x] 6.2 ถ้า path ไม่ใช่ `/settings/mfa-setup` และ `mfaVerified === false` → redirect ไป `/settings/mfa-setup`
- [x] 6.3 อนุญาตให้เข้าถึง `/settings/mfa-setup` แม้ `mfaVerified === false`
- [x] 6.4 อนุญาตให้เข้าถึง `/api/mfa` แม้ `mfaVerified === false` (เพื่อให้ setup flow ทำงานได้)

## 7. ปรับปรุง Auth Settings Page

- [x] 7.1 ผูก MFA toggle กับ API — อ่าน/เขียนค่า `mfaRequired` จาก `SystemConfig` table
- [x] 7.2 แสดงจำนวนผู้ใช้ที่ต้องตั้งค่า MFA และจำนวนที่ตั้งค่าแล้ว
- [x] 7.3 เมื่อ toggle ปิด MFA enforcement → ไม่บังคับผู้ใช้ใหม่ แต่ผู้ใช้ที่ตั้งค่าแล้วยังคงมี MFA อยู่

## 8. ทดสอบและตรวจสอบ

- [ ] 8.1 ทดสอบ flow: System Admin ใหม่ → login → redirect MFA setup → scan QR → verify OTP → เห็น backup codes → เข้า dashboard ได้ ⚠ Manual test
- [ ] 8.2 ทดสอบ flow: System Admin ที่มี MFA แล้ว → login → ใส่ OTP → เข้า dashboard ⚠ Manual test
- [ ] 8.3 ทดสอบ flow: User ธรรมดา → login ปกติ → ไม่ต้องตั้ง MFA ⚠ Manual test
- [ ] 8.4 ทดสอบ backup code: login → ใช้ backup code → เข้า dashboard → code เดิมใช้ซ้ำไม่ได้ ⚠ Manual test
- [ ] 8.5 ทดสอบ rate limiting: ใส่ OTP ผิด 5 ครั้ง → ถูกล็อค 5 นาที ⚠ Manual test
- [ ] 8.6 ทดสอบ middleware: เข้า `/dashboard` โดยตรงเมื่อ `mfaVerified: false` → redirect `/settings/mfa-setup` ⚠ Manual test
- [ ] 8.7 ตรวจสอบ audit log: มี log ทุก MFA action ⚠ Manual test
