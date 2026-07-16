## 1. API — Audit Log Detail Enhancement

- [x] 1.1 เพิ่ม `include` fields ใน Prisma query: `userRoles`, `user: { include: { department, userRoles } }`, `userSessions`
- [x] 1.2 เพิ่ม computed fields: `operatingSystem` (จาก userAgent), `browser` (จาก userAgent), `role` (จาก userRoles), `authMethod` (จาก authSource)
- [x] 1.3 จัด structure response เป็น 6 sections: general, user, targetResource, changeHistory, requestInfo, additionalInfo
- [x] 1.4 ใช้ `JSON.parse` กับ `oldValue`/`newValue` สำหรับ JSON output — fallback to raw string

## 2. UI — JSON Syntax Highlight Component

- [x] 2.1 สร้าง `components/shared/json-highlight.tsx` — `JsonHighlight({ data, maxHeight })` component
- [x] 2.2 ใช้ `JSON.stringify(obj, null, 2)` + regex เพื่อใส่ span พร้อม CSS classes
- [x] 2.3 CSS classes: `.json-key` (blue), `.json-string` (green), `.json-number` (red), `.json-boolean` (purple), `.json-null` (gray)
- [x] 2.4 รองรับ Collapse/Expand: `useState` toggle + `max-h-[200px] overflow-hidden` → `max-h-none`

## 3. UI — Section-Based Detail Drawer

- [x] 3.1 ออกแบบ Drawer ใหม่: `w-full sm:w-[480px] lg:w-[640px]` (Large)
- [x] 3.2 สร้าง Section: General Information (Log ID, Timestamp, Event Type, Module, Action, Status)
- [x] 3.3 สร้าง Section: User Information (Name, ID, Email, Role, Department)
- [x] 3.4 สร้าง Section: Target Resource (Object Type, Record ID) — แสดง "N/A" หากไม่มี
- [x] 3.5 สร้าง Section: Change History (Before/After JSON Side-by-side บน Desktop, Stacked บน Mobile)
- [x] 3.6 สร้าง Section: Request Information (IP, User Agent, Browser, OS, Device, Session ID, Request ID, Endpoint, HTTP Method)
- [x] 3.7 สร้าง Section: Additional Information (Error Message สีแดงถ้า Failed, Auth Method, Duration, Correlation ID)

## 4. UI — Copy Functionality

- [x] 4.1 เพิ่มปุ่ม Copy บนแต่ละ field value ใน Detail Drawer
- [x] 4.2 ใช้ `navigator.clipboard.writeText()` + checkmark icon feedback 1.5 วินาที
- [x] 4.3 เพิ่มปุ่ม Copy บน Before/After JSON blocks

## 5. UI — N/A Handling

- [x] 5.1 แสดง "N/A" badge (gray background) สำหรับ fields ที่ไม่มีข้อมูล
- [x] 5.2 Change History: หากไม่มี oldValue/newValue → แสดง "N/A — No data changes"
- [x] 5.3 Additional Info section: แสดงเฉพาะเมื่อมีข้อมูล (Error Message เฉพาะ Failed, Duration ถ้ามี)

## 6. Responsive Design

- [x] 6.1 Desktop (≥1024px): Side-by-side Before/After (50/50)
- [x] 6.2 Tablet (768-1023px): Side-by-side Before/After (50/50)
- [x] 6.3 Mobile (<768px): Stacked Before/After + Drawer full-width

## 7. Testing & Verification

- [x] 7.1 ทดสอบ: เปิด Detail Drawer → ทุก Section แสดงข้อมูลถูกต้อง
- [x] 7.2 ทดสอบ: Login event → Change History แสดง "N/A"
- [x] 7.3 ทดสอบ: Config Update event → Before/After JSON แสดงพร้อม Syntax Highlight
- [x] 7.4 ทดสอบ: Copy button → คัดลอกค่าถูกต้อง + checkmark feedback
- [x] 7.5 ทดสอบ: Collapse/Expand บน JSON ขนาดใหญ่
- [x] 7.6 ทดสอบ: Responsive — Side-by-side บน Desktop, Stacked บน Mobile

