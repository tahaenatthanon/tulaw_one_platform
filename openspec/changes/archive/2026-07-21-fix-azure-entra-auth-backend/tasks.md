## 1. สร้าง OAuth Utility Module

- [x] 1.1 สร้างไฟล์ `lib/azure-ad.ts` สำหรับ Azure AD OAuth utility functions
- [x] 1.2 ฟังก์ชัน `generateAuthUrl(tenantId, clientId, redirectUri, state)` — สร้าง authorization URL พร้อม query params (`client_id`, `redirect_uri`, `response_type=code`, `scope=openid email profile User.Read`, `state`)
- [x] 1.3 ฟังก์ชัน `exchangeCodeForToken(tenantId, clientId, clientSecret, code, redirectUri)` — POST ไปยัง token endpoint, return `{ access_token }`
- [x] 1.4 ฟังก์ชัน `getUserProfile(accessToken)` — GET `https://graph.microsoft.com/v1.0/me`, return `{ id, email, displayName }`

## 2. สร้าง Route Handler: Authorization

- [x] 2.1 สร้างไฟล์ `app/api/auth/azure/login/route.ts` — GET handler
- [x] 2.2 อ่าน `MICROSOFT_CLIENT_ID`, `MICROSOFT_TENANT_ID`, `BASE_URL` จาก environment variables
- [x] 2.3 สร้าง `state` token ด้วย `crypto.randomBytes(16).toString("hex")`
- [x] 2.4 ตั้งค่า HTTP-only cookie `azure_auth_state` (value=state, httpOnly, sameSite=lax, path=/, maxAge=600)
- [x] 2.5 สร้าง authorization URL ด้วย `generateAuthUrl()` และ redirect (HTTP 302)

## 3. สร้าง Route Handler: Callback + Token Exchange

- [x] 3.1 สร้างไฟล์ `app/api/auth/azure/callback/route.ts` — GET handler
- [x] 3.2 ตรวจสอบ `state` query parameter ตรงกับ `azure_auth_state` cookie → ไม่ตรง redirect `/login?error=csrf`
- [x] 3.3 แลก `code` เป็น `access_token` ด้วย `exchangeCodeForToken()`
- [x] 3.4 เรียก Microsoft Graph API `/v1.0/me` ด้วย `getUserProfile()` เพื่อดึง `id`, `email`, `displayName`
- [x] 3.5 Auto-provision / account linking: ใช้ logic เดียวกับ `signIn` callback ใน `lib/auth.ts` (สร้าง user ถ้าไม่พบ, link account ถ้าพบ)
- [x] 3.6 สร้าง NextAuth session แบบ programmatic (ผ่าน `signIn("credentials")` หรือสร้าง JWT โดยตรง)
- [x] 3.7 Redirect ผู้ใช้ไปยัง `/dashboard` หลังจากสร้าง session สำเร็จ
- [x] 3.8 Handle error cases: token exchange fail, Graph API fail → redirect `/login?error=OAuthCallback`

## 4. ปรับปรุง auth.ts

- [x] 4.1 ลบหรือ comment out Microsoft OAuth provider จาก `buildProviders()` ใน `lib/auth.ts`
- [x] 4.2 คง CredentialsProvider ไว้สำหรับ fallback login
- [x] 4.3 คง JWT callback, session callback, signIn callback ไว้ (ยังใช้สำหรับ auto-provision logic ที่ถูกเรียกจาก Route Handler)

## 5. อัปเดต UI Button Redirect URL

- [x] 5.1 แก้ไขปุ่ม "Sign in with Microsoft" ใน `login-form.tsx` ให้ redirect ไป `/api/auth/azure/login` (แทน `/api/auth/signin/microsoft-entra`)
- [x] 5.2 คง UI, loading state, error handling และ layout เดิมทั้งหมด

## 6. Environment Variables

- [x] 6.1 ตรวจสอบว่ามี env vars `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`, `BASE_URL` ใน `.env`
- [x] 6.2 ตรวจสอบว่า `BASE_URL` ตรงกับ `http://localhost:3000` (dev) หรือ production URL
- [x] 6.3 แก้ไข Route Handlers ให้ใช้ `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` (แทน `AUTH_MICROSOFT_ENTRA_ID_*` ซึ่งเป็นของ NextAuth provider เดิมและไม่ตรงกับ `.env` ปัจจุบัน)

## 7. อัปเดต Azure Portal

- [ ] 7.1 อัปเดต Redirect URI ใน Azure Portal App Registration เป็น `{BASE_URL}/api/auth/azure/callback`

## 8. ทดสอบ

- [ ] 8.1 ทดสอบ OAuth flow ทั้งหมด: กดปุ่ม Microsoft → redirect ไป Microsoft login → login สำเร็จ → redirect กลับมาที่ callback → session ถูกสร้าง → redirect ไป `/dashboard`
- [ ] 8.2 ทดสอบกรณี error: ยกเลิก consent, state ไม่ตรง, token exchange fail
- [ ] 8.3 ทดสอบ auto-provision: ผู้ใช้ใหม่ login ด้วย Azure AD → user ถูกสร้างใน DB
- [ ] 8.4 ทดสอบ account linking: อีเมลที่มีอยู่แล้ว login ด้วย Azure AD → account ถูกลิงก์
