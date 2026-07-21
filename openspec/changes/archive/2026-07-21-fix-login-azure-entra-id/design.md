## Context

ระบบ TULAW ONE Platform ออกแบบให้ Microsoft Entra ID (Azure AD) เป็น Primary Authentication ตามที่ระบุใน `claude.md` section 10.1 แต่ปัจจุบันการ implement ยังไม่สมบูรณ์:

- `lib/auth.ts` มีการตั้งค่า OAuth provider สำหรับ Microsoft Entra ID แล้ว แต่ใช้การ config แบบ manual (ไม่ได้ใช้ built-in provider)
- JWT callback กำหนด role เป็น `["user"]` ตายตัวสำหรับ Azure AD users โดยไม่ lookup จากฐานข้อมูล
- ไม่มี signIn callback สำหรับ auto-provision ผู้ใช้ใหม่
- หน้า Login (`app/(auth)/login/page.tsx`) ไม่มีปุ่ม Sign in with Microsoft
- `authSource` ใน User model รองรับแค่ `"ldap"` และ `"local"` ยังไม่มี `"azure"`

เทคโนโลยีที่เกี่ยวข้อง: NextAuth.js 5, Next.js 16 App Router, Prisma ORM 7, PostgreSQL

## Goals / Non-Goals

**Goals:**
- ทำให้ผู้ใช้สามารถ login ด้วยบัญชี Microsoft Entra ID (Azure AD) ได้จากหน้า Login โดยตรง
- Auto-provision ผู้ใช้ใหม่ที่ login ผ่าน Azure AD ครั้งแรกเข้าสู่ฐานข้อมูล
- Map Azure AD group claims สู่ role ในระบบ RBAC
- ทำ account linking เมื่ออีเมล Azure AD ตรงกับผู้ใช้ที่มีอยู่แล้วในฐานข้อมูล
- แสดง UI ปุ่ม "Sign in with Microsoft" ที่เด่นชัดบนหน้า Login
- รองรับ MFA enforcement สำหรับ Azure AD users ที่มี role level ≥ 80
- แยก auth source `"azure"` ออกจาก `"ldap"` และ `"local"` อย่างชัดเจน

**Non-Goals:**
- ไม่เปลี่ยนระบบ Credentials Login เดิม (ยังคงใช้เป็น Fallback)
- ไม่ implement Azure AD B2C (ใช้เฉพาะ Entra ID สำหรับองค์กร)
- ไม่รองรับ multiple Azure AD tenants พร้อมกัน (ในเฟสนี้ใช้ single tenant)
- ไม่เปลี่ยนโครงสร้าง RBAC หรือ permission codes

## Decisions

### 1. ใช้ NextAuth.js Built-in Microsoft Entra ID Provider แทน Manual OAuth Config

**เลือก:** ใช้ `@auth/core` Microsoft Entra ID provider (`import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"`)

**เหตุผล:** Built-in provider จัดการ OAuth flow, token refresh, และ profile parsing ให้อัตโนมัติ ลดโค้ดที่ต้องเขียนเองและลดความเสี่ยงจากความผิดพลาด

**ทางเลือกที่พิจารณา:** คง manual OAuth config เดิมไว้ — แต่ต้องเขียน profile callback, authorization params และ token handling เองทั้งหมด เสี่ยงต่อปัญหาเมื่อ Microsoft เปลี่ยน endpoint

### 2. Auto-Provision ผ่าน signIn Callback

**เลือก:** ใช้ `signIn` callback ใน NextAuth options เพื่อตรวจสอบว่าผู้ใช้มีอยู่ใน DB หรือไม่ หากไม่มีให้สร้างใหม่

**เหตุผล:** signIn callback เป็นจุดที่เหมาะสมที่สุดในการแทรก logic auto-provision เพราะทำงานหลังจาก Azure AD verify ตัวตนสำเร็จ แต่ก่อนสร้าง session

**Flow:**
1. Azure AD returns `profile` (email, name, oid)
2. signIn callback ค้นหา user ด้วย email
3. ถ้าไม่พบ → สร้าง user ใหม่ด้วย `authSource: "azure"`, role default `"user"`
4. ถ้าพบแต่ `authSource` เป็น `"ldap"` หรือ `"local"` → ทำ account linking (อัปเดต `authSource` หรือเก็บ Azure AD object ID)
5. JWT callback ดึง role จาก DB (ไม่ใช่กำหนดตายตัว)

