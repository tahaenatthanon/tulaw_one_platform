# User Management Features

## Purpose

TBD — This spec defines the detailed feature requirements for the User Management sub-page within the Users & Roles module of TULAW ONE Platform.

## Requirements

### Requirement: User Management Action Bar

หน้า User Management SHALL แสดง Action Bar ตามลำดับดังนี้: Import CSV, Export CSV, AD Sync, Bulk Actions

#### Scenario: Action Bar visible for authorized users

- **WHEN** ผู้ใช้ที่มีสิทธิ์ `USERS_BULK_IMPORT`, `USERS_BULK_IMPORT` (สำหรับ Export), `USERS_AD_SYNC` เข้าหน้า User Management
- **THEN** ระบบ SHALL แสดง Action Bar พร้อมปุ่ม Import CSV, Export CSV, AD Sync, Bulk Actions ตามลำดับ

#### Scenario: Bulk Actions disabled when no items selected

- **WHEN** ยังไม่มีการเลือกผู้ใช้รายใด
- **THEN** ปุ่ม Bulk Actions SHALL อยู่ในสถานะ disabled

### Requirement: Bulk Actions

ระบบ SHALL รองรับการดำเนินการกับผู้ใช้หลายรายการพร้อมกันผ่าน Bulk Actions ประกอบด้วย Assign Role, Enable, Disable, Unlock Account, Reset MFA, Export Selected

#### Scenario: Bulk Assign Role

- **WHEN** ผู้ดูแลระบบเลือกผู้ใช้หลายรายและเลือก Assign Role จาก Bulk Actions พร้อมเลือกรายการ Role
- **THEN** ระบบ SHALL กำหนด Role ที่เลือกให้กับผู้ใช้ทุกรายที่เลือก และแสดงผลสำเร็จ
- **AND** สิทธิ์การใช้งานของผู้ใช้ SHALL มีผลทันที

#### Scenario: Bulk Enable

- **WHEN** ผู้ดูแลระบบเลือกผู้ใช้ที่มีสถานะ Inactive หลายรายและเลือก Enable จาก Bulk Actions
- **THEN** ระบบ SHALL เปลี่ยนสถานะเป็น Active ให้กับผู้ใช้ทุกรายที่เลือก
- **AND** ผู้ใช้ SHALL สามารถเข้าใช้งานระบบได้ทันที

#### Scenario: Bulk Disable

- **WHEN** ผู้ดูแลระบบเลือกผู้ใช้ที่มีสถานะ Active หลายรายและเลือก Disable จาก Bulk Actions
- **THEN** ระบบ SHALL เปลี่ยนสถานะเป็น Inactive ให้กับผู้ใช้ทุกรายที่เลือก
- **AND** ผู้ใช้ SHALL ไม่สามารถเข้าใช้งานระบบได้ทันที

#### Scenario: Bulk Unlock Account

- **WHEN** ผู้ดูแลระบบเลือกผู้ใช้ที่ถูกล็อกบัญชีหลายรายและเลือก Unlock Account จาก Bulk Actions
- **THEN** ระบบ SHALL ปลดล็อกบัญชีให้กับผู้ใช้ทุกรายที่เลือก
- **AND** ผู้ใช้ SHALL สามารถเข้าสู่ระบบได้ทันที

#### Scenario: Bulk Reset MFA

- **WHEN** ผู้ดูแลระบบเลือกผู้ใช้หลายรายและเลือก Reset MFA จาก Bulk Actions
- **THEN** ระบบ SHALL รีเซ็ต MFA ให้กับผู้ใช้ทุกรายที่เลือก
- **AND** ผู้ใช้ SHALL ต้องลงทะเบียน MFA ใหม่ในการเข้าสู่ระบบครั้งถัดไป

#### Scenario: Bulk Export Selected

- **WHEN** ผู้ดูแลระบบเลือกผู้ใช้หลายรายและเลือก Export Selected จาก Bulk Actions
- **THEN** ระบบ SHALL ส่งออกข้อมูลผู้ใช้ที่เลือกเป็นไฟล์ CSV และดาวน์โหลด

### Requirement: Bulk Selection

ระบบ SHALL รองรับการเลือกผู้ใช้หลายรายการพร้อมกัน พร้อม Select All และ Clear Selection

#### Scenario: Select All users

