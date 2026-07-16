## MODIFIED Requirements

### Requirement: Audit Log View Details

ระบบ SHALL รองรับการดูรายละเอียดของแต่ละรายการ Audit Log ใน Drawer ขนาด Large โดยแบ่งข้อมูลเป็น 6 Sections: General Information, User Information, Target Resource, Change History, Request Information, Additional Information

#### Scenario: View audit log detail with full sections

- **WHEN** ผู้ใช้คลิกที่รายการ Audit Log
- **THEN** ระบบ SHALL เปิด Drawer แสดง: Log ID, Timestamp, Event Type, Module, Action, Status
- **AND** User: Name, ID, Email, Role, Department
- **AND** Target Resource: Object Type, Record ID
- **AND** Change History: Before/After JSON แบบ Side-by-side พร้อม Syntax Highlight (หรือ "N/A")
- **AND** Request Info: IP Address, User Agent, Browser, OS, Device, Session ID, Request ID, Endpoint, HTTP Method
- **AND** Additional: Error Message (ถ้า Failed), Auth Method, Duration, Correlation ID

#### Scenario: JSON syntax highlighting in change history

- **WHEN** Before หรือ After มีค่า JSON
- **THEN** ระบบ SHALL แสดง JSON พร้อม syntax highlighting: key=blue, string=green, number=red, boolean=purple, null=gray

#### Scenario: Copy button available

- **WHEN** ผู้ใช้เปิด Detail Drawer
- **THEN** ทุก field ที่มีค่า SHALL มีปุ่ม Copy สำหรับคัดลอกไปยัง clipboard

#### Scenario: Collapse/Expand for large data

- **WHEN** JSON มีขนาดเกิน 200px
- **THEN** ระบบ SHALL แสดงปุ่ม Expand/Collapse เพื่อย่อหรือขยายการแสดงผล
