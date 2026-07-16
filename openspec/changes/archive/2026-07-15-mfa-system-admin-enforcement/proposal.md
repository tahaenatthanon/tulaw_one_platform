## Why

ปัจจุบันระบบ MFA มีโครงสร้างพื้นฐานบางส่วนแล้ว (UserMfa model, MFA setup page, MFA API endpoint) แต่ยังขาดการบังคับใช้จริง ณ จุดล็อกอิน ผู้ใช้ระดับ System Admin และ Super Admin สามารถเข้าสู่ระบบได้โดยไม่ต้องตั้งค่า MFA ซึ่งเป็นช่องโหว่ด้านความปลอดภัยที่สำคัญสำหรับบัญชีผู้ดูแลระบบที่มีสิทธิ์สูงสุด ตามข้อกำหนดใน claude.md MFA เป็นข้อบังคับ (Required for Admin+) และต้องบังคับใช้อย่างแท้จริง

## What Changes

- เพิ่มขั้นตอนบังคับ MFA ใน flow การล็อกอิน: เมื่อผู้ใช้ระดับ System Admin+ (level ≥ 80) ล็อกอินสำเร็จด้วยรหัสผ่านแล้ว ระบบต้องตรวจสอบว่าได้ตั้งค่า MFA แล้วหรือไม่ หากยังไม่ได้ตั้งค่า ให้ redirect ไปยังหน้า `/settings/mfa-setup` และบล็อกการเข้าใช้งานส่วนอื่นจนกว่าจะตั้งค่าเสร็จ
- เพิ่มการยืนยัน OTP (TOTP) ระหว่างล็อกอิน: หลังจากใส่รหัสผ่านถูกต้องแล้ว ผู้ใช้ที่เปิด MFA แล้วต้องกรอกรหัส OTP 6 หลักก่อนเข้าใช้งาน
- ใช้ TOTP จริงด้วยไลบรารี `otplib` หรือ `speakeasy` แทน placeholder secret
- เพิ่ม QR Code จริงสำหรับการตั้งค่าในแอป Authenticator (Google Authenticator, Microsoft Authenticator)
- สร้าง Backup Codes สำหรับการกู้คืนเมื่อไม่สามารถใช้ Authenticator ได้
- เพิ่ม MFA enforcement ใน middleware.ts สำหรับ redirect ผู้ใช้ที่ต้องตั้งค่า MFA ไปยังหน้า `/settings/mfa-setup`
- เพิ่ม API endpoint สำหรับ verify OTP, generate backup codes, และ reset MFA (สำหรับ Super Admin เท่านั้น)
- เพิ่ม Audit Log event เมื่อมีการตั้งค่า/ปิดใช้งาน/รีเซ็ต MFA

## Capabilities

### New Capabilities
- `mfa-enforcement`: บังคับใช้ MFA สำหรับ System Admin+ ใน flow การล็อกอิน พร้อม OTP verification, TOTP setup, backup codes, และ enforcement ใน middleware

### Modified Capabilities
<!-- None - existing specs are not changing at the requirement level -->

## Impact

- **Middleware (`middleware.ts`)**: เพิ่มการตรวจสอบ MFA status และ redirect ไป `/settings/mfa-setup` สำหรับผู้ใช้ที่ยังไม่ได้ตั้งค่า
- **Auth flow (`lib/auth.ts`)**: เพิ่ม JWT callback เพื่อตรวจสอบและบันทึก MFA status ใน token
- **Login page (`app/(auth)/login/page.tsx`)**: เพิ่มขั้นตอน OTP verification หลังใส่รหัสผ่านสำเร็จ
- **MFA Setup page (`app/(dashboard)/settings/mfa-setup/page.tsx`)**: ปรับปรุงให้ใช้ TOTP จริง พร้อม QR Code scan และ backup codes
- **MFA API (`app/api/mfa/route.ts`)**: ปรับปรุงให้รองรับ TOTP จริง, verify OTP, generate backup codes, reset MFA
- **Auth Settings (`app/(dashboard)/settings/auth-settings/page.tsx`)**: ปรับปรุงให้ MFA toggle มีผลจริงต่อ enforcement
- **Database (`UserMfa`)**: อาจเพิ่มฟิลด์ `backupCodes` (JSON) สำหรับเก็บ backup codes
- **Package dependencies**: เพิ่ม `otplib` สำหรับ TOTP generation/verification และ `qrcode` สำหรับ QR code generation
