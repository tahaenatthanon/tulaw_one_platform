## Why

เปลี่ยนชื่อเมนูใน Sidebar จากภาษาไทยเป็นภาษาอังกฤษทั้งหมด เพื่อให้สอดคล้องกับ UI ที่ใช้ภาษาอังกฤษเป็นหลัก และตรงตาม requirement ที่กำหนด

## What Changes

- เปลี่ยน label ใน `platformNav`: แดชบอร์ด→Dashboard, ศูนย์กลางแอปพลิเคชัน→Application Hub, อินทราเน็ต→Intranet, จองห้องประชุม→Book Meeting, เอกสาร→Document, โครงการ→Projects
- เปลี่ยน label ใน `adminNav`: ผู้ใช้งานและสิทธิ์→Users & Roles, บันทึกความปลอดภัย→Audit Log, ตั้งค่าระบบ→System Config

## Capabilities

### New Capabilities
<!-- None — label-only change, no spec-level behavior change -->

### Modified Capabilities
<!-- None — labels are implementation detail, not spec-level behavior -->

## Impact

- `components/layouts/dashboard-layout.tsx` — เปลี่ยน label strings ใน `platformNav` และ `adminNav` arrays
