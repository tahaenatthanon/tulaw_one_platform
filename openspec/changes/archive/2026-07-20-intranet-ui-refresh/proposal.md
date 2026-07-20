## Why

หน้า Intranet ปัจจุบันมี Hero Section ที่กินพื้นที่มากและมี UI ที่ล้าสมัยเมื่อเทียบกับ modules อื่นที่เพิ่ง redesign ไปแล้ว (Dashboard, Book Meeting, Documents ฯลฯ) การปรับปรุงครั้งนี้จะทำให้ Intranet มีความทันสมัย สะอาดตา และสอดคล้องกับ Design System เดียวกันทั้งแพลตฟอร์ม โดยไม่กระทบ Business Logic, API, Database หรือระบบหลังบ้านใดๆ

## What Changes

- **ลบ Hero Section** ทั้งหมด (Welcome Banner, Header Description, Hero Action Buttons, Organization Metrics ใน Hero) เริ่มหน้าด้วย Card Statistics ทันที
- **Card Statistics ใหม่** ใช้ดีไซน์ใหม่แต่คงข้อมูลเดิม (ประกาศทั้งหมด, ประกาศด่วน, กิจกรรมเดือนนี้, จำนวนหน่วยงาน)
- **รวม Subscribe เข้ากับหน้า "ประกาศ"** ยุบ Tab Subscribe แยกออกไป จัดลำดับใหม่: Card Statistics → ประกาศทั้งหมด → หมวดหมู่ประกาศ → Subscribed → รายการประกาศ
- **หมวดหมู่ประกาศ** ใช้ข้อมูล Category จากระบบจริง (API) แทน Hardcode แสดง Badge สีจากข้อมูลในระบบ รองรับการเปลี่ยนชื่อ/เพิ่ม/ลบหมวดหมู่
- **รายการประกาศ** เปลี่ยนเป็น Card Design ใหม่ คงข้อมูลเดิมทั้งหมด เพิ่ม Hover Effect
- **ปฏิทิน** เปลี่ยนเป็น Calendar UI ใหม่ ใช้ Logic เดิม แสดงกิจกรรมตาม Event Date จริง (ไม่ใช้เลขวันเพียงอย่างเดียว)
- **รายการกิจกรรม** ใช้ Card Design ใหม่ แสดงวันที่ เวลา หมวดหมู่ สถานที่ ชื่อกิจกรรม Highlight "วันนี้"
- **หน่วยงาน** เปลี่ยน Card ใหม่ทั้งหมด ใช้ข้อมูลเดิม เพิ่ม Hover Effect และ Shadow
- **Modal สร้าง/แก้ไขประกาศ** ออกแบบ Modal ใหม่ (Header, Body, Footer, Form Layout, Buttons, Spacing) คง Validation, API, Submit, Hook, State เดิม
- **Modal สร้าง/แก้ไขกิจกรรม** ใช้ Design ใหม่ รองรับ Event Name, Category, Date, Time, Location, Description คง Logic เดิมทั้งหมด

## Capabilities

### New Capabilities

ไม่มี — เป็นการเปลี่ยนแปลงเฉพาะ UI/UX ไม่มีความสามารถทางธุรกิจใหม่

### Modified Capabilities

ไม่มี — ไม่มีการเปลี่ยนแปลง Requirement หรือ Spec-level behavior ของระบบ

## Impact

- **ไฟล์ที่แก้ไข:** `app/(dashboard)/intranet/page.tsx` (หลัก), `app/globals.css` (ถ้าจำเป็นต้องเพิ่ม CSS variables ใหม่)
- **ไฟล์ที่อาจสร้างใหม่:** `components/ui/` สำหรับ shared components ถ้ามีการแยก component ใหม่ (เช่น AnnouncementCard, CalendarDayCell, DepartmentCard)
- **API:** ไม่แก้ไข
- **Database:** ไม่แก้ไข
- **Prisma Schema:** ไม่แก้ไข
- **TypeScript Types/Interfaces:** ไม่แก้ไข
- **Hooks:** ไม่แก้ไข
- **State Management:** ไม่แก้ไข
- **Business Logic:** ไม่แก้ไข
- **RBAC/Auth:** ไม่แก้ไข
- **Routing:** ไม่แก้ไข
