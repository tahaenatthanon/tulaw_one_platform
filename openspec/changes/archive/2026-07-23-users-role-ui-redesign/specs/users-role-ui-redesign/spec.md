## ADDED Requirements

### Requirement: Page Header

หน้า Users & Roles SHALL แสดง Header ประกอบด้วย Breadcrumb (`Settings / Access Control`), Page Title (`Users & Roles`), Description (`จัดการผู้ใช้งาน บทบาท และสิทธิ์การเข้าถึงระบบทั้งหมด`) และ Action Buttons เรียงลำดับ Import → Export → เพิ่มผู้ใช้งาน (จากซ้ายไปขวา, ชิดขวาของ Header) ตาม Design Reference โดยไม่มีปุ่ม Bulk Actions ใน Toolbar

#### Scenario: แสดง Header ครบทุกองค์ประกอบ

- **WHEN** ผู้ใช้เปิดหน้า Users & Roles
- **THEN** ระบบ SHALL แสดง Breadcrumb, Page Title, Description, และปุ่ม Import, Export, เพิ่มผู้ใช้งาน เรียงตามลำดับ โดยไม่มีปุ่ม Bulk Actions

### Requirement: Page Layout Container

หน้า Users & Roles SHALL ใช้ Layout Container `mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10` เพื่อให้ความกว้างและระยะห่างเท่ากับหน้าอื่นในระบบ

#### Scenario: Layout เท่ากับหน้าอื่น

- **WHEN** ผู้ใช้เปิดหน้า Users & Roles
- **THEN** ความกว้างสูงสุดและ padding SHALL เท่ากับหน้า Dashboard และ Application Hub

### Requirement: Search and Filter Bar

ระบบ SHALL แสดง Search & Filter Bar ในรูปแบบ Container เดียวที่มีพื้นหลัง `bg-tu-surface`, ขอบ `border-tu-border`, มุมโค้ง `rounded-2xl`, และเงา `shadow` ตาม Design Reference ประกอบด้วย Search Input, Filter Dropdowns (Role, Department, Status), และปุ่มล้างตัวกรอง โดยเมื่อ Filter มีค่าที่เลือก SHALL เปลี่ยนเฉพาะสีขอบและ icon โดยไม่ใส่สีพื้นหลัง

#### Scenario: Filter URL อยู่ที่ path ปัจจุบัน

- **WHEN** ผู้ใช้เลือก Filter ที่หน้า `/users` (Tab User Management)
- **THEN** URL SHALL เป็น `/users?role=xxx` โดยไม่เปลี่ยน path เป็น `/users/user-management?role=xxx&page=1`
- **AND** ระบบ SHALL ใช้ `router.replace` เพื่ออัปเดต query params โดยไม่เพิ่ม history entry

#### Scenario: ค้นหาผู้ใช้ด้วยข้อความ

- **WHEN** ผู้ใช้พิมพ์ข้อความในช่องค้นหา
- **THEN** ระบบ SHALL กรองรายการผู้ใช้แบบ real-time และแสดงปุ่มเคลียร์ (X) เมื่อมีข้อความ

#### Scenario: กรองด้วย Filter Dropdown

- **WHEN** ผู้ใช้เลือกค่าใน Filter Dropdown (Role/Department/Status)
- **THEN** ระบบ SHALL กรองรายการผู้ใช้ตามค่าที่เลือก โดย Filter Dropdown ที่เลือก SHALL เปลี่ยนขอบเป็น `border-[var(--tu-primary)]/40` และ icon เป็นสี primary โดยไม่เปลี่ยนสีพื้นหลัง และขนาดของ Filter Bar, Table และองค์ประกอบอื่น SHALL คงเดิม ไม่มีการขยายหรือย่อ

### Requirement: Role Filter and Column — English Names

Role Filter และคอลัมน์ Role ในตาราง SHALL ใช้ชื่อภาษาอังกฤษดังนี้: Super Admin, System Admin, Dean, Dept Admin, User, Viewer

#### Scenario: Role Filter แสดงชื่อภาษาอังกฤษ

- **WHEN** ผู้ใช้เปิด Role Filter dropdown
- **THEN** ตัวเลือก SHALL แสดงเป็น Super Admin, System Admin, Dean, Dept Admin, User, Viewer

#### Scenario: Role Column แสดงชื่อภาษาอังกฤษ

- **WHEN** ผู้ใช้ดูตารางผู้ใช้งาน
- **THEN** แต่ละแถวในคอลัมน์ Role SHALL แสดงชื่อภาษาอังกฤษ: Super Admin, System Admin, Dean, Dept Admin, User, Viewer

### Requirement: User Table

