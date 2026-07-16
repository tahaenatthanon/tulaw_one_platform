## 1. Revert Auto-Save → Explicit Save

- [x] 1.1 ลบ auto-save logic (useRef, useCallback, useEffect ที่ trigger auto-save)
- [x] 1.2 เพิ่ม `dirty` state และ `markDirty` callback
- [x] 1.3 เพิ่ม `handleSave` function — รวบรวม authForm, ssoForm, brandingForm, storageForm → `PUT /api/settings`
- [x] 1.4 เรียก `applyBranding()` เฉพาะหลัง Save สำเร็จ
- [x] 1.5 เรียก `mutate()` หลัง Save เพื่อ refetch SWR

## 2. Save Button & Banner

- [x] 2.1 แสดง Save Banner เมื่อ `dirty === true` ("คุณยังไม่ได้บันทึกการเปลี่ยนแปลง" + ปุ่ม Save)
- [x] 2.2 ซ่อน Save Banner เมื่อ `dirty === false`
- [x] 2.3 แสดง Success Toast/Banner เมื่อ Save สำเร็จ
- [x] 2.4 แสดง Loading state ขณะกำลัง Save

## 3. Form State Management

- [x] 3.1 ใช้ `useState<AuthSettings>(DEFAULT_AUTH)` สำหรับ authForm
- [x] 3.2 ใช้ `useState<SsoSettings>(DEFAULT_SSO)` สำหรับ ssoForm
- [x] 3.3 ใช้ `useState<BrandingSettings>(DEFAULT_BRANDING)` สำหรับ brandingForm
- [x] 3.4 ใช้ `useState<StorageSettings>(DEFAULT_STORAGE)` สำหรับ storageForm
- [x] 3.5 Sync form values จาก SWR data เฉพาะตอนโหลดครั้งแรกและหลัง mutate
- [x] 3.6 ทุก onChange → `setXxxForm(f)` + `markDirty()`

## 4. Tab Switch — Preserve Unsaved Changes

- [x] 4.1 เมื่อเปลี่ยน tab → ค่าในฟอร์มยังคงอยู่ (ไม่ถูกรีเซ็ต)
- [x] 4.2 Dirty state แชร์ข้าม tabs (เปลี่ยน tab แล้วยัง dirty อยู่)

## 5. Unsaved Changes Warning

- [x] 5.1 เพิ่ม `beforeunload` event listener เมื่อ `dirty === true`
- [x] 5.2 แสดง confirmation dialog เมื่อผู้ใช้พยายามออกจากหน้าโดยยังไม่ได้ Save

## 6. All Fields Functional Verification

- [x] 6.1 Authentication: แก้ไข Session Timeout → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.2 Authentication: แก้ไข JWT Expiry → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.3 Authentication: แก้ไข Max Login Attempts → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.4 Authentication: แก้ไข MFA Enforcement → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.5 SSO/LDAP: แก้ไข LDAP URL → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.6 SSO/LDAP: แก้ไข Base DN → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.7 SSO/LDAP: แก้ไข Domain → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.8 SSO/LDAP: แก้ไข Sync Interval → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.9 Branding: เปลี่ยนชื่อระบบ → Save → รีเฟรช → ชื่อใหม่คงอยู่
- [x] 6.10 Branding: เปลี่ยนสีหลัก → Save → CSS variables อัปเดต + รีเฟรช → สียังคงอยู่
- [x] 6.11 Branding: เปลี่ยนสีรอง → Save → รีเฟรช → สีคงอยู่
- [x] 6.12 Storage: แก้ไข Quota → Save → รีเฟรช → ค่าใหม่คงอยู่
- [x] 6.13 Storage: เพิ่ม/ลบ Allowed File Types → Save → รีเฟรช → ข้อมูลตรง

## 7. Logout/Login Persistence

- [x] 7.1 Authentication: แก้ไข Session Timeout → Save → Logout → Login → เปิด Settings → ค่าใหม่แสดง
- [x] 7.2 Branding: เปลี่ยนสี → Save → Logout → Login → สีที่เปลี่ยนยังอยู่
- [x] 7.3 SSO: แก้ไข LDAP URL → Save → Logout → Login → ค่าใหม่แสดง

## 8. Unsaved Changes — Discard Verification

- [x] 8.1 แก้ไขค่า → ไม่กด Save → รีเฟรช → ค่าเป็นค่าเดิมก่อนแก้ไข
- [x] 8.2 แก้ไขค่า → ไม่กด Save → Logout → Login → ค่าเป็นค่าเดิมก่อนแก้ไข

## 9. Categories — Wired into Main Save

- [x] 9.1 แก้ไข `CategoriesTabWrapper` — ใช้ annCats/projCats state ร่วมกับ `storageForm` (ไม่ใช้ local state แยก)
- [x] 9.2 รวม `annCats` และ `projCats` ใน `handleSave` → `storage: { ...storageForm, annCats, projCats }` → `PUT /api/settings`
- [x] 9.3 เมื่อกด Save → หมวดหมู่ใหม่ SHALL บันทึกลง DB ผ่าน `storage.annCats`/`storage.projCats` keys
- [x] 9.4 หลังจาก Save → `mutate()` → Categories UI รีเฟรชจาก API
- [x] 9.5 หมวดหมู่ที่เพิ่มแก้ไขลบ SHALL ใช้งานได้ทันทีใน Intranet (Announcement Categories) และ Project Management (Project Categories)
- [x] 9.6 Dirty state ครอบคลุม Categories: แก้ไขหมวดหมู่ → markDirty → Save Banner แสดง

## 10. Cross-Module Category Sync

- [x] 10.1 Intranet หน้า `app/(dashboard)/intranet/page.tsx` — อ่านหมวดหมู่ประกาศจาก `GET /api/settings` → `storage.annCats` (แทน hardcode หรือ mock)
- [x] 10.2 Projects หน้า `app/(dashboard)/projects/page.tsx` — อ่านหมวดหมู่โครงการจาก `GET /api/settings` → `storage.projCats` (แทน hardcode หรือ mock)
- [x] 10.3 เมื่อ Settings Save สำเร็จ → `mutate()` → Intranet/Projects เห็นหมวดหมู่ที่อัปเดตเมื่อเข้าใช้งานใหม่
- [x] 10.4 หมวดหมู่ที่ถูกลบใน Settings SHALL ไม่ปรากฏใน Intranet และ Projects
- [x] 10.5 หมวดหมู่ที่แก้ไขชื่อหรือสีใน Settings SHALL อัปเดตใน Intranet และ Projects ทันที
- [x] 10.6 ทดสอบ: เพิ่มหมวดหมู่ใน Settings → Save → เปิด Intranet → หมวดหมู่ใหม่ปรากฏ
- [x] 10.7 ทดสอบ: เพิ่มหมวดหมู่ใน Settings → Save → เปิด Projects → หมวดหมู่ใหม่ปรากฏ
- [x] 10.8 ทดสอบ: ลบหมวดหมู่ใน Settings → Save → รีเฟรช Intranet → หมวดหมู่หายไป
- [x] 10.9 ทดสอบ: แก้ไขสีหมวดหมู่ใน Settings → Save → รีเฟรช Projects → สีอัปเดต


