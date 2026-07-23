# Audit Log UI Redesign

## Purpose

กำหนดมาตรฐาน UI สำหรับหน้า Audit Log ของ TULAW ONE Platform ให้มีความเป็น Enterprise Application ทันสมัย ใช้งานง่าย และสอดคล้องกับ Design System ตามที่กำหนดใน `claude.md`

## Requirements

### Requirement: Page Layout

หน้า Audit Log SHALL ใช้ Layout: Search + Advanced Filters → Audit Log Table → Detail Drawer โดยใช้ Design Language เดียวกับ Application Hub

#### Scenario: Layout เป็นไปตามโครงสร้าง

- **WHEN** ผู้ใช้เปิดหน้า Audit Log
- **THEN** ระบบ SHALL แสดง Search Bar, Advanced Filters, Audit Log Table และ Detail Drawer ตามลำดับ

### Requirement: Search Bar

ระบบ SHALL แสดง Search Bar ที่รองรับการค้นหา User, Action, Module, Resource, IP Address โดยใช้ Logic เดิมของระบบ

#### Scenario: ค้นหาด้วยข้อความ

- **WHEN** ผู้ใช้พิมพ์ข้อความใน Search Bar
- **THEN** ระบบ SHALL กรองรายการ Audit Log ตามข้อความที่พิมพ์ และแสดงปุ่มเคลียร์ (X) เมื่อมีข้อความ

### Requirement: Advanced Filters

ระบบ SHALL แสดง Advanced Filters ที่รองรับตัวเลือก: ช่วงวันที่, ผู้ใช้งาน, Module, Action, Status, Department โดยใช้ Logic เดิมของระบบ เมื่อเลือก Filter แล้วขนาด Layout ต้องคงเดิม Filter Bar ต้องไม่ขยายหรือย่อ

#### Scenario: กรองด้วย Advanced Filters

- **WHEN** ผู้ใช้เลือกค่าใน Advanced Filters
- **THEN** ระบบ SHALL กรองรายการ Audit Log ตามค่าที่เลือก โดย Filter Bar มีขนาดคงเดิม

#### Scenario: แสดงจำนวนตัวกรองที่ใช้งาน

- **WHEN** มีการเลือก Filter อย่างน้อย 1 รายการ
- **THEN** ระบบ SHALL แสดงจำนวนตัวกรองที่ใช้งานบนปุ่ม Advanced Filters และแสดงปุ่มรีเซ็ต

### Requirement: Audit Log Table

ระบบ SHALL แสดงตาราง Audit Log ที่มี Sticky Header, Hover Effect, Status Badge, ระยะห่างและ Typography ที่ดีขึ้น แสดงคอลัมน์: วันที่และเวลา, ผู้ใช้งาน, Module, Action, Resource, IP Address, Status, Actions (ปุ่ม More) โดยไม่เปลี่ยน Sorting, Filtering, Pagination

#### Scenario: แสดงตาราง Audit Log

- **WHEN** ผู้ใช้ดู Audit Log
- **THEN** ระบบ SHALL แสดงตารางที่มี Sticky Header, Hover Effect, Status Badge, และ Typography ตาม Design Reference

#### Scenario: Sorting ทำงานได้ตามปกติ

- **WHEN** ผู้ใช้คลิก Header ของคอลัมน์ที่ sortable
- **THEN** ระบบ SHALL เรียงลำดับข้อมูลตามคอลัมน์นั้น โดยใช้ Logic เดิม

#### Scenario: Pagination ทำงานได้ตามปกติ

- **WHEN** ผู้ใช้เปลี่ยนหน้า
- **THEN** ระบบ SHALL แสดงข้อมูลหน้าถัดไปตาม Logic เดิม

### Requirement: Actions Column — More Menu

ระบบ SHALL แสดงเฉพาะปุ่ม More (...) ในคอลัมน์ Actions ของตาราง Audit Log โดยภายใน More Menu มี: ดูรายละเอียด (View Details), คัดลอก Log ID, Export (ถ้าระบบรองรับ)

#### Scenario: เปิด More Menu

- **WHEN** ผู้ใช้คลิกปุ่ม More (...) ในตาราง
- **THEN** ระบบ SHALL แสดง Dropdown Menu พร้อม View Details, Copy Log ID, Export

#### Scenario: ดูรายละเอียดจาก More Menu

- **WHEN** ผู้ใช้คลิก View Details ใน More Menu
- **THEN** ระบบ SHALL เปิด Detail Drawer

### Requirement: Detail Drawer