- **WHEN** ผู้ใช้คลิก Checkbox "Select All" ในหัวตาราง
- **THEN** ระบบ SHALL เลือกผู้ใช้ทุกรายในหน้านั้น
- **AND** แสดงจำนวนผู้ใช้ที่ถูกเลือกและแสดง Bulk Action Bar

#### Scenario: Clear Selection

- **WHEN** ผู้ใช้คลิก "Clear Selection" ใน Bulk Action Bar
- **THEN** ระบบ SHALL ยกเลิกการเลือกผู้ใช้ทั้งหมด
- **AND** Bulk Action Bar SHALL ถูกซ่อน

#### Scenario: Select individual user

- **WHEN** ผู้ใช้คลิก Checkbox ในแถวของผู้ใช้รายหนึ่ง
- **THEN** ระบบ SHALL เลือกผู้ใช้รายนั้นและแสดง Bulk Action Bar (หากยังไม่แสดง)

### Requirement: Advanced Filters

หน้า User Management SHALL มี Filter ตามลำดับดังนี้: Search, Role, Status, Department, Authentication Source, MFA, Last Login

#### Scenario: Filter by Authentication Source

- **WHEN** ผู้ใช้เลือก Filter Authentication Source เป็น "LDAP"
- **THEN** ระบบ SHALL แสดงเฉพาะผู้ใช้ที่มี Authentication Source เป็น LDAP

#### Scenario: Filter by MFA Status

- **WHEN** ผู้ใช้เลือก Filter MFA เป็น "Enabled"
- **THEN** ระบบ SHALL แสดงเฉพาะผู้ใช้ที่เปิดใช้งาน MFA

#### Scenario: Filter by Last Login

- **WHEN** ผู้ใช้เลือกช่วงวันที่ใน Filter Last Login
- **THEN** ระบบ SHALL แสดงเฉพาะผู้ใช้ที่เข้าสู่ระบบครั้งสุดท้ายในช่วงวันที่ที่เลือก

#### Scenario: Filter by Department

- **WHEN** ผู้ใช้เลือก Department จาก Filter
- **THEN** ระบบ SHALL แสดงเฉพาะผู้ใช้ในหน่วยงานที่เลือก
- **AND** สำหรับ Dept Admin ระบบ SHALL แสดงเฉพาะหน่วยงานของตนเอง

### Requirement: User Table Columns

ตารางผู้ใช้ SHALL แสดงคอลัมน์ตามลำดับดังนี้: Checkbox, Name, Email, Authentication Source, Role, Department, Status, MFA, Last AD Sync, Last Login, IP Address, Action

#### Scenario: Authentication Source column

- **WHEN** แสดงตารางผู้ใช้
- **THEN** คอลัมน์ Authentication Source SHALL แสดง "LDAP" หรือ "Local" ตามประเภทผู้ใช้

#### Scenario: MFA column

- **WHEN** แสดงตารางผู้ใช้
- **THEN** คอลัมน์ MFA SHALL แสดงสถานะ "Enabled", "Disabled", หรือ "Pending"

#### Scenario: Last AD Sync column

- **WHEN** แสดงตารางผู้ใช้
- **THEN** คอลัมน์ Last AD Sync SHALL แสดงวันที่และเวลาครั้งล่าสุดที่ซิงค์ข้อมูลจาก Active Directory ในรูปแบบ "15 Jul 2026 10:02"

#### Scenario: Last Login column

- **WHEN** แสดงตารางผู้ใช้
- **THEN** คอลัมน์ Last Login SHALL แสดงวันที่และเวลาที่ผู้ใช้เข้าสู่ระบบครั้งล่าสุด ในรูปแบบ "15 Jul 2026 09:45"

#### Scenario: IP Address column

- **WHEN** แสดงตารางผู้ใช้
- **THEN** คอลัมน์ IP Address SHALL แสดง IP Address ล่าสุดที่ผู้ใช้ใช้เข้าสู่ระบบ ในรูปแบบ "10.10.1.25"

### Requirement: Action Menu

แต่ละแถวในตารางผู้ใช้ SHALL มี Action Menu (⋮) ประกอบด้วย View, Edit (เฉพาะ Local User), Assign Role, Reset MFA, Unlock Account, Enable/Disable

#### Scenario: Action Menu appears on click

- **WHEN** ผู้ใช้คลิกปุ่ม Action Menu (⋮) ในแถวของผู้ใช้รายหนึ่ง
- **THEN** ระบบ SHALL แสดง Dropdown Menu พร้อมรายการ: View, Edit, Assign Role, Reset MFA, Unlock Account, Enable/Disable

