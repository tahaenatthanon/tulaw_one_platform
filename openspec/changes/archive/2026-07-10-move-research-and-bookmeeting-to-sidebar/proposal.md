## Why

ปัจจุบัน modules "งานวิจัย" (Research Management) และ "จองห้องประชุม" (Book Meeting) ถูกซ่อนอยู่ภายใน Application Hub ทำให้ผู้ใช้ต้องคลิกเข้า Application Hub ก่อนทุกครั้งจึงจะเข้าถึง module เหล่านี้ได้ ทั้งที่ทั้งสอง module เป็นฟีเจอร์ที่ถูกใช้งานบ่อยและมีความสำคัญในระดับ platform การย้ายขึ้น sidebar โดยตรงจะลดขั้นตอนการเข้าถึง เพิ่มความรวดเร็วในการทำงาน และสะท้อนความสำคัญของทั้งสอง module ได้ชัดเจนยิ่งขึ้นตาม RBAC และโครงสร้างของระบบที่กำหนดไว้ใน CLAUDE.md

## What Changes

- เพิ่มรายการ "งานวิจัย" และ "จองห้องประชุม" ใน `platformNav` array ของ sidebar (`components/layouts/dashboard-layout.tsx`)
- แสดง/ซ่อนรายการ sidebar ตามสิทธิ์ RBAC ของผู้ใช้ (ใช้ permission codes `RESEARCH_VIEW` และ `BOOK_MEETING_VIEW`)
- คง module ทั้งสองไว้ใน Application Hub เพื่อ backward compatibility (ผู้ใช้ที่คุ้นเคยกับเส้นทางเดิมยังเข้าใช้งานได้)
- หน้า `/book-meeting` ที่มีอยู่แล้วยังคงทำงานตามปกติ โดยเปลี่ยนเพียงแค่เพิ่มทางลัดจาก sidebar
- หน้าของ Research Management (`/application-hub/research-management`) ยังคงมีเส้นทางเดิมเช่นกัน

## Capabilities

### New Capabilities
- `sidebar-research-navigation`: เพิ่มรายการ "งานวิจัย" ใน sidebar พร้อมการควบคุมการแสดงผลตาม RBAC
- `sidebar-bookmeeting-navigation`: เพิ่มรายการ "จองห้องประชุม" ใน sidebar พร้อมการควบคุมการแสดงผลตาม RBAC

### Modified Capabilities
<!-- No existing specs to modify. -->

## Impact

- `components/layouts/dashboard-layout.tsx`: เพิ่ม NavItem ใน `platformNav` array และเพิ่ม logic การตรวจสอบสิทธิ์
- `app/(dashboard)/application-hub/page.tsx`: ไม่ต้องแก้ไข — module ทั้งสองยังคงอยู่ใน Application Hub
- `app/(dashboard)/book-meeting/page.tsx`: ไม่ต้องแก้ไข — ยังทำงานตามปกติ
- `app/(dashboard)/application-hub/research-management/`: ไม่ต้องแก้ไข — ยังคงเส้นทางเดิม
- Sidebar UX: เพิ่ม 2 รายการในกลุ่ม "เมนูหลัก" โดยแสดงตามสิทธิ์ผู้ใช้
- ไม่มี breaking changes