ระบบ SHALL แสดง Detail Drawer เมื่อผู้ใช้คลิก View Details โดย Drawer SHALL แสดงข้อมูลทั้งหมด: วันที่และเวลา, ผู้ใช้งาน, Role, Department, Module, Action, Resource, Before/After Changes, IP Address, Browser, OS, Session ID, Request ID, Result, Error Message ในรูปแบบ Card Layout + Timeline เนื้อหาทั้งหมด SHALL แสดงครบถ้วนไม่มีข้อมูลล้นหรือตกขอบ

#### Scenario: เปิด Detail Drawer

- **WHEN** ผู้ใช้คลิก View Details
- **THEN** ระบบ SHALL แสดง Drawer จากด้านขวาพร้อมพื้นหลัง Overlay และข้อมูล Audit Log ครบถ้วน
- **AND** เนื้อหาทั้งหมด SHALL แสดงภายใน Drawer โดยไม่มีการล้นหรือถูกตัด

#### Scenario: Timeline แสดงลำดับเหตุการณ์

- **WHEN** ข้อมูล Audit Log มีการเปลี่ยนแปลง
- **THEN** Drawer SHALL แสดง Timeline: Request received → Executed/Failed → Audit persisted

### Requirement: JSON Viewer for Before/After Changes

หากมีข้อมูล Before และ After ระบบ SHALL แสดงในรูปแบบ JSON Viewer แบบ Read-only รองรับ Expand/Collapse และ Copy JSON โดยใช้ข้อมูลจริงของระบบ

#### Scenario: แสดง Before/After Changes

- **WHEN** Audit Log มีข้อมูล `beforeValue` หรือ `afterValue`
- **THEN** ระบบ SHALL แสดง Before/After Section แบบ stacked (Before ด้านบน, After ด้านล่าง)
- **AND** แสดง "No data" placeholder ถ้าข้อมูลฝั่งใดฝั่งหนึ่งว่างเปล่า

#### Scenario: Copy JSON

- **WHEN** ผู้ใช้คลิกปุ่ม Copy ใน JSON Viewer
- **THEN** ระบบ SHALL คัดลอก JSON ไปยัง Clipboard และแสดงสถานะ "Copied"

### Requirement: Empty State

ระบบ SHALL แสดง Empty State เมื่อไม่มี Audit Log หรือไม่พบผลการค้นหา

#### Scenario: ไม่มี Audit Log

- **WHEN** ระบบไม่มี Audit Log เลย
- **THEN** ระบบ SHALL แสดงข้อความ "ยังไม่มี Audit Log" พร้อมคำอธิบาย

#### Scenario: ไม่พบผลการค้นหา

- **WHEN** ผู้ใช้ค้นหาแล้วไม่พบผลลัพธ์
- **THEN** ระบบ SHALL แสดงข้อความ "ไม่พบผลการค้นหา" พร้อมปุ่มรีเซ็ตตัวกรอง

### Requirement: Skeleton Loading

ระบบ SHALL แสดง Skeleton Loading แทน Loading แบบเดิมขณะโหลดข้อมูล

#### Scenario: แสดง Skeleton ขณะโหลด

- **WHEN** ระบบกำลังโหลดข้อมูล Audit Log
- **THEN** ระบบ SHALL แสดง Skeleton Rows ที่มี animation แทนข้อความ "กำลังโหลด..."

### Requirement: Design System Compliance

UI ทั้งหมด SHALL ใช้ Design Tokens (`--tu-*` CSS variables) จาก TULAW ONE Design System ตามที่กำหนดใน `claude.md` ห้ามใช้ Hex Color โดยตรง, ใช้ Typography Prompt Font, ใช้ 8px Spacing System, ใช้ Lucide Icons ขนาด 16px/20px/24px เท่านั้น

#### Scenario: ใช้ Design Tokens อย่างถูกต้อง

- **WHEN** ตรวจสอบโค้ด UI ของหน้า Audit Log
- **THEN** ทุก Component SHALL ใช้ CSS Variables (`var(--tu-primary)`, `var(--tu-bg)`, ฯลฯ) แทนค่า Hex โดยตรง

### Requirement: Preserve All Existing Functionality

การเปลี่ยนแปลง UI ทั้งหมด SHALL ไม่กระทบกับ Business Logic, API, Authentication, Authorization, RBAC, Database, Prisma, State Management, Routing, Audit Log Creation, Search Logic, Filter Logic, Export Logic, Sorting Logic, Pagination Logic

#### Scenario: ฟังก์ชันเดิมทำงานได้ปกติหลังการเปลี่ยน UI

- **WHEN** ผู้ใช้ดำเนินการใดๆ บนหน้า Audit Log (ค้นหา, กรอง, เรียงลำดับ, เปลี่ยนหน้า, ส่งออก, ดูรายละเอียด)
- **THEN** ระบบ SHALL ทำงานเหมือนเดิมทุกประการ โดยเปลี่ยนเฉพาะการแสดงผลทาง UI
