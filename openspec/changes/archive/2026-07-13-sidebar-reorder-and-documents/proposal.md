## Why

Sidebar ปัจจุบันยังขาดเมนู "เอกสาร" (Documents) ซึ่งเป็นหนึ่งในระบบงานหลักของคณะตาม claude.md Module 5 (จัดการเอกสาร) นอกจากนี้ลำดับเมนูยังไม่ตรงตามที่กำหนด และชื่อเมนู "ตั้งค่าระบบ" ในกลุ่มผู้ดูแลระบบควรเปลี่ยนเป็น "ตั้งค่าระบบ" (System Config) ให้ตรงตาม spec

## What Changes

- เพิ่มเมนู "เอกสาร" (`/documents`) ใน Sidebar กลุ่ม "เมนูหลัก" โดยใช้ icon `FolderOpen` และ permission `DOCUMENTS_VIEW`
- เรียงลำดับเมนูหลักใหม่: แดชบอร์ด → ศูนย์กลางแอปพลิเคชัน → อินทราเน็ต → จองห้องประชุม → เอกสาร → โครงการ
- **BREAKING**: เปลี่ยนชื่อเมนู "ตั้งค่าระบบ" → "ตั้งค่าระบบ" (คงไว้ — ไม่เปลี่ยน label แต่ขอให้เรียง adminNav ใหม่ตามที่กำหนด)

## Capabilities

### New Capabilities
- `sidebar-documents-navigation`: เพิ่มเมนู "เอกสาร" ใน Sidebar พร้อม permission-based visibility (`DOCUMENTS_VIEW`) นำทางไป `/documents`

### Modified Capabilities
<!-- No existing spec changes — reordering is implementation detail, not spec-level -->

## Impact

- `components/layouts/dashboard-layout.tsx` — เพิ่ม NavItem "เอกสาร", จัดลำดับใหม่, เพิ่ม icon import `FolderOpen`, เพิ่ม permission hook `hasDocumentsView`
- `openspec/specs/sidebar-documents-navigation/spec.md` — spec ใหม่