### 3. Group Claims Mapping ผ่าน Environment Variables

**เลือก:** ใช้ environment variable `AUTH_MICROSOFT_ENTRA_ID_GROUP_MAP` เพื่อกำหนด mapping ระหว่าง Azure AD group ID กับ role code

**รูปแบบ:** `AUTH_MICROSOFT_ENTRA_ID_GROUP_MAP={"group-uuid-1":"system_admin","group-uuid-2":"dept_admin"}`

**เหตุผล:** group ID เป็น UUID ที่ไม่เปลี่ยนแปลงบ่อย การ map ผ่าน env var ทำให้ปรับเปลี่ยนได้โดยไม่ต้อง deploy โค้ดใหม่

**ทางเลือกที่พิจารณา:** เก็บ mapping ใน DB — ซับซ้อนเกินไปสำหรับเฟสแรก และต้องสร้าง UI สำหรับจัดการ

### 4. ปุ่ม Sign in with Microsoft อยู่ด้านล่างฟอร์ม Credentials

**เลือก:** แสดงปุ่ม "Sign in with Microsoft" ด้านล่างฟอร์ม Credentials โดยมีเส้นคั่น "หรือ" ระหว่างสองวิธี

**เหตุผล:** ตามสเปก claude.md ระบุให้ Credentials เป็น Primary Auth — UI ควรแสดงฟอร์ม Credentials ด้านบนเป็นหลัก และปุ่ม Microsoft เป็นตัวเลือกสำรองด้านล่าง

### 5. Account Linking Strategy

**เลือก:** เมื่ออีเมล Azure AD ตรงกับ user ที่มีอยู่แล้ว (authSource เป็น `"ldap"` หรือ `"local"`):
- อัปเดต `authSource` เป็น `"azure"`
- บันทึก Azure AD Object ID ลง `UserAdProfile` หรือ field ใหม่ (เช่น `azureAdObjectId`)
- role คงเดิม ไม่เปลี่ยนแปลงจากการ login ด้วย Azure AD

**เหตุผล:** หลีกเลี่ยงการสร้างบัญชีซ้ำซ้อน และรักษา role ที่ admin กำหนดไว้แล้ว

## Risks / Trade-offs

- **[Risk] Azure AD อาจมี downtime หรือ latency** → Mitigation: Credentials Login ยังคงใช้ได้เป็น Fallback เสมอ
- **[Risk] Group claims อาจไม่ถูกส่งมาถ้า Azure AD App Registration ตั้งค่าไม่ถูกต้อง** → Mitigation: เพิ่ม logging และ error handling ที่ชัดเจน; ถ้าไม่มี group claims ใช้ default role `"user"`
- **[Risk] การเปลี่ยน authSource จาก ldap เป็น azure อาจกระทบฟีเจอร์อื่นที่เช็ค authSource** → Mitigation: ตรวจสอบทุกจุดที่ใช้ `authSource` ก่อน deploy; `lib/auth-source.ts` รองรับค่า `"azure"` แล้ว
- **[Risk] Azure AD Redirect URI ต้องตรงกับที่ลงทะเบียนใน Azure Portal** → Mitigation: ใช้ URI `/api/auth/callback/microsoft-entra` ที่ NextAuth สร้างให้อัตโนมัติ; ต้องอัปเดต Azure Portal ให้ตรงกัน

## Migration Plan

1. อัปเดต Azure AD App Registration ใน Azure Portal ให้เพิ่ม Redirect URI: `{NEXTAUTH_URL}/api/auth/callback/microsoft-entra`
2. เพิ่ม environment variables: `AUTH_MICROSOFT_ENTRA_ID_GROUP_MAP`
3. Deploy โค้ดใหม่
4. ทดสอบ login ด้วยบัญชี Azure AD จริง
5. Rollback (ถ้าจำเป็น): เปลี่ยน redirect URI กลับเป็นค่าเดิม และ revert โค้ด

## Open Questions

- **Q:** Azure AD Tenant เป็นแบบ single tenant หรือ multi-tenant? → สมมติเป็น single tenant (`AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` ที่มีอยู่แล้ว)
- **Q:** ต้องการให้แสดงชื่อไทยหรืออังกฤษในระบบหลัง login ด้วย Azure AD? → ใช้ชื่อไทย (firstNameTh, lastNameTh) ถ้ามีใน DB; ถ้าเป็น user ใหม่ให้ใช้ displayName จาก Azure AD
