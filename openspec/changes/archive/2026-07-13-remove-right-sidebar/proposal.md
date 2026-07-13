## Why

Right sidebar (ปฏิทินด้านข้าง) แสดง mini calendar และ upcoming events บนทุกหน้า dashboard ซึ่งใช้พื้นที่หน้าจอโดยไม่จำเป็น ผู้ใช้สามารถเข้าถึงปฏิทินผ่านหน้า Intranet แทน การนำออกจะเพิ่มพื้นที่ Main Content ให้กว้างขึ้น

## What Changes

- ลบ RightSidebar component และการ render ทั้งหมดออกจาก `dashboard-layout.tsx`
- ลบ toggle button สำหรับเปิด/ปิด right panel ใน Header
- ลบ state `rightPanelOpen` และ icons ที่เกี่ยวข้อง: `PanelRightClose`, `PanelRightOpen`, `ChevronRight`, `Clock`, `Calendar`

## Capabilities

### New Capabilities
<!-- None — removal only -->

### Modified Capabilities
<!-- None — no spec-level behavior change -->

## Impact

- `components/layouts/dashboard-layout.tsx` — ลบ ~190 บรรทัด (RightSidebar component + toggle button + state + icons)