ระบบ SHALL แสดงตารางผู้ใช้งานที่มีคอลัมน์ที่เรียงลำดับได้: User (Avatar + ชื่อ + อีเมล, sortable), Department (พร้อม icon Building, sortable), Role (Role Badge ภาษาอังกฤษ, sortable), Status (Status Badge พร้อม icon, sortable), Last Login (พร้อม icon Clock, sortable), และ Actions (ปุ่ม More (...)) ตาม Design Reference

#### Scenario: แสดง Avatar พร้อมชื่อและอีเมล

- **WHEN** ผู้ใช้ดูตารางผู้ใช้งาน
- **THEN** แต่ละแถว SHALL แสดง Avatar แบบวงกลมสีพร้อมตัวย่อชื่อ, ชื่อเต็ม, และอีเมล ในคอลัมน์ User

#### Scenario: แสดง Role Badge

- **WHEN** ผู้ใช้ดูตารางผู้ใช้งาน
- **THEN** แต่ละแถว SHALL แสดง Role Badge ที่มีสีแตกต่างกันตาม Role (Super Admin: แดง, System Admin: แดงอ่อน, Dean: เหลือง, Dept Admin: เทา, User: เทา, Viewer: เทาอ่อน) พร้อม icon Shield

#### Scenario: แสดง Status Badge

- **WHEN** ผู้ใช้ดูตารางผู้ใช้งาน
- **THEN** แต่ละแถว SHALL แสดง Status Badge ด้วย Label และ Icon ต่อไปนี้:
  - ACTIVE → "Active" + CircleCheck (Emerald)
  - INACTIVE → "Inactive" + CircleMinus (Rose)
  - MFA_PENDING → "MFA Pending" + CircleAlert (Amber)
- **AND** StatusBadge ห้ามแสดง "Suspended" สำหรับ INACTIVE และห้ามแสดง "Invited" สำหรับ MFA_PENDING

#### Scenario: Actions Column — ปุ่ม More เพียงปุ่มเดียว

- **WHEN** ผู้ใช้ดูตารางผู้ใช้งาน
- **THEN** แต่ละแถว SHALL แสดงเฉพาะปุ่ม More (...) ในคอลัมน์ Actions โดยไม่มีปุ่ม View หรือ Edit แยก
- **AND** ปุ่ม More (...) SHALL เปิด Dropdown Menu ที่มี 8 Actions เรียงตามลำดับ: View Details, Enable Account, Disable Account, Edit User, Reset MFA, Force Sign Out, View Audit Log, Delete User

#### Scenario: เรียงลำดับคอลัมน์

- **WHEN** ผู้ใช้คลิกที่ Header ของคอลัมน์ (User, Department, Role, Status, Last Login)
- **THEN** ระบบ SHALL เรียงลำดับข้อมูลตามคอลัมน์นั้น (Ascending → Descending สลับเมื่อคลิกซ้ำ)
- **AND** Header SHALL แสดงลูกศร ↑ หรือ ↓ บอกทิศทางการเรียง
- **AND** คอลัมน์ Role SHALL เรียงตาม `ROLE_LEVELS` (Super Admin=100, System Admin=80, Dean=70, Dept Admin=50, User=30, Viewer=10) — desc เรียงจากระดับสูงไปต่ำ
- **AND** ค่าเริ่มต้น SHALL เรียงตามวันที่สร้างล่าสุด (createdAt descending)

### Requirement: More Menu — 8 Actions

ปุ่ม More (...) ในตาราง SHALL แสดง Dropdown Menu พร้อม 8 Actions ทุก Action SHALL ทำงานผ่าน API จริง:

#### Scenario: View Details
- **WHEN** ผู้ใช้คลิก View Details
- **THEN** ระบบ SHALL เปิด User Detail Drawer

#### Scenario: Enable Account
- **WHEN** ผู้ใช้คลิก Enable Account (แสดงเมื่อ Status เป็น INACTIVE หรือ MFA_PENDING)
- **THEN** ระบบ SHALL เปลี่ยนสถานะผู้ใช้เป็น ACTIVE ผ่าน `PATCH /api/users`

#### Scenario: Disable Account
- **WHEN** ผู้ใช้คลิก Disable Account (แสดงเมื่อ Status เป็น ACTIVE)
- **THEN** ระบบ SHALL เปลี่ยนสถานะผู้ใช้เป็น INACTIVE ผ่าน `PATCH /api/users`

#### Scenario: Edit User
- **WHEN** ผู้ใช้คลิก Edit User
- **THEN** ระบบ SHALL เปิด Modal แก้ไขข้อมูล