#### Scenario: Edit hidden for LDAP User

- **WHEN** Action Menu ของผู้ใช้ประเภท LDAP ถูกเปิด
- **THEN** รายการ Edit SHALL ถูกซ่อน เนื่องจาก LDAP User แก้ไขผ่าน Active Directory เท่านั้น

#### Scenario: Enable/Disable toggle

- **WHEN** Action Menu ของผู้ใช้ที่มีสถานะ Active ถูกเปิด
- **THEN** รายการ "Disable" SHALL แสดง
- **WHEN** Action Menu ของผู้ใช้ที่มีสถานะ Inactive ถูกเปิด
- **THEN** รายการ "Enable" SHALL แสดง

#### Scenario: Unlock Account visible for locked accounts

- **WHEN** Action Menu ของผู้ใช้ที่ถูกล็อกบัญชีถูกเปิด
- **THEN** รายการ "Unlock Account" SHALL แสดง
- **WHEN** Action Menu ของผู้ใช้ที่ไม่ได้ถูกล็อกบัญชีถูกเปิด
- **THEN** รายการ "Unlock Account" SHALL ถูกซ่อน

### Requirement: User Detail Drawer

เมื่อคลิกชื่อผู้ใช้หรือเลือก View จาก Action Menu ระบบ SHALL เปิด Drawer ทางด้านขวา แสดงข้อมูล Profile, Roles, Permissions, Activity, Sessions

#### Scenario: Drawer opens on name click

- **WHEN** ผู้ใช้คลิกที่ชื่อผู้ใช้ในตาราง
- **THEN** ระบบ SHALL เปิด Drawer ทางด้านขวาของหน้าจอ แสดงข้อมูลผู้ใช้

#### Scenario: Drawer Profile section

- **WHEN** เปิด User Detail Drawer
- **THEN** ส่วน Profile SHALL แสดง: Name, Email, Department, Authentication Source, Status, MFA, Last AD Sync, Last Login, IP Address

#### Scenario: Drawer Roles section

- **WHEN** เปิด User Detail Drawer
- **THEN** ส่วน Roles SHALL แสดง Assigned Role และ Permission Source (Role-based)

#### Scenario: Drawer Permissions section

- **WHEN** เปิด User Detail Drawer
- **THEN** ส่วน Permissions SHALL แสดง Effective Permissions ของผู้ใช้แบบ Read Only

#### Scenario: Drawer Activity section

- **WHEN** เปิด User Detail Drawer
- **THEN** ส่วน Activity SHALL แสดงประวัติ: Login, Logout, Assign Role, Reset MFA, Enable/Disable, Unlock Account

#### Scenario: Drawer Sessions section

- **WHEN** เปิด User Detail Drawer
- **THEN** ส่วน Sessions SHALL แสดง: Device, Browser, Operating System, IP Address, Login Time, Last Activity, Session Status

### Requirement: Global Search

ระบบ SHALL รองรับการค้นหาผู้ใช้จากทุกฟิลด์ ได้แก่ Name, Email, Role, Department, Status, Authentication Source, Last Login, IP Address

#### Scenario: Search by IP Address

- **WHEN** ผู้ใช้พิมพ์ IP Address ในช่องค้นหา
- **THEN** ระบบ SHALL ค้นหาและแสดงผู้ใช้ที่มี IP Address ตรงกับที่ค้นหา

#### Scenario: Search by Role

- **WHEN** ผู้ใช้พิมพ์ชื่อ Role ในช่องค้นหา
- **THEN** ระบบ SHALL ค้นหาและแสดงผู้ใช้ที่มี Role ตรงกับที่ค้นหา

#### Scenario: Search across all fields

- **WHEN** ผู้ใช้พิมพ์คำค้นหาใดๆ
- **THEN** ระบบ SHALL ค้นหาในทุกฟิลด์ (Name, Email, Role, Department, Status, Authentication Source, Last Login, IP Address) และแสดงผลลัพธ์ที่ตรงกัน

### Requirement: Pagination Options

ระบบ SHALL รองรับตัวเลือกจำนวนรายการต่อหน้า: 10, 25, 50, 100 และแสดงข้อมูลในรูปแบบ "Showing 1–25 of 315 users"

