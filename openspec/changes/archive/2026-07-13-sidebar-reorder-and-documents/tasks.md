## 1. Add Documents to Sidebar

- [x] 1.1 เพิ่ม import `FolderOpen` จาก `lucide-react` ใน `components/layouts/dashboard-layout.tsx`
- [x] 1.2 เพิ่ม `hasDocumentsView` permission hook ใน DashboardLayout component
- [x] 1.3 เพิ่ม NavItem `{ href: "/documents", label: "เอกสาร", icon: FolderOpen, permission: "DOCUMENTS_VIEW" }` ใน `platformNav` array
- [x] 1.4 เพิ่ม `DOCUMENTS_VIEW` handler ใน `hasPermissionAccess()` function

## 2. Reorder platformNav

- [x] 2.1 จัดลำดับ platformNav ใหม่: Dashboard → Application Hub → Intranet → Book Meeting → Documents → Projects

## 3. Verify

- [x] 3.1 ตรวจสอบ TypeScript compilation
- [x] 3.2 ตรวจสอบว่าผู้ใช้ทุก role เห็นเมนู "เอกสาร" (DOCUMENTS_VIEW มีในทุก role)
- [x] 3.3 ตรวจสอบ active state เมื่ออยู่ที่ `/documents`
- [x] 3.4 ตรวจสอบลำดับเมนูถูกต้อง
