## Why

หน้า System Configuration ปัจจุบันใช้ UI แบบ Tab Pills ที่ไม่ได้จัดกลุ่มหมวดหมู่ ทำให้การนำทางไม่เป็นระเบียบและไม่สอดคล้องกับ Design System ของ TULAW ONE Platform นอกจากนี้ยังมี Tab ที่ซ้ำซ้อนกับหน้าเฉพาะของฟีเจอร์นั้นๆ (Meeting Room, Application Status, Categories, Security, Audit) ทำให้เกิดความสับสนในการจัดการ การปรับปรุง UI ครั้งนี้จะยกระดับประสบการณ์ผู้ดูแลระบบให้เป็น Enterprise-grade และสอดคล้องกับหน้าอื่นๆ เช่น Dashboard, Users & Roles, และ Audit Log

## What Changes

- **ปรับ Layout ใหม่** เป็น Enterprise Layout: Page Header → Search Area → Category Sidebar + Configuration Panel → Sticky Action Bar
- **จัดกลุ่มหมวดหมู่ใหม่** แบ่งเป็นกลุ่ม: Core Settings (Authentication, SSO/LDAP), Appearance (Branding), Storage, Integration (API Keys) พร้อมไอคอนและคำอธิบาย
- **นำ Tab ออก**: Meeting Room, Application Status, Categories (มีหน้าจัดการเฉพาะอยู่แล้ว), Security, Audit (ไม่แสดงใน System Config) — **BREAKING**: Navigation structure change
- **ปรับปรุง Search** ให้มี Search Field ที่ดีขึ้น, Clear Button, Empty State สำหรับผลลัพธ์ที่ไม่พบ
- **เพิ่ม Branding Preview** แสดงตัวอย่าง Header, Sidebar, Primary/Outline Button แบบ Real-time
- **ปรับปรุง API Key UI** ให้เป็น Enterprise Style พร้อมแสดง Name, Permissions, Status, Created Date, Last Used และ Actions (View, Copy, Revoke)
- **เพิ่ม Storage Visualization** แสดง Usage Progress Bar, Used Space, Remaining Space
- **ปรับปรุง Save Status** รองรับสถานะ: No Changes, Unsaved Changes (พร้อมจำนวน Pending Changes), Saving, Saved Successfully (พร้อม Last Saved Time)
- **ปรับปรุง Sticky Action Bar** แสดง Pending Changes Indicator, Reset, Discard, Save Changes
- **ปรับปรุง Confirmation Dialog** แสดง Summary of Changes และ Immediate Effect Warning
- **ออกแบบ Empty States** สำหรับ No Search Result, No API Keys, No Integration, No Data
- **Responsive Design** รองรับ Desktop, Tablet, Mobile พร้อม Responsive Sidebar, Cards, Form Layout, Sticky Action Bar
- **ออกแบบให้สอดคล้องกับ Design System** ใช้ Design Tokens (`--tu-*`), Typography Prompt, 8px Spacing, Lucide Icons, Border Radius, Elevation
- **ปรับ Tabs ให้แสดงผลแบบ Natural Width**: Container ของ Tabs ไม่ขยายเต็มความกว้าง (Fit Content), Active Tab ไม่มีพื้นหลัง (No Background), แสดงสถานะ Active ด้วยการเปลี่ยนสีข้อความและเส้นใต้เท่านั้น
- **โลโก้แสดงผลทันทีหลังบันทึก**: เมื่ออัปโหลดโลโก้ใหม่และกด Save โลโก้ใหม่ต้องแสดงทันทีในทุกตำแหน่ง (Sidebar, Login Page, Header) โดยไม่ต้องรีเฟรชหน้าเว็บ ใช้ Single Source of Truth จาก `branding.logoUrl` ใน API
- **นำพื้นหลังของโลโก้บนหน้า Login ออก**: แสดงเฉพาะไฟล์โลโก้โดยตรง ไม่มีกรอบ กล่อง หรือพื้นหลังเพิ่มเติม (No Background/Container) รองรับ Transparent PNG/SVG คงขนาดและสัดส่วนเดิม

## Capabilities

### New Capabilities
- `system-config-enterprise-layout`: Enterprise page layout with header, search, category sidebar, configuration panel, and sticky action bar
- `system-config-category-navigation`: Grouped category sidebar organized into Core Settings, Appearance, Storage, and Integration groups
- `system-config-branding-preview`: Real-time branding preview showing header preview, sidebar preview, primary/outline button preview
- `system-config-api-key-enterprise-ui`: Enterprise-style API key management UI with detailed card view and actions
- `system-config-storage-visualization`: Storage usage visualization with progress bar, used/remaining space display
- `system-config-save-status`: Enhanced save status indicator with pending changes count and last saved time
- `system-config-empty-states`: Empty state designs for no results, no API keys, no integration, no data
- `system-config-responsive-design`: Responsive layout adapting to desktop, tablet, and mobile viewports

### Modified Capabilities
- `system-config-backend`: Remove Meeting Room, Application Status, Categories, Security, and Audit from the navigation/category structure (these have dedicated pages)
- `system-config-save-persistence`: Enhanced save bar UI and confirmation dialog with summary of changes

## Impact

- **Affected code**: `SystemConfigView.tsx` (major UI rewrite), new components in `components/settings/`
- **Types**: Update `CategoryId` to reflect removed categories (meeting-rooms, app-status, categories, security, audit)
- **Props interface**: `SystemConfigViewProps` may need adjustment to remove props for removed tabs
- **Routes**: No route changes — System Config route unchanged
- **Dependencies**: No new dependencies; uses existing Lucide Icons and shadcn/ui components
- **Backend/API**: No changes — all existing endpoints remain
- **Database**: No changes
- **Existing specs**: `system-config-backend` and `system-config-save-persistence` specs will have delta specs for navigation structure and save UI changes