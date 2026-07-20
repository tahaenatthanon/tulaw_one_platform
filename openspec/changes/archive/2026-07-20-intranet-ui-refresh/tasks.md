## 1. ลบ Hero Section

- [x] 1.1 ลบ Hero Section ทั้งหมด (Welcome Banner, Header Description, Hero Action Buttons, Organization Metrics ใน Hero) ออกจาก `app/(dashboard)/intranet/page.tsx`
- [x] 1.2 ย้ายปุ่ม "สร้างประกาศ" และ "สร้างกิจกรรม" ไปอยู่ในตำแหน่งที่เหมาะสมภายใน Tab ประกาศ และ Tab ปฏิทิน ตามลำดับ
- [x] 1.3 ยืนยันว่าหน้าเริ่มต้นด้วย Card Statistics ทันที (หลัง Tab Navigation)

## 2. ออกแบบ Card Statistics ใหม่

- [x] 2.1 สร้าง `StatCards` component แสดง 4 ใบ: ประกาศทั้งหมด, ประกาศด่วน, กิจกรรมเดือนนี้, จำนวนหน่วยงาน
- [x] 2.2 แต่ละ Card แสดง Icon (ซ้ายบน), ค่าตัวเลข, ชื่อ, และ Delta/Label (ขวาบน) ตาม UI Preview
- [x] 2.3 ใช้ข้อมูลจาก API/State เดิม — ห้าม Hardcode ค่า — ประกาศทั้งหมดจาก `announcements.length`, ประกาศด่วนนับจาก filter, กิจกรรมจาก events, หน่วยงานจาก departments
- [x] 2.4 เพิ่ม Hover Effect (translate-y) และ Transition ให้ Card

## 3. รวม Subscribe เข้ากับหน้า "ประกาศ"

- [x] 3.1 ย้าย Subscribe Chips จาก Tab แยก มาไว้ใน Tab "ประกาศ" ใต้ Category Filter Chips
- [x] 3.2 จัดลำดับใหม่: Search → Category Filter → Subscribe → Pinned Cards → Announcement List
- [x] 3.3 ลบ Tab "Subscribe" (ถ้ามี) — คงเหลือ 3 Tabs: ประกาศ, ปฏิทิน, ติดต่อหน่วยงาน
- [x] 3.4 คง Logic การ Subscribe/Unsubscribe จาก API เดิม (`/api/intranet/subscriptions`)

## 4. ใช้ข้อมูลหมวดหมู่จากระบบจริง

- [x] 4.1 ดึงข้อมูล Category จาก API (ใช้ endpoint ที่มีอยู่ `/api/announcements` หรือ `/api/intranet/announcement-categories`)
- [x] 4.2 สร้าง `CategoryBadge` component ที่รับ `name` และ `color` จากข้อมูลระบบ
- [x] 4.3 Badge แสดงสีตาม `color` field จากระบบ (Red, Blue, Green, Amber, Purple, Cyan ฯลฯ)
- [x] 4.4 รองรับกรณี API ยังไม่พร้อม → fallback ใช้ `DEFAULT_ANN_CATS`
- [x] 4.5 UI เปลี่ยนตามข้อมูลระบบทันทีเมื่อ Category ถูกเปลี่ยนชื่อ/เพิ่ม/ลบ

## 5. ออกแบบ Card ประกาศใหม่

- [x] 5.1 สร้าง `AnnouncementCard` component ใหม่ตาม UI Preview
- [x] 5.2 Card แสดง: Category Badge (จากระบบ), Pin Badge (ถ้าปักหมุด), Title, Description, Publisher, Publish Date, Reading Time
- [x] 5.3 เพิ่ม Hover Effect (translate-y, shadow) และ Transition
- [x] 5.4 คง Search, Filter, Sorting Logic เดิมทั้งหมด
- [x] 5.5 Pinned Cards ยังคงแสดงเป็น Highlight Cards (2 columns) ด้านบน Regular List

## 6. ปรับปรุง Calendar UI

- [x] 6.1 เปลี่ยน Calendar Grid เป็น Design ใหม่ — วันที่ที่มี Event มี dot indicator สีฟ้า, วันนี้ highlight ด้วย `--tu-primary`
- [x] 6.2 ปรับ Calendar Logic ให้อ้างอิง Event Date จริง (day, month, year) — เช็ค `eventDate.getMonth() === viewMonth && eventDate.getDate() === cellDay`
- [x] 6.3 เพิ่มปุ่มนำทางเดือน (ChevronLeft/ChevronRight) และปุ่ม "วันนี้"
- [x] 6.4 แสดงชื่อเดือนและปีแบบไทย (เช่น "กรกฎาคม 2569")
- [x] 6.5 เมื่อคลิกวันที่ที่มี Event → แสดงรายการกิจกรรมของวันนั้นใน Sidebar