#### Scenario: Reset MFA
- **WHEN** ผู้ใช้คลิก Reset MFA
- **THEN** ระบบ SHALL รีเซ็ต MFA และเปลี่ยนสถานะเป็น MFA_PENDING ผู้ใช้ต้องลงทะเบียน MFA ใหม่

#### Scenario: Force Sign Out
- **WHEN** ผู้ใช้คลิก Force Sign Out
- **THEN** ระบบ SHALL ออกจากระบบทุก Session ของผู้ใช้

#### Scenario: View Audit Log
- **WHEN** ผู้ใช้คลิก View Audit Log
- **THEN** ระบบ SHALL นำทางไปยัง `/audit-log/activity-log?userId=:id`
- **AND** หน้า Audit Log SHALL อ่าน `userId` จาก URL query param และตั้งค่า `userFilter` เป็นค่านั้นโดยอัตโนมัติ
- **AND** ระบบ SHALL แสดงประวัติเฉพาะของ User ที่เลือกทันทีที่หน้าโหลด

#### Scenario: Delete User
- **WHEN** ผู้ใช้คลิก Delete User (เฉพาะ Super Admin หรือ System Admin)
- **THEN** ระบบ SHALL แสดง Confirmation Dialog ก่อนลบ
- **AND** เมื่อยืนยัน ระบบ SHALL ลบผู้ใช้แบบถาวร (Hard Delete) ผ่าน `DELETE /api/users/:id`

### Requirement: Status Transitions via More Menu

More Menu Actions SHALL ทำให้เกิดการเปลี่ยนสถานะ (Status) ดังนี้:

| Action | Status Before | Status After |
|---|---|---|
| Enable Account | INACTIVE หรือ MFA_PENDING | ACTIVE |
| Disable Account | ACTIVE | INACTIVE |
| Reset MFA | ACTIVE หรือ INACTIVE | MFA_PENDING |

#### Scenario: เปลี่ยนสถานะผ่าน More Menu

- **WHEN** ผู้ใช้กด Enable Account, Disable Account หรือ Reset MFA
- **THEN** Status ในตาราง SHALL อัปเดตทันทีหลังจาก API ตอบกลับสำเร็จ
- **AND** StatusBadge SHALL แสดงสถานะใหม่ที่ถูกต้อง

### Requirement: Permission Preview — Direct Mapping

ระบบ SHALL แสดง Permission Preview Matrix ที่คำนวณจาก `ROLE_PERMISSIONS` โดยตรงด้วย `PERM_CODE_MAP` — แต่ละ permission code map ไปยัง module และ action แบบ 1:1 deterministic (ไม่ใช้ semantic matching, ไม่ใช้ API call) แสดง 9 Modules เรียงตาม Sidebar: Dashboard, Application Hub, Intranet, Book Meeting, Documents, Projects, Users & Roles, Audit Log, Settings

#### Scenario: Permission Preview ตรงกับ ROLE_PERMISSIONS

- **WHEN** ผู้ใช้เลือก Role ใดๆ ใน Role Summary
- **THEN** ทุก permission code ใน `ROLE_PERMISSIONS` ของ Role นั้น SHALL ปรากฏใน Permission Preview ผ่าน `PERM_CODE_MAP` โดยตรง
- **AND** Action ที่มีสิทธิ์ SHALL แสดงเป็นสีเขียว และ Action ที่ไม่มีสิทธิ์ SHALL แสดงเป็นสีเทา
- **AND** การ map ใช้ `PERM_CODE_MAP` แบบ 1:1 — ห้ามใช้ semantic matching

### Requirement: Role Summary Section

ระบบ SHALL แสดงส่วน Role Summary ด้านล่างตารางผู้ใช้งาน ประกอบด้วย Card สำหรับแต่ละ Role (Super Admin, System Admin, Dean, Dept Admin, User, Viewer) โดยไม่มีปุ่ม New Role

#### Scenario: เลือก Role เพื่อดู Permission

- **WHEN** ผู้ใช้คลิกที่ Card ของ Role ใดๆ
- **THEN** ระบบ SHALL แสดง Permission Preview สำหรับ Role นั้น และ Card ที่เลือก SHALL มีขอบสี Primary และพื้นหลังสี Primary Soft
- **AND** Permission Preview SHALL คำนวณจาก `ROLE_PERMISSIONS` ด้วย `PERM_CODE_MAP` แบบ 1:1 deterministic ห้ามใช้ semantic matching

### Requirement: User Detail Drawer