#### Scenario: Change page size

- **WHEN** ผู้ใช้เปลี่ยนจำนวนรายการต่อหน้าเป็น 50
- **THEN** ระบบ SHALL แสดงผู้ใช้ 50 รายการต่อหน้า
- **AND** ข้อความแสดงผล SHALL อัปเดตเป็น "Showing 1–50 of 315 users"

#### Scenario: Pagination display

- **WHEN** ระบบแสดงรายการผู้ใช้
- **THEN** ระบบ SHALL แสดงข้อความในรูปแบบ "Showing X–Y of Z users" ที่ Pagination bar

### Requirement: Authentication Source Support

ระบบ SHALL รองรับผู้ใช้ 2 ประเภท: LDAP User (Primary Authentication Source) และ Local User (Development และ Emergency Administrator)

#### Scenario: LDAP User restrictions

- **WHEN** ระบบแสดงข้อมูล LDAP User
- **THEN** ปุ่ม Edit SHALL ถูกซ่อน และข้อมูลพื้นฐาน SHALL มาจาก Active Directory
- **AND** การแก้ไขข้อมูล LDAP User ต้องดำเนินการผ่าน Active Directory แล้วซิงค์กลับเข้าระบบ

#### Scenario: Local User management

- **WHEN** Super Admin จัดการ Local User
- **THEN** ระบบ SHALL อนุญาตให้สร้าง แก้ไข และลบ Local User ได้
- **AND** การสร้าง Local User SHALL จำกัดเฉพาะผู้มีสิทธิ์ Super Admin

### Requirement: CSV Import

ระบบ SHALL รองรับการ Import ไฟล์ CSV เพื่อกำหนด Role หรืออัปเดตข้อมูลประกอบของผู้ใช้ที่มีอยู่ในระบบ โดยไม่รองรับการสร้าง LDAP User ใหม่

#### Scenario: Import CSV for role assignment

- **WHEN** ผู้ดูแลระบบอัปโหลดไฟล์ CSV ที่มีข้อมูล Email และ Role
- **THEN** ระบบ SHALL อัปเดต Role ให้กับผู้ใช้ที่มี Email ตรงกับในระบบ
- **AND** แสดงผลสำเร็จพร้อมจำนวนรายการที่อัปเดต

#### Scenario: Import CSV cannot create LDAP User

- **WHEN** ไฟล์ CSV มี Email ที่ไม่มีอยู่ในระบบ
- **THEN** ระบบ SHALL แจ้งเตือนว่าไม่พบผู้ใช้และข้ามรายการนั้น
- **AND** ไม่สร้าง LDAP User ใหม่ผ่าน CSV Import

### Requirement: Active Directory Integration

ระบบ SHALL รองรับการซิงค์ผู้ใช้จาก Active Directory (LDAP) ทั้งแบบ Manual (AD Sync) และ Automatic โดยการซิงค์จะอัปเดตข้อมูลผู้ใช้ทันทีหลังเสร็จสมบูรณ์

#### Scenario: Manual AD Sync

- **WHEN** ผู้ดูแลระบบคลิกปุ่ม AD Sync
- **THEN** ระบบ SHALL เริ่มกระบวนการซิงค์ข้อมูลจาก Active Directory
- **AND** แสดงสถานะระหว่างการซิงค์
- **AND** หลังจากซิงค์เสร็จ ข้อมูลผู้ใช้ SHALL อัปเดตทันที

#### Scenario: AD Sync updates user data without affecting AD source

- **WHEN** ระบบซิงค์ข้อมูลจาก Active Directory
- **THEN** ระบบ SHALL อัปเดตข้อมูลผู้ใช้ในระบบตามข้อมูลจาก AD
- **AND** ข้อมูลต้นทางใน Active Directory SHALL ไม่ถูกแก้ไข

#### Scenario: Role assignment for AD users

- **WHEN** ผู้ดูแลระบบกำหนด Role ให้กับ LDAP User ผ่านระบบ
- **THEN** ระบบ SHALL บันทึก Role โดยไม่กระทบข้อมูลใน Active Directory
- **AND** Role ที่กำหนด SHALL คงอยู่แม้หลังการซิงค์ AD (ยกเว้นมีการกำหนดจาก AD โดยตรง)

### Requirement: Real-time Behavior

การดำเนินการต่อไปนี้ SHALL มีผลทันที: Assign Role, Enable, Disable, Unlock Account, Reset MFA, AD Sync, Export CSV

