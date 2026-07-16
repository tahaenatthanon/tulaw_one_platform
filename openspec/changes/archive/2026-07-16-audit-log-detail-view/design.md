## Context

`GET /api/audit-logs/[id]` คืนข้อมูลพื้นฐาน: id, timestamp, user name/email/department, module, action, entityType, entityId, oldValue, newValue, ipAddress, browser, device, userAgent, isSuccess, statusCode

UI Detail Drawer ปัจจุบัน: Flat list (`DetailRow` component ซ้ำๆ) — ไม่มีการจัดกลุ่ม, ไม่มี JSON formatting, ไม่มี Copy, ไม่มี Collapse

## Goals / Non-Goals

**Goals:**
- ขยาย API response ให้คืนข้อมูลครบ 6 Sections
- ออกแบบ Detail Drawer ใหม่แบบ Section-based layout
- Change History: Side-by-side Before/After JSON พร้อม Syntax Highlight
- Copy button สำหรับแต่ละ value
- Collapse/Expand สำหรับ JSON ขนาดใหญ่
- Responsive: Side-by-side บน Desktop, Stacked บน Mobile

**Non-Goals:**
- ไม่เปลี่ยน schema หรือ AuditLog table
- ไม่เพิ่ม fields ใหม่ใน AuditLog (ใช้ของที่มีอยู่ + computed)
- ไม่ implement real-time update ของ detail

## Decisions

### 1. Computed Fields in API Response

**เลือก:** API handler คำนวณ computed fields (OS จาก userAgent, role จาก userRoles) ใน response ไม่ได้เพิ่ม column ใน DB
**กลไก:**
```ts
const os = detectOS(log.userAgent);        // Windows/macOS/Linux/iOS/Android
const browser = detectBrowser(log.userAgent); // Chrome/Firefox/Safari/Edge
const role = log.user?.userRoles?.[0]?.role?.nameTh ?? "N/A";
const authMethod = log.user?.authSource === "local" ? "Local" : "LDAP";
```
**เหตุผล:** ไม่ต้อง migrate DB, ข้อมูลคำนวณได้จาก fields ที่มีอยู่

### 2. Drawer Size: Large (640px)

**เลือก:** `w-full sm:w-[480px] lg:w-[640px]` — กว้างกว่า Drawer ทั่วไป (440px)
**เหตุผล:** รองรับ Side-by-side Before/After JSON

### 3. JSON Syntax Highlight

**เลือก:** `JSON.stringify(obj, null, 2)` + CSS classes สำหรับ key/string/number/boolean/null
**การแสดงผล:**
```css
.json-key { color: #2563EB; }   /* blue */
.json-string { color: #16A34A; } /* green */
.json-number { color: #DC2626; } /* red */
.json-boolean { color: #7C3AED; } /* purple */
.json-null { color: #6B7280; }  /* gray */
```
**เหตุผล:** ไม่ต้องเพิ่ม library — syntax highlight พื้นฐานด้วย CSS + regex

### 4. Section Structuring

```tsx
interface AuditDetail {
  // General
  logId: string; timestamp: string; eventType: string; module: string; action: string; status: string;
  // User
  userId: string; userName: string; email: string; role: string; department: string;
  // Target Resource
  objectType: string; recordId: string;
  // Change History
  beforeValue: string | null; afterValue: string | null;
  // Request
  ipAddress: string; userAgent: string; browser: string; os: string; device: string; sessionId: string; requestId: string; apiEndpoint: string; httpMethod: string;
  // Additional
  errorMessage: string | null; authMethod: string; duration: number | null; correlationId: string | null;
}
```

### 5. UX: Copy, Collapse, N/A

- **Copy:** `navigator.clipboard.writeText(value)` + check icon feedback
- **Collapse/Expand:** `useState<boolean>` per JSON block for `max-h-32 overflow-hidden` toggle
- **N/A:** แสดง "N/A" badge สีเทาสำหรับ fields ที่ไม่มีข้อมูล

## Risks / Trade-offs

- **JSON size:** Before/After อาจใหญ่มาก → จำกัด display height 200px + scroll + collapse
- **Performance:** `JSON.stringify` + regex highlight ทุก render → ใช้ `useMemo` cache
- **Browser/OS detection:** userAgent parsing อาจไม่แม่นยำ → แสดง "Unknown" เป็น fallback
