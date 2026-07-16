## Context

`app/(dashboard)/settings/page.tsx` ใช้ Auto-Save (useCallback + useEffect + debounce 600ms) — ทุกครั้งที่ state เปลี่ยน จะส่ง PUT `/api/settings` โดยอัตโนมัติ มีปัญหาหลัก:
1. พิมพ์เลข `28800` → ทุกตัวอักษรคือ 1 API call (5 calls) → API ได้ค่า `2`, `28`, `288`, `2880`, `28800` สลับกัน
2. ไม่มีทางยกเลิกการเปลี่ยนแปลง
3. API call ถี่เกินไม่จำเป็น

รูปแบบที่ถูกต้องคือ Explicit Save: ผู้ใช้กด Save → รวมทุกฟิลด์ → ส่งครั้งเดียว

## Goals / Non-Goals

**Goals:**
- เปลี่ยนจาก Auto-Save เป็น Explicit Save (กดปุ่ม Save เพื่อบันทึก)
- แสดง Save Button เมื่อมีการเปลี่ยนแปลง (dirty state) และซ่อนเมื่อยังไม่เปลี่ยน
- Save สำเร็จ → DB → Refresh → ค่าคงอยู่
- Save สำเร็จ → Logout → Login → ค่าคงอยู่
- ไม่กด Save → เปลี่ยน tab → ค่าเดิม (ไม่บันทึก)
- รับประกันทุกฟิลด์ในทุก tab ทำงาน (อ่าน/เขียน/Persist)

**Non-Goals:**
- ไม่แก้ไข UI layout หรือ component structure
- ไม่เพิ่มฟิลด์ใหม่นอกเหนือจากที่มีอยู่แล้ว
- ไม่เปลี่ยน API endpoints

## Decisions

### 1. Explicit Save + Dirty State

**เลือก:** `useState` สำหรับ form values + `dirty` flag → `handleSave()` เรียก `PUT /api/settings` ครั้งเดียว
**กลไก:**
```
User edits input → onChange → setAuthForm(f) + setDirty(true)
User clicks Save → handleSave() → fetchApi PUT → mutate() → applyBranding() → setDirty(false)
User clicks Cancel → reload form from SWR cache → setDirty(false)
```
**เหตุผล:** ควบคุมจังหวะการบันทึกได้, API call ตรงเวลาที่ผู้ใช้ต้องการ, ลด race condition

### 2. Save Button UX

**เลือก:** Save Banner แสดงที่ด้านบนเมื่อ `dirty === true` พร้อมปุ่ม Save
**รูปแบบ:** `"คุณยังไม่ได้บันทึกการเปลี่ยนแปลง"` + ปุ่ม Save
**เหตุผล:** UX ชัดเจน ผู้ใช้รู้ว่ายังไม่ได้บันทึก

### 3. Cancel / Discard Changes

**เลือก:** เมื่อผู้ใช้เปลี่ยน tab โดยยังไม่ได้ Save → ฟอร์มรีเซ็ตเป็นค่าจาก API (discard local changes)
**กลไก:** `useEffect` ที่ `activeTab` → reset form values จาก SWR data
**เหตุผล:** ป้องกันข้อมูล local state ค้างโดยไม่ตั้งใจ

### 4. Branding Real-time vs Deferred

**เลือก:** `applyBranding()` เรียกเมื่อ Save สำเร็จเท่านั้น (ไม่ใช่ทุก onChange)
**เหตุผล:** สีต้องตรงกับค่าที่บันทึกใน DB — ถ้า preview สีแล้วยกเลิก สีควรกลับเป็นค่าเดิม

### 5. Categories — Wired into Main Save

**เลือก:** รวมหมวดหมู่ประกาศและโครงการเข้าใน `handleSave` หลักของ Settings page
**กลไก:** `CategoriesTabWrapper` ใช้ `annCats`/`projCats` state → เมื่อกด Save → รวมเป็น `storage.annCats`/`storage.projCats` ใน body → `PUT /api/settings` → บันทึกพร้อม settings อื่น
**เหตุผล:** หมวดหมู่ต้องบันทึกเป็น JSON ใน `SystemConfig` table ภายใต้ key `storage.annCats`/`storage.projCats` — การรวมใน Save ครั้งเดียวลดจำนวน API call และรับประกัน atomicity
**ทางเลือกที่พิจารณา:** Save แยกอิสระ → อาจเกิด inconsistency ถ้า Save settings แล้วลืม Save categories

### 6. Cross-Module Category Sync

**เลือก:** Intranet และ Projects อ่านหมวดหมู่จาก `GET /api/settings` (key `storage.annCats`/`storage.projCats`) ทุกครั้งที่ component mount — ไม่ใช้ cache ถาวร
**กลไก:**
- Intranet: `useSWR("/api/settings")` → `settings.storage.annCats` → แสดงหมวดหมู่ใน Announcement filter/form
- Projects: `useSWR("/api/settings")` → `settings.storage.projCats` → แสดงหมวดหมู่ใน Project type dropdown
- เมื่อ Settings Save สำเร็จ → `mutate()` → SWR refetch → Intranet/Projects เห็นหมวดหมู่ใหม่ทันทีเมื่อ mount ใหม่หรือ re-focus
**เหตุผล:** หมวดหมู่ที่แก้ไขใน Settings ต้องสะท้อนในทุก module ทันทีหลัง Save — ใช้ SWR cache invalidation และ re-fetch บน component mount รับประกัน consistency

## Risks / Trade-offs

- **User forgets to Save:** เปลี่ยนค่าแล้วลืมกด Save → ข้อมูลหายเมื่อเปลี่ยน tab หรือรีเฟรช → ใช้ `beforeunload` event เตือนเมื่อ `dirty === true`
- **Race condition on Save:** กด Save พร้อมกันจาก 2 tabs → last-write-wins → แสดง success toast เสมอ
