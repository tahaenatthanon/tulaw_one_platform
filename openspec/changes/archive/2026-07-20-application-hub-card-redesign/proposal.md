## Why

หน้า Application Hub มี UI Card ที่ล้าสมัยเมื่อเทียบกับหน้า Dashboard และ Intranet ที่เพิ่ง redesign ไปแล้ว ต้องการปรับให้เป็นแนวทางเดียวกัน — ใช้ StatCard รูปแบบใหม่, ลบ userCount, ปรับ tab selector, ทำให้ระบบดูทันสมัยและ consistent

## What Changes

- เปลี่ยน Stat Cards เป็นรูปแบบเดียวกับหน้า Intranet/Dashboard (icon ขวา, ตัวเลขใหญ่, ไม่มี sub-text)
- ลบจำนวน user (userCount) ออกจาก AppGroup และ AppCard
- เปลี่ยน "Active Users" stat เป็น "อัตราออนไลน์" (เปอร์เซ็นต์)
- ปรับ Grid/List toggle เป็นรูปแบบเดียวกับ Dashboard view selector (`inline-flex p-1 rounded-xl bg-tu-bg/70`)
- เปลี่ยน Card Design: `rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02]`
- Grid card: เอา user count ออก, เหลือ icon + ชื่อ + description + status
- List card: status ย้ายไปขวาสุด, เอา user count ออก

## Capabilities

### New Capabilities

- `application-hub-card-ui`: ปรับ UI Card และ Stats ของ Application Hub ให้ทันสมัย consistent กับทั้งแพลตฟอร์ม

### Modified Capabilities

ไม่มี

## Impact

- **แก้ไข:** `app/(dashboard)/application-hub/page.tsx` (StatCard component, AppCard, AppGroup interface, stat data, tab selector)
- **API:** ไม่แก้ไข
- **Database:** ไม่แก้ไข
