## 1. ฐานข้อมูลและ Environment Variables

- [x] 1.1 เพิ่ม `azureAdObjectId` field ใน `UserAdProfile` model หรือ `User` model สำหรับเก็บ Azure AD Object ID
- [x] 1.2 ตรวจสอบและเพิ่ม environment variable `AUTH_MICROSOFT_ENTRA_ID_GROUP_MAP` พร้อมตัวอย่างค่า
- [x] 1.3 ตรวจสอบว่า `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` มีค่าถูกต้อง

## 2. ระบบยืนยันตัวตน (auth.ts)

- [x] 2.1 ติดตั้ง `@auth/core` Microsoft Entra ID provider (ถ้ายังไม่ได้ติดตั้ง) และเปลี่ยนจาก manual OAuth config เป็น built-in provider
- [x] 2.2 เพิ่ม `signIn` callback สำหรับ auto-provision: ตรวจสอบผู้ใช้ใน DB → สร้างใหม่ถ้าไม่พบ → account linking ถ้าพบ
- [x] 2.3 ปรับปรุง `jwt` callback: ดึง role จาก DB สำหรับ Azure AD users แทนการกำหนด `["user"]` ตายตัว
- [x] 2.4 เพิ่ม logic ตรวจสอบ Azure AD group claims และ map สู่ system roles ตาม `AUTH_MICROSOFT_ENTRA_ID_GROUP_MAP`
- [x] 2.5 เพิ่ม `profile` callback สำหรับดึงข้อมูลจาก Azure AD profile (email, name, oid)

## 3. หน้า Login UI

- [x] 3.1 เพิ่มปุ่ม "Sign in with Microsoft" บนหน้า Login (`app/(auth)/login/page.tsx`)
- [x] 3.2 ปุ่ม Microsoft ต้องอยู่ด้านล่างฟอร์ม Credentials พร้อมเส้นคั่น "หรือ"
- [x] 3.3 ซ่อนปุ่ม Microsoft เมื่อไม่มีการตั้งค่า Azure AD (env vars ไม่ครบ)
- [x] 3.4 เพิ่ม loading state และ disabled state บนปุ่ม Sign in with Microsoft
- [x] 3.5 อัปเดตการแสดงผล error ให้ครอบคลุม Azure AD errors (OAuthSignin, OAuthCallback, OAuthCreateAccount, OAuthAccountNotLinked)

## 4. Auth Source Utilities

- [x] 4.1 เพิ่ม type `"azure"` ใน `AuthSource` ของ `lib/auth-source.ts`
- [x] 4.2 เพิ่มฟังก์ชัน `isAzureUser()` ใน `lib/auth-source.ts`
- [x] 4.3 อัปเดต `getAuthSourceLabel()` ให้คืนค่า `"Azure AD"` สำหรับ `authSource: "azure"`
- [x] 4.4 ปรับ `canEditUser()` ให้ Azure AD users ไม่สามารถแก้ไข core profile ได้ (อ่านอย่างเดียวจาก Azure AD)

## 5. Middleware และ MFA

- [x] 5.1 ตรวจสอบว่า `middleware.ts` MFA enforcement ทำงานถูกต้องกับผู้ใช้ที่ login ผ่าน Azure AD
- [x] 5.2 ตรวจสอบว่า Azure AD users ที่มี role level ≥ 80 ถูก redirect ไป `/settings/mfa-setup` เมื่อยังไม่ได้ตั้งค่า MFA
- [x] 5.3 ตรวจสอบว่า Azure AD users ที่มี role level < 30 ได้รับ `mfaVerified: true` อัตโนมัติ

## 6. ทดสอบและตรวจสอบ

- [ ] 6.1 ทดสอบ login ด้วยบัญชี Azure AD จริง — ตรวจสอบ auto-provision และ role assignment (ต้องทำหลัง Task 6.6)
- [ ] 6.2 ทดสอบ account linking — login ด้วยอีเมลที่มีอยู่แล้วในระบบ (ต้องทำหลัง Task 6.6)
- [x] 6.3 ทดสอบ error handling — ยกเลิก consent, Azure AD ไม่พร้อมใช้งาน
- [ ] 6.4 ทดสอบ MFA flow สำหรับ Azure AD admin users (ต้องทำหลัง Task 6.6)
- [ ] 6.5 ตรวจสอบ audit log ว่าบันทึกการ login ผ่าน Azure AD ถูกต้อง (ต้องทำหลัง Task 6.6)
- [ ] 6.6 อัปเดต Azure AD App Registration Redirect URI ใน Azure Portal เป็น `{NEXTAUTH_URL}/api/auth/callback/microsoft-entra`