ระบบ SHALL แสดง User Detail Drawer เมื่อผู้ใช้คลิก View Details ใน More Menu หรือคลิกที่ชื่อผู้ใช้ในตาราง โดย Drawer SHALL ไม่มีเมนู Tabs และ SHALL แสดงข้อมูลในหน้าเดียว ประกอบด้วย Header Gradient, Avatar, ชื่อ, หน่วยงาน, Role Badge, Status Badge, และ Detail Cards: Profile, Department, Position, Role, Status, Last Login, Created Date, Updated Date, MFA Status, Account Status โดยเนื้อหาทั้งหมด SHALL แสดงครบถ้วนภายใน Drawer

#### Scenario: เปิด Drawer จาก Action Menu

- **WHEN** ผู้ใช้คลิก View ใน Action Menu (จากปุ่ม More)
- **THEN** ระบบ SHALL แสดง Drawer จากด้านขวาพร้อมพื้นหลัง Overlay และข้อมูลผู้ใช้ครบถ้วนโดยไม่มี Tabs

#### Scenario: เนื้อหาแสดงครบถ้วนใน Drawer

- **WHEN** ผู้ใช้เปิด User Detail Drawer
- **THEN** ข้อมูลทั้งหมด SHALL แสดงภายใน Drawer โดยไม่มีการล้นออกนอกขอบหรือถูกตัด

### Requirement: User Create and Edit Modal

ระบบ SHALL แสดง Modal สำหรับสร้างและแก้ไขผู้ใช้งานในรูปแบบ 2 คอลัมน์ ประกอบด้วยฟิลด์: ชื่อ-นามสกุล, อีเมล, ตำแหน่ง, หน่วยงาน, Role, สถานะ โดยมี Label, Required Indicator (*), และ Placeholder ตาม Design Reference

#### Scenario: สร้างผู้ใช้งานใหม่

- **WHEN** ผู้ใช้คลิกปุ่ม เพิ่มผู้ใช้งาน
- **THEN** ระบบ SHALL แสดง Modal พร้อมฟอร์มว่างและปุ่ม สร้างผู้ใช้งาน

#### Scenario: แก้ไขผู้ใช้งาน

- **WHEN** ผู้ใช้คลิกปุ่ม Edit ในตารางผู้ใช้งาน
- **THEN** ระบบ SHALL แสดง Modal พร้อมข้อมูลผู้ใช้เดิมในฟอร์มและปุ่ม บันทึกการเปลี่ยนแปลง

### Requirement: Role Create Modal

ระบบ SHALL แสดง Modal สำหรับสร้าง Role ใหม่ ประกอบด้วยฟิลด์: ชื่อ Role, คำอธิบาย, และ Permission Groups (Checkbox ราย Module พร้อม Action ย่อย) ตาม Design Reference

#### Scenario: สร้าง Role ใหม่

- **WHEN** ผู้ใช้คลิกปุ่ม New Role ใน Role Summary
- **THEN** ระบบ SHALL แสดง Modal พร้อมฟอร์มว่าง, Permission Groups แบบ Checkbox, และปุ่ม สร้าง Role

### Requirement: Design System Compliance

UI ทั้งหมด SHALL ใช้ Design Tokens (`--tu-*` CSS variables) จาก TULAW ONE Design System ตามที่กำหนดใน `claude.md` ห้ามใช้ Hex Color โดยตรง, ใช้ Typography Prompt Font, ใช้ 8px Spacing System, ใช้ Lucide Icons ขนาด 16px/20px/24px เท่านั้น

#### Scenario: ใช้ Design Tokens อย่างถูกต้อง

- **WHEN** ตรวจสอบโค้ด UI ของหน้า Users & Roles
- **THEN** ทุก Component SHALL ใช้ CSS Variables (`var(--tu-primary)`, `var(--tu-bg)`, ฯลฯ) แทนค่า Hex โดยตรง

### Requirement: Preserve All Existing Functionality

การเปลี่ยนแปลง UI ทั้งหมด SHALL ไม่กระทบกับ Business Logic, Authentication, Authorization, RBAC, Permissions, API, Database, State Management, Routing, CRUD, Search, Filter, Pagination, Validation, Bulk Actions, Import/Export, และ Tab Navigation ที่มีอยู่เดิม

#### Scenario: ฟังก์ชันเดิมทำงานได้ปกติหลังการเปลี่ยน UI

- **WHEN** ผู้ใช้ดำเนินการใดๆ บนหน้า Users & Roles (ค้นหา, กรอง, สร้าง, แก้ไข, ลบ, ดูรายละเอียด, นำเข้า, ส่งออก, เลือกหลายรายการ, เปลี่ยน Tab)
- **THEN** ระบบ SHALL ทำงานเหมือนเดิมทุกประการ โดยเปลี่ยนเฉพาะการแสดงผลทาง UI