#### Scenario: Assign Role takes effect immediately

- **WHEN** ผู้ดูแลระบบกำหนด Role ให้กับผู้ใช้
- **THEN** สิทธิ์การใช้งานของผู้ใช้ SHALL เปลี่ยนแปลงทันทีโดยไม่ต้องรอรีเฟรช

#### Scenario: Disable takes effect immediately

- **WHEN** ผู้ดูแลระบบปิดใช้งานบัญชีผู้ใช้
- **THEN** ผู้ใช้ SHALL ไม่สามารถเข้าใช้งานระบบได้ทันที

#### Scenario: Enable takes effect immediately

- **WHEN** ผู้ดูแลระบบเปิดใช้งานบัญชีผู้ใช้
- **THEN** ผู้ใช้ SHALL สามารถเข้าใช้งานระบบได้ทันที

#### Scenario: Unlock Account takes effect immediately

- **WHEN** ผู้ดูแลระบบปลดล็อกบัญชีผู้ใช้
- **THEN** ผู้ใช้ SHALL สามารถเข้าสู่ระบบได้ทันที

#### Scenario: Reset MFA takes effect immediately

- **WHEN** ผู้ดูแลระบบรีเซ็ต MFA ของผู้ใช้
- **THEN** ผู้ใช้ SHALL ต้องลงทะเบียน MFA ใหม่ในการเข้าสู่ระบบครั้งถัดไป

### Requirement: Bulk Action Role Dropdown Order

ตัวกรอง Role ใน Bulk Action SHALL แสดงตัวเลือกตามลำดับดังนี้: All Role, Super Admin, System Admin, Dean, Dept Admin, User, Viewer

#### Scenario: Role dropdown displays in correct order

- **WHEN** ผู้ใช้เปิดตัวกรอง Role ใน Bulk Action Assign Role
- **THEN** ตัวเลือก SHALL เรียงลำดับเป็น: All Role → Super Admin → System Admin → Dean → Dept Admin → User → Viewer

#### Scenario: Role dropdown data from real system

- **WHEN** ระบบแสดงตัวกรอง Role
- **THEN** รายการ Role SHALL ดึงจากข้อมูลจริงในระบบ (roles table) เรียงตาม level จากมากไปน้อย

### Requirement: Bulk Action Department Dropdown

ตัวกรอง Department ใน Bulk Action SHALL ดึงรายการหน่วยงานจากข้อมูลจริงของระบบ และแสดง "All Departments" เป็นตัวเลือกแรก

#### Scenario: Department dropdown shows All Departments first

- **WHEN** ผู้ใช้เปิดตัวกรอง Department ใน Bulk Action
- **THEN** ตัวเลือกแรก SHALL เป็น "All Departments"
- **AND** ตัวเลือกที่เหลือ SHALL เป็นรายชื่อหน่วยงานจากฐานข้อมูลจริง

#### Scenario: Department filter queries real database

- **WHEN** ผู้ใช้เลือก Department จากตัวกรอง
- **THEN** ระบบ SHALL กรองข้อมูลผู้ใช้จากฐานข้อมูลจริงตามหน่วยงานที่เลือก

### Requirement: Tab Menu Preservation

หน้า Users & Roles SHALL คงแท็บเมนูเดิมไว้ทั้งหมด: User Management, Role Management, Permission Management, AD Sync

#### Scenario: All four tabs visible

- **WHEN** ผู้ใช้ที่มีสิทธิ์เข้าถึงหน้า Users & Roles
- **THEN** ระบบ SHALL แสดงแท็บเมนูครบทั้ง 4 รายการ: User Management, Role Management, Permission Management, AD Sync

#### Scenario: Tabs navigate to sub-pages

- **WHEN** ผู้ใช้คลิกแท็บใดๆ
- **THEN** ระบบ SHALL นำทางไปยังหน้า sub-page ที่เกี่ยวข้อง (/users/user-management, /users/role-management, /users/permission-management, /users/ad-sync)

### Requirement: Single-Line Table Rows

ข้อมูลทุกคอลัมน์ในตารางผู้ใช้ SHALL แสดงในบรรทัดเดียว ไม่ตัดบรรทัด (no text wrapping)

#### Scenario: No text wrapping in any column

