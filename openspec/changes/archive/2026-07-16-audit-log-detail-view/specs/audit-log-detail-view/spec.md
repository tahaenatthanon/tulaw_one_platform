## ADDED Requirements

### Requirement: Structured Audit Log Detail API

ระบบ SHALL คืนข้อมูล Audit Log Detail จาก `GET /api/audit-logs/[id]` โดยแบ่งเป็น 6 Sections: General Information, User Information, Target Resource, Change History, Request Information, Additional Information

#### Scenario: API returns general information

- **WHEN** ผู้ใช้เรียก `GET /api/audit-logs/[id]`
- **THEN** response SHALL ประกอบด้วย: logId, timestamp, eventType, module, action, status (Success/Failed)

#### Scenario: API returns user information

- **WHEN** ผู้ใช้เรียก `GET /api/audit-logs/[id]`
- **THEN** response SHALL ประกอบด้วย: userId, userName, email, role, department
- **AND** หากไม่มี user (system event) SHALL แสดง "System" หรือ "N/A"

#### Scenario: API returns target resource

- **WHEN** ผู้ใช้เรียก `GET /api/audit-logs/[id]`
- **THEN** response SHALL ประกอบด้วย: objectType, recordId
- **AND** หากไม่มี target resource SHALL แสดง "N/A"

#### Scenario: API returns change history

- **WHEN** ผู้ใช้เรียก `GET /api/audit-logs/[id]` และรายการมีการแก้ไขข้อมูล
- **THEN** response SHALL ประกอบด้วย: beforeValue (JSON formatted), afterValue (JSON formatted)
- **AND** หากไม่มีการแก้ไข (เช่น Login/Logout) SHALL แสดง "N/A"

#### Scenario: API returns request information

- **WHEN** ผู้ใช้เรียก `GET /api/audit-logs/[id]`
- **THEN** response SHALL ประกอบด้วย: ipAddress, userAgent, browser, operatingSystem, device, requestId, apiEndpoint, httpMethod

#### Scenario: API returns additional information

- **WHEN** ผู้ใช้เรียก `GET /api/audit-logs/[id]`
- **THEN** response SHALL ประกอบด้วย: errorMessage (เฉพาะกรณี Status = Failed), authMethod, duration, correlationId

### Requirement: Section-Based Detail Drawer UI

ระบบ SHALL แสดงรายละเอียด Audit Log ใน Drawer ขนาด Large โดยแบ่งข้อมูลเป็น Section ตามลำดับ: General Information, User Information, Target Resource, Change History, Request Information, Additional Information

#### Scenario: Drawer opens with structured sections

- **WHEN** ผู้ใช้คลิกปุ่ม View Detail ในตาราง Audit Log
- **THEN** ระบบ SHALL เปิด Drawer ขนาด Large (640px) แสดงข้อมูลแบ่งเป็น Sections
- **AND** แต่ละ Section SHALL มีหัวข้อและเส้นคั่น

#### Scenario: Sections displayed in order

- **WHEN** เปิด Detail Drawer
- **THEN** Sections SHALL เรียงลำดับ: General → User → Target Resource → Change History → Request → Additional
- **AND** Section ที่ไม่มีข้อมูล (เช่น Additional สำหรับ Success) SHALL ยังคงแสดงแต่แสดง "N/A"

### Requirement: Change History — Side-by-Side JSON with Syntax Highlight

ระบบ SHALL แสดง Before Value และ After Value ในรูปแบบ JSON พร้อม Syntax Highlight และแสดงแบบ Side-by-side บนหน้าจอกว้าง

#### Scenario: Side-by-side on desktop

- **WHEN** หน้าจอมีความกว้าง ≥768px และมี Before/After values
- **THEN** Before และ After SHALL แสดงแบบ Side-by-side (คนละ 50% ความกว้าง)
- **AND** JSON SHALL มี Syntax Highlight (key สีฟ้า, string สีเขียว, number สีแดง, boolean สีม่วง, null สีเทา)

#### Scenario: Stacked on mobile

- **WHEN** หน้าจอมีความกว้าง <768px
- **THEN** Before และ After SHALL แสดงแบบ Stacked (Before ด้านบน, After ด้านล่าง)

#### Scenario: N/A for non-edit events

- **WHEN** รายการ Audit Log ไม่มีการแก้ไขข้อมูล (เช่น Login, Logout, Dashboard View)
- **THEN** Change History SHALL แสดง "N/A — No data changes"

### Requirement: Copy Functionality

ระบบ SHALL รองรับการ Copy ค่าของแต่ละ Field ใน Detail Drawer

#### Scenario: Copy JSON value

- **WHEN** ผู้ใช้คลิกปุ่ม Copy บน Before หรือ After JSON
- **THEN** ระบบ SHALL คัดลอก JSON ไปยัง clipboard
- **AND** แสดง icon checkmark ชั่วคราวเพื่อยืนยัน

#### Scenario: Copy field value

- **WHEN** ผู้ใช้คลิกปุ่ม Copy บน field ใดๆ (เช่น IP Address, User ID)
- **THEN** ระบบ SHALL คัดลอกค่าไปยัง clipboard

### Requirement: Collapse / Expand for Large JSON

ระบบ SHALL รองรับการย่อและขยาย JSON ขนาดใหญ่ใน Change History

#### Scenario: Collapse large JSON

- **WHEN** Before หรือ After มีขนาดใหญ่เกิน 200px
- **THEN** ระบบ SHALL แสดงเฉพาะ 200px แรก และแสดงปุ่ม "Expand"
- **AND** เมื่อคลิก Expand SHALL แสดง JSON ทั้งหมด
- **AND** เมื่อคลิก Collapse SHALL กลับมาแสดงเฉพาะ 200px แรก
