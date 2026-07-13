## 1. Remove non-core apps from Application Hub

- [x] 1.1 ลบ app group `research` (งานวิจัย) จาก `appGroups` array ใน `app/(dashboard)/application-hub/page.tsx`
- [x] 1.2 ลบ app group `legal-clinic` (คลินิกกฎหมาย) จาก `appGroups` array
- [x] 1.3 ลบ app group `book-meeting` (จองห้องประชุม) จาก `appGroups` array
- [x] 1.4 ลบ app group `support` (บริการสนับสนุน) จาก `appGroups` array

## 2. Remove unused permission checks

- [x] 2.1 ลบ `research`, `legal-clinic`, `book-meeting`, `support` keys จาก `canView` object
- [x] 2.2 ลบ unused icon imports (FlaskConical, Scale, HelpCircle, Library, Lightbulb, MessageSquare) — ถ้าไม่ได้ใช้ที่อื่น

## 3. Verify and clean up

- [x] 3.1 ตรวจสอบว่า Stats 4 รายการแสดงผลถูกต้อง (5 ระบบ, Active Users, Online, Maintenance)
- [x] 3.2 ตรวจสอบว่า Pin/Unpin, Search, Grid/List View ยังทำงานปกติ
- [x] 3.3 ตรวจสอบ TypeScript compilation ว่าไม่มี error