- **WHEN** แสดงตารางผู้ใช้
- **THEN** ทุกคอลัมน์ SHALL ใช้ `white-space: nowrap` เพื่อป้องกันการตัดบรรทัด
- **AND** หากข้อมูลยาวเกินความกว้างคอลัมน์ SHALL ใช้ `text-overflow: ellipsis` และ `overflow: hidden`

### Requirement: Responsive Drawer Sizes

Drawer ทุกประเภท (View, Edit, Assign Role, Reset Password และอื่นๆ) SHALL มีขนาดเหมาะสมในทุกอุปกรณ์

#### Scenario: Drawer size on desktop

- **WHEN** เปิด Drawer บนหน้าจอขนาด ≥1024px
- **THEN** Drawer SHALL มีความกว้าง 440px และสูงสุด 90vw

#### Scenario: Drawer size on tablet

- **WHEN** เปิด Drawer บนหน้าจอขนาด 768-1023px
- **THEN** Drawer SHALL มีความกว้าง 380px และสูงสุด 90vw

#### Scenario: Drawer size on mobile

- **WHEN** เปิด Drawer บนหน้าจอขนาด <768px
- **THEN** Drawer SHALL แสดงผลแบบเต็มหน้าจอ (100vw)

### Requirement: Real Backend Integration — No Mock Data

ทุกฟังก์ชันใน User Management SHALL ทำงานกับ Backend จริงผ่าน API ห้ามใช้ Mock Data, Placeholder หรือปุ่มที่ยังไม่มีการทำงานจริง

#### Scenario: Create user calls real API

- **WHEN** ผู้ดูแลระบบสร้างผู้ใช้ใหม่
- **THEN** ระบบ SHALL ส่ง POST ไปยัง API จริงและบันทึกลงฐานข้อมูล

#### Scenario: Update user calls real API

- **WHEN** ผู้ดูแลระบบแก้ไขข้อมูลผู้ใช้
- **THEN** ระบบ SHALL ส่ง PUT ไปยัง API จริงและอัปเดตฐานข้อมูล

#### Scenario: Delete user calls real API

- **WHEN** ผู้ดูแลระบบลบผู้ใช้
- **THEN** ระบบ SHALL ส่ง DELETE ไปยัง API จริงและ soft-delete ในฐานข้อมูล

#### Scenario: Action Menu items call real backend

- **WHEN** ผู้ใช้คลิกเมนูใดๆ ใน Action Menu (⋮) เช่น Enable, Disable, Unlock, Reset MFA, Assign Role
- **THEN** ทุกเมนู SHALL เรียก API จริงและอัปเดตข้อมูลในระบบทันที

#### Scenario: Search queries real database

- **WHEN** ผู้ใช้พิมพ์คำค้นหาในช่อง Search
- **THEN** ระบบ SHALL ส่ง query ไปยัง GET /api/users?search=... และแสดงผลจากฐานข้อมูลจริง
- **AND** ตาราง SHALL อัปเดตผลลัพธ์ทันที
- **AND** เมื่อล้างคำค้นหา ระบบ SHALL แสดงรายการผู้ใช้ทั้งหมดอีกครั้ง

#### Scenario: Filter queries real database

- **WHEN** ผู้ใช้เปลี่ยนตัวกรองใดๆ (Role, Status, Department, Auth Source, MFA)
- **THEN** ระบบ SHALL ส่ง query params ไปยัง GET /api/users และกรองข้อมูลจากฐานข้อมูลจริง

### Requirement: Search Supports Real Fields

ช่องค้นหา SHALL ค้นหาจากข้อมูลผู้ใช้จริงในระบบอย่างน้อยตามฟิลด์: ชื่อ-นามสกุล, อีเมล, Username (ถ้ามี)

#### Scenario: Search by name

- **WHEN** ผู้ใช้พิมพ์ชื่อหรือนามสกุลในช่องค้นหา
- **THEN** ระบบ SHALL ค้นหาจาก firstNameTh และ lastNameTh ในฐานข้อมูลและแสดงผล

#### Scenario: Search by email

- **WHEN** ผู้ใช้พิมพ์อีเมลในช่องค้นหา
- **THEN** ระบบ SHALL ค้นหาจาก email ในฐานข้อมูลและแสดงผล

#### Scenario: Clear search shows all users

- **WHEN** ผู้ใช้ล้างคำค้นหา (กด X หรือลบข้อความ)
- **THEN** ระบบ SHALL ดึงรายการผู้ใช้ทั้งหมดอีกครั้งจาก API

