## Why

ระบบ Login ด้วย Microsoft Entra ID ปัจจุบันใช้ NextAuth.js OAuth provider ซึ่งทำงานแบบ black-box — ควบคุม OAuth flow ไม่ได้ละเอียดพอในบางจุด เช่น scope ไม่ครบ (ขาด `User.Read` ทำให้เรียก Microsoft Graph API ไม่ได้), ไม่มีการ validate state token เพื่อป้องกัน CSRF, และไม่ยืดหยุ่นพอเมื่อต้องปรับแต่ง flow ตาม requirement ของมหาวิทยาลัย จำเป็นต้อง implement Azure AD OAuth flow ด้วยตัวเองแบบ explicit เพื่อให้ควบคุมทุกขั้นตอนได้

## What Changes

- **BREAKING**: แทนที่ NextAuth Microsoft Entra OAuth provider ด้วย Route Handler ที่ implement OAuth 2.0 Authorization Code Flow กับ Microsoft Identity Platform โดยตรง
- สร้าง Route Handler `/api/auth/azure/login` สำหรับ redirect ผู้ใช้ไปยัง Microsoft authorization endpoint พร้อม state token (CSRF protection)
- สร้าง Route Handler `/api/auth/azure/callback` สำหรับรับ authorization code จาก Microsoft, แลกเป็น access_token, เรียก Microsoft Graph API `/v1.0/me` เพื่อดึงข้อมูลผู้ใช้
- เพิ่ม scope `User.Read` ใน authorization request เพื่อให้สามารถเรียก Microsoft Graph API ได้
- สร้างระบบ auto-provision ผู้ใช้ Azure AD ใน `signIn` callback (มีอยู่แล้วใน `lib/auth.ts` — ปรับให้ทำงานร่วมกับ Route Handler ใหม่)
- ใช้ NextAuth `signIn("credentials")` แบบ programmatic หลังจากยืนยันตัวตนกับ Microsoft สำเร็จ เพื่อสร้าง session
- ห้ามแก้ไข UI ใดๆ ทั้งสิ้น — หน้าตา Login, ปุ่ม, layout คงเดิมทั้งหมด

## Capabilities

### New Capabilities
- `azure-entra-oauth-backend`: ระบบ OAuth 2.0 Authorization Code Flow สำหรับ Microsoft Entra ID แบบ explicit — authorize endpoint, token exchange, Microsoft Graph API integration, CSRF protection ผ่าน state parameter, auto-provision ผู้ใช้

### Modified Capabilities
- `azure-entra-id-auth`: ปรับ requirement เดิมที่ใช้ NextAuth OAuth provider → เปลี่ยนเป็น Route Handler แบบ explicit OAuth flow (delta spec)

## Impact

- **`lib/auth.ts`**: แก้ไข NextAuth configuration — คง CredentialsProvider ไว้, ลบ Microsoft OAuth provider ออก (หรือคงไว้เป็น fallback), เพิ่ม authorize แบบ programmatic สำหรับ Azure AD
- **`app/api/auth/azure/login/route.ts`** (ใหม่): GET handler — สร้าง authorization URL, state token, redirect (ใช้ env vars `MICROSOFT_CLIENT_ID`, `MICROSOFT_TENANT_ID`, `BASE_URL`)
- **`app/api/auth/azure/callback/route.ts`** (ใหม่): GET handler — รับ authorization code, แลก token, เรียก Microsoft Graph API, auto-provision, สร้าง session (ใช้ env vars `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`)
- **`lib/azure-ad.ts`** (ใหม่): Utility functions สำหรับ Azure AD OAuth flow (สร้าง URL, แลก token, เรียก Graph API)
- **`.env`**: ใช้ environment variables `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`, `BASE_URL` (แทน `AUTH_MICROSOFT_ENTRA_ID_*` เดิมที่ใช้กับ NextAuth provider)
- **UI**: ไม่มีการแก้ไขใดๆ