## 7. ออกแบบ Card กิจกรรมใหม่

- [x] 7.1 สร้าง `EventCard` component ใหม่ตาม UI Preview
- [x] 7.2 Card แสดง: วันที่ (ใน Badge เล็ก), เวลา, หมวดหมู่ (colored dot + label), สถานที่, ชื่อกิจกรรม
- [x] 7.3 Highlight "วันนี้" เมื่อ Event Date ตรงกับวันที่ปัจจุบัน (เปลี่ยน border/background)
- [x] 7.4 เพิ่ม Hover Effect และ Transition

## 8. ออกแบบ Card หน่วยงานใหม่

- [x] 8.1 สร้าง `DepartmentCard` component ใหม่ตาม UI Preview
- [x] 8.2 Card แสดง: Icon หน่วยงาน (Building2), ชื่อ, เบอร์โทร (link tel:), Email (link mailto:), Location
- [x] 8.3 เพิ่ม Hover Effect (translate-y, shadow, border highlight)
- [x] 8.4 ใช้ข้อมูลจาก `MOCK_DEPARTMENTS` หรือ API เดิม

## 9. ออกแบบ Modal สร้าง/แก้ไขประกาศใหม่

- [x] 9.1 ปรับ Header: เพิ่ม Icon + ชื่อ Modal ("สร้างประกาศ" / "แก้ไขประกาศ") + ปุ่มปิด (X)
- [x] 9.2 ปรับ Body: Form Layout ใหม่ — Label แบบใหม่, Input/Textarea rounded-xl, Upload field แบบ dashed border
- [x] 9.3 ปรับ Category Dropdown: ใช้ `CategoryBadge` หรือ icon + name แสดงผล
- [x] 9.4 ปรับ Footer: ปุ่ม "ยกเลิก" (Outline) + "สร้างประกาศ"/"บันทึก" (Primary) ชิดขวา
- [x] 9.5 ปรับ Spacing, Padding, Border Radius ตาม Design System
- [x] 9.6 คง Validation, API Call, Submit Logic, Hooks, State เดิมทั้งหมด

## 10. ออกแบบ Modal สร้าง/แก้ไขกิจกรรมใหม่

- [x] 10.1 ปรับ Header, Body, Footer ตาม Design ใหม่ (เช่นเดียวกับ Modal ประกาศ)
- [x] 10.2 Form Fields: Event Name, Category Dropdown (colored dot), Date Picker, Time Range (Start-End), Location, Description
- [x] 10.3 คง Mini Calendar Day Picker ใน Event Create Modal (ใช้ Logic เดิม)
- [x] 10.4 คง Validation, API Call, Submit Logic, Hooks, State เดิมทั้งหมด
- [x] 10.5 ปรับ Spacing, Padding, Border Radius ตาม Design System

## 11. Final Polish & Testing

- [x] 11.1 ตรวจสอบ Responsive Design: Desktop, Laptop, Tablet, Mobile
- [x] 11.2 ตรวจสอบ Hover States และ Transitions ทุก Interactive Element
- [x] 11.3 ตรวจสอบ Empty States (ไม่มีประกาศ, ไม่มีกิจกรรม, ไม่มีหน่วยงาน)
- [x] 11.4 ตรวจสอบ Loading States (ระหว่าง SWR fetch)
- [x] 11.5 ตรวจสอบการทำงานของ Search, Filter, Sort ในทุก Tab
- [x] 11.6 ตรวจสอบ Permission/RBAC: ปุ่มสร้าง/แก้ไข/ลบ แสดงตามสิทธิ์ผู้ใช้
- [x] 11.7 ตรวจสอบ Accessibility: Keyboard Navigation, Focus Visible, ARIA Labels
- [x] 11.8 ทดสอบ CRUD: สร้าง, แก้ไข, ลบ ประกาศและกิจกรรม — ข้อมูลถูกต้องหลัง操作
- [x] 11.9 ตรวจสอบ Calendar: Event Date จริงตรงกับวันที่แสดง, ไม่ซ้ำข้ามเดือน
- [x] 11.10 ตรวจสอบ Subscribe: ติดตาม/เลิกติดตามทำงานถูกต้อง, สถานะคงอยู่หลัง refresh