### Requirement: Real-time Bulk Action Filter

การเลือกค่าใน Bulk Action dropdown (Role หรือ Department) SHALL กรองข้อมูลในตารางตามเงื่อนไขที่เลือกทันที โดยอัปเดตผลลัพธ์แบบ Real-time

#### Scenario: Role dropdown filters table immediately

- **WHEN** ผู้ใช้เลือก Role จาก Bulk Action dropdown
- **THEN** ตารางผู้ใช้ SHALL อัปเดตผลลัพธ์ทันทีตาม Role ที่เลือก
- **AND** ไม่ต้องรอกดปุ่ม Apply หรือ Submit

#### Scenario: Department dropdown filters table immediately

- **WHEN** ผู้ใช้เลือก Department จาก Bulk Action dropdown
- **THEN** ตารางผู้ใช้ SHALL อัปเดตผลลัพธ์ทันทีตาม Department ที่เลือก
- **AND** การกรอง SHALL ใช้ข้อมูลจากฐานข้อมูลจริง

#### Scenario: Clearing Bulk Action filter restores full list

- **WHEN** ผู้ใช้เลือก "All Role" หรือ "All Departments" ใน Bulk Action dropdown
- **THEN** ตารางผู้ใช้ SHALL แสดงรายการทั้งหมดอีกครั้งโดยไม่มีการกรอง

### Requirement: Tab Switching Behavior

เมื่อผู้ใช้เลือก Tab ในเมนู User Management, Role Management, Permission Management, AD Sync ระบบ SHALL แสดงข้อมูลของ Tab นั้นทันที และแสดงเฉพาะข้อมูลของ Tab ที่กำลังใช้งาน (Active Tab) เท่านั้น

#### Scenario: Clicking a tab navigates and shows content

- **WHEN** ผู้ใช้คลิกแท็บ Role Management
- **THEN** ระบบ SHALL นำทางไปยัง `/users/role-management` ทันที
- **AND** แสดงเนื้อหาของ Role Management แทนเนื้อหาของ User Management

#### Scenario: Only active tab content is displayed

- **WHEN** ผู้ใช้อยู่ที่แท็บ User Management
- **THEN** ระบบ SHALL แสดงเฉพาะข้อมูลของ User Management
- **AND** ไม่แสดงข้อมูลของ Role Management, Permission Management หรือ AD Sync

#### Scenario: Switching between tabs replaces content

- **WHEN** ผู้ใช้เปลี่ยนจากแท็บ User Management ไปยัง Permission Management
- **THEN** ระบบ SHALL เปลี่ยนเนื้อหาให้ตรงกับแท็บ Permission Management
- **AND** เนื้อหาของ User Management SHALL ถูกแทนที่

### Requirement: Sidebar Width Optimization

ระบบ SHALL ปรับลดความกว้างของ Sidebar ด้านซ้ายเพื่อเพิ่มพื้นที่แสดงผลของเนื้อหาหลัก โดยเมนูทั้งหมดยังคงใช้งานและอ่านได้อย่างชัดเจน

#### Scenario: Sidebar width reduced for more content space

- **WHEN** ผู้ใช้เปิดหน้า User Management
- **THEN** Sidebar SHALL มีความกว้างประมาณ 220px (ลดจาก ~260px)
- **AND** พื้นที่เนื้อหาหลัก SHALL กว้างขึ้นตามสัดส่วน

#### Scenario: Sidebar menu remains readable

- **WHEN** Sidebar มีความกว้างลดลง
- **THEN** ข้อความเมนู SHALL ใช้ `text-overflow: ellipsis` สำหรับข้อความยาว
- **AND** ไอคอน SHALL มีขนาด 20px
- **AND** ข้อความ SHALL มีขนาด 13px
- **AND** ทุกเมนู SHALL ยังคงสามารถคลิกและใช้งานได้
- **AND** ข้อความภาษาไทย SHALL ยังคงอ่านได้อย่างชัดเจน

#### Scenario: Sidebar minimum width constraint

- **WHEN** หน้าจอมีขนาดเล็กมาก
- **THEN** Sidebar SHALL คงความกว้างขั้นต่ำ 200px
- **AND** หากพื้นที่ไม่เพียงพอ Sidebar SHALL ซ่อนเป็น Hamburger Menu (Mobile)
