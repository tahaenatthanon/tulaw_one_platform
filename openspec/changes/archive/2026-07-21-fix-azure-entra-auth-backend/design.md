## Context

ระบบ TULAW ONE Platform มีการ integrate Microsoft Entra ID ผ่าน NextAuth.js OAuth provider ซึ่งเป็น black-box approach — NextAuth จัดการ authorize, token exchange, และ profile fetching ให้อัตโนมัติผ่าน `wellKnown` discovery URL แต่มีข้อจำกัด:

- **Scope ไม่ครอบคลุม**: scope ปัจจุบันคือ `openid profile email` — ไม่มี `User.Read` ทำให้เรียก Microsoft Graph API `/v1.0/me` ไม่ได้
- **ควบคุม flow ไม่ได้ละเอียด**: ไม่สามารถเพิ่ม custom logic ในขั้นตอน token exchange หรือปรับแต่ง request/response ได้
- **CSRF protection**: NextAuth จัดการ state ให้ภายใน แต่ไม่สามารถ customize ได้

การ implement OAuth flow แบบ explicit จะทำให้เราควบคุมทุกขั้นตอนได้ตาม requirement ของมหาวิทยาลัย

## Goals / Non-Goals

**Goals:**
- Implement Microsoft Entra ID OAuth 2.0 Authorization Code Flow แบบ explicit ผ่าน Next.js Route Handlers
- รองรับ scope `User.Read` เพื่อเรียก Microsoft Graph API
- Implement CSRF protection ผ่าน state parameter + HTTP-only cookie
- คงระบบ auto-provision, account linking, group-to-role mapping จากของเดิม
- ห้ามแก้ไข UI ใดๆ

**Non-Goals:**
- ไม่ใช้ library OAuth ภายนอก (ทำเองทั้งหมดด้วย `fetch`)
- ไม่เปลี่ยน Credentials login flow
- ไม่เปลี่ยน UI (ปุ่ม, หน้า login, layout)
- ไม่ implement token refresh (ใช้ NextAuth session management เดิม)

## Decisions

### 1. ใช้ Next.js Route Handlers แทน NextAuth OAuth Provider

**เลือก:** สร้าง Route Handler 2 ตัว: `/api/auth/azure/login` (authorize redirect) และ `/api/auth/azure/callback` (token exchange + session creation)

**เหตุผล:** ควบคุม OAuth flow ได้เต็มรูปแบบ — สร้าง authorize URL เอง, แลก code เป็น token ด้วย fetch(), เรียก Microsoft Graph API, แล้วใช้ NextAuth `signIn("credentials")` แบบ programmatic เพื่อสร้าง session

**ทางเลือกที่พิจารณา:** ใช้ NextAuth OAuth provider ต่อ — แต่ต้องใช้ `wellKnown` discovery และไม่สามารถปรับ scope/parameters ได้อิสระ

### 2. OAuth Flow: 6-Step Authorization Code Flow

```
Step 1: GET /api/auth/azure/login
  → generate state token (crypto.randomBytes)
  → set azure_auth_state cookie (httpOnly, 10min expiry)
  → redirect to https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
    ?client_id=...&redirect_uri=...&response_type=code
    &scope=openid+email+profile+User.Read&state={token}

Step 2: User authenticates on Microsoft login page

Step 3: Microsoft redirects to /api/auth/azure/callback?code=...&state=...

Step 4: GET /api/auth/azure/callback
  → validate state cookie === query state
  → POST to https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
    { client_id, client_secret, code, redirect_uri, grant_type: "authorization_code" }
  → get access_token from response

Step 5: GET https://graph.microsoft.com/v1.0/me
  → Authorization: Bearer {access_token}
  → get user profile (id, email, displayName)

Step 6: Auto-provision / account linking (same logic from lib/auth.ts)
  → programmatic NextAuth signIn("credentials")
  → redirect to /dashboard
```

### 3. Session Creation: Programmatic NextAuth signIn

**เลือก:** ใช้ NextAuth `signIn("credentials")` แบบ programmatic ใน Route Handler เพื่อสร้าง JWT session

**เหตุผล:** ใช้ session management ของ NextAuth ที่มีอยู่แล้ว (JWT, RBAC, MFA) โดยไม่ต้อง implement ใหม่ — แค่ยิง `/api/auth/callback/credentials` ด้วย identity ที่ยืนยันแล้ว

**Implementation:** หลังจากได้ข้อมูลจาก Microsoft Graph API และ auto-provision ผู้ใช้ใน DB แล้ว → สร้าง JWT โดยตรง (ไม่ต้องผ่าน credentials provider) หรือใช้ NextAuth `signIn` callback แบบ programmatic

### 4. State Token Storage: HTTP-only Cookie

**เลือก:** เก็บ state token ใน HTTP-only cookie `azure_auth_state` แทน session storage หรือ signed URL

**เหตุผล:** Cookie แบบ httpOnly ป้องกัน XSS, SameSite=Lax ป้องกัน CSRF ข้ามไซต์, และ server-side เท่านั้นที่อ่านค่าได้

### 5. Utility Module: lib/azure-ad.ts

**เลือก:** สร้าง `lib/azure-ad.ts` เป็น shared utility module ที่มีฟังก์ชัน:
- `generateAuthUrl(tenantId, clientId, redirectUri, state)` → string
- `exchangeCodeForToken(tenantId, clientId, clientSecret, code, redirectUri)` → Promise<{access_token}>
- `getUserProfile(accessToken)` → Promise<{id, email, displayName}>

**เหตุผล:** แยก logic OAuth ออกจาก Route Handler ทำให้ test ได้ง่าย และ reuse ได้ถ้าต้องการในอนาคต

## Risks / Trade-offs

- **[Risk] State cookie อาจหายถ้าผู้ใช้เปลี่ยน browser** → Mitigation: ใช้ cookie ธรรมดา (ไม่ใช่ session) — ถ้า state ไม่ตรงกัน redirect กลับ `/login` ทันที
- **[Risk] Microsoft Graph API อาจมี downtime** → Mitigation: retry 1 ครั้งก่อน fail; fallback ไปที่ error page
- **[Risk] Token exchange อาจ fail ถ้า client secret หมดอายุ** → Mitigation: log error ชัดเจน; ผู้ดูแลระบบต้อง rotate secret ใน Azure Portal
- **[Risk] การเปลี่ยนจาก NextAuth OAuth → Route Handler อาจทำให้ callback URL เปลี่ยน** → Mitigation: ใช้ `/api/auth/azure/callback` เป็น redirect URI ใหม่; ต้องอัปเดต Azure Portal
- **[Risk] Env var names mismatch: `MICROSOFT_CLIENT_ID` vs `AUTH_MICROSOFT_ENTRA_ID_ID`** → Mitigation: ใช้ `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` ใน Route Handlers ทุกจุด (ไม่ใช้ `AUTH_MICROSOFT_ENTRA_ID_*` ซึ่งเป็นของ NextAuth provider เดิม)
