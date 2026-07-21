## Why

ระบบ Login ปัจจุบันรองรับ Microsoft Entra ID (Azure AD) แบบบางส่วน — มีการตั้งค่า OAuth provider ใน `auth.ts` แล้ว แต่ยังขาดฟีเจอร์สำคัญที่ทำให้ SSO ใช้งานได้จริงใน production ได้แก่: ไม่มีปุ่ม "Sign in with Microsoft" บนหน้า Login, ไม่มีการ auto-provision ผู้ใช้ Azure AD เข้าฐานข้อมูล, ไม่มีการ map role จาก Azure AD group claims, และไม่มีการทำ account linking ระหว่างบัญชี Azure AD กับบัญชีท้องถิ่น ทำให้ระบบ SSO ที่เป็น Primary Auth ตามสเปกไม่สามารถใช้งานได้จริง

## What Changes

- เพิ่มปุ่ม "Sign in with Microsoft" บนหน้า Login ด้านล่างฟอร์ม Credentials
- รองรับ Microsoft Entra ID Redirect URI `/api/auth/callback/microsoft-entra` อย่างถูกต้อง
- สร้างระบบ auto-provision: เมื่อผู้ใช้ Azure AD login ครั้งแรก ระบบจะสร้าง user ในฐานข้อมูลอัตโนมัติ พร้อม role default เป็น `user`
- รองรับการ map Azure AD group claims สู่ role ในระบบ (เช่น ผู้ใช้ในกลุ่ม `TU-LAW-Admins` ได้รับ role `system_admin`)
- รองรับ account linking: หากอีเมล Azure AD ตรงกับผู้ใช้ที่มีอยู่แล้วในระบบ ให้ผูกบัญชีเข้าด้วยกัน
- ปรับปรุง JWT callback ให้ดึงข้อมูลผู้ใช้จากฐานข้อมูลเมื่อ login ผ่าน Azure AD (แทนการกำหนด role ตายตัวเป็น `["user"]`)
- ปรับ `authSource` ใน User model ให้รองรับค่า `"azure"` แยกจาก `"ldap"` และ `"local"`
- ปรับปรุง MFA flow ให้รองรับผู้ใช้ Azure AD (Azure AD users ระดับ admin ต้องผ่าน MFA เช่นเดียวกับ local users)
- แสดง error message ที่ชัดเจนเมื่อการเชื่อมต่อ Azure AD ล้มเหลว

## Capabilities

### New Capabilities
- `azure-entra-id-auth`: ระบบยืนยันตัวตนด้วย Microsoft Entra ID (Azure AD) แบบเต็มรูปแบบ — auto-provision ผู้ใช้, map role จาก group claims, account linking, และ UI ปุ่ม Sign in with Microsoft

### Modified Capabilities
- `mfa-enforcement`: MFA enforcement ต้องรองรับผู้ใช้ที่ login ผ่าน Azure AD (ปัจจุบันใช้ `roleLevel >= 80` ซึ่งทำงานผ่าน JWT token เช่นเดิม แต่ต้องมั่นใจว่า Azure AD users ได้รับ role ที่ถูกต้องก่อนถึง MFA check)

## Impact

- **`lib/auth.ts`**: แก้ไข NextAuth configuration — ปรับ Microsoft Entra ID provider, JWT callback, signIn callback
- **`app/(auth)/login/page.tsx`**: เพิ่มปุ่ม "Sign in with Microsoft" และปรับ UI/UX ให้ SSO เป็น primary option
- **`lib/auth-source.ts`**: เพิ่ม auth source type `azure` และฟังก์ชันที่เกี่ยวข้อง
- **`prisma/schema.prisma`**: (อาจจำเป็น) เพิ่ม field สำหรับเก็บ Azure AD object ID หรือ group claims
- **`middleware.ts`**: ตรวจสอบว่า MFA enforcement ทำงานถูกต้องกับ Azure AD users
- **`.env`**: ตรวจสอบและเพิ่ม environment variables สำหรับ Azure AD (client ID, secret, tenant ID, group claim mapping)
