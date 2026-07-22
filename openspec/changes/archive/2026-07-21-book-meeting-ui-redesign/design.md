## Context

หน้า Book Meeting ปัจจุบัน (`app/(dashboard)/book-meeting/page.tsx`) มี 5 tabs — rooms, schedule, my-bookings, pending, history — โดยแต่ละ tab มี UI พื้นฐาน: การ์ดห้องเป็น div ธรรมดา, schedule เป็นตาราง grid, booking list เป็น list ข้อความ ทั้งหมดทำงานด้วย API จริงผ่าน SWR (`/api/book-meeting`, `/api/book-meeting/rooms`)

มี design ใหม่ที่แนบมาในรูปแบบ React components — `RoomCard`, `BookingCalendar`, `UpcomingBookings`, `SearchFilterBar`, `CreateBookingDialog`, `BookingDetailSheet`, `EmptyState` — ใช้ shadcn/ui components และ lucide-react icons ทั้งหมด

## Goals / Non-Goals

**Goals:**
- แทนที่ UI เดิมด้วย components ใหม่ทั้งหมด โดยคง tab layout ไว้
- เชื่อมต่อ components ใหม่กับ API จริง (ไม่ใช้ mock data)
- แยก components เป็นไฟล์เดี่ยวๆ ใน `app/(dashboard)/book-meeting/`
- ใช้ shadcn/ui + lucide-react + tailwind เท่านั้น
- รักษาฟังก์ชันเดิม: จอง, อนุมัติ, ยกเลิก, แก้ไข

**Non-Goals:**
- ไม่เปลี่ยน API endpoints
- ไม่เปลี่ยน data model หรือ Prisma schema
- ไม่เปลี่ยน permission logic (BOOK_MEETING_VIEW/CREATE/APPROVE)
- ไม่เพิ่ม dependencies ใหม่
- ไม่ลบ tabs เดิม — rooms, schedule, my-bookings, pending, history อยู่ครบ

## Decisions

### 1. Component Structure — หนึ่ง Component ต่อไฟล์

**เลือก:** สร้างไฟล์แยกใน `app/(dashboard)/book-meeting/`:
```
book-meeting/
├── page.tsx                        ← main page (tabs + state management)
├── room-card.tsx                   ← RoomCard
├── schedule-table.tsx              ← ScheduleTable (ตาราง grid แบบเก่า + วันที่)
├── upcoming-bookings.tsx           ← UpcomingBookings
├── search-filter-bar.tsx           ← SearchFilterBar
├── create-booking-dialog.tsx       ← CreateBookingDialog
├── booking-detail-sheet.tsx        ← BookingDetailSheet
└── empty-state.tsx                 ← EmptyState
```

**เหตุผล:** แต่ละ component รับผิดชอบ UI เดียว — แก้ไขง่าย, test ง่าย, reuse ได้

### 2. Data Flow — SWR + Props

**เลือก:** ใช้ SWR เหมือนเดิมในการ fetch ข้อมูลจาก API → ส่งผ่าน props ลง components

```tsx
// page.tsx
const { data: apiBookings } = useSWR("/api/book-meeting", swrFetcher);
const { data: apiRooms } = useSWR("/api/book-meeting/rooms", swrFetcher);

<ScheduleTable bookings={bookings} rooms={rooms} onSelectBooking={openDetail} />
<UpcomingBookings bookings={bookings} onSelect={openDetail} />
```

**เหตุผล:** คง pattern เดิม — ไม่ต้องเปลี่ยน API, SWR จัดการ cache/revalidation ให้

### 3. Tab Layout — ใช้มาตรฐาน UI 5 view ของ dashboard

**เลือก:** Tab selector ใช้รูปแบบจาก claude.md section 5.4a: `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`

- Active: `bg-tu-primary text-white shadow-sm`
- Inactive: `text-tu-text-secondary`
- ใช้ `useUrlState<TabId>("tab", "rooms")` sync กับ URL

### 4. Spacing — เท่ากับหน้า dashboard

**เลือก:** ใช้ wrapper `className="p-6 space-y-6"` และระยะห่างระหว่าง section เป็น `mt-8` (เท่ากับ dashboard)

### 5. Schedule Tab — ตาราง grid แบบเก่า

**เลือก:** ใช้ตารางแนวนอน (grid table) — แถว = ห้อง, คอลัมน์ = เวลา 08:00-17:00 รายชั่วโมง, แสดง booking เป็นบล็อกสีใน cell — **ไม่ใช้** timeline แนวตั้ง

**เหตุผล:** ผู้ใช้ต้องการรูปแบบเดิมที่คุ้นเคย

### 6. CreateBookingDialog — shadcn/ui Dialog

**เลือก:** ใช้ `<Dialog>` จาก shadcn/ui สำหรับฟอร์มสร้าง/แก้ไขการจอง

**เหตุผล:** UI สวย, มี backdrop, มี focus trap, responsive — ดีกว่า modal แบบ manual div

### 7. Room Status — อัปเดตเมื่ออนุมัติเท่านั้น

**เลือก:** `/api/book-meeting/rooms` ตรวจสอบเฉพาะ `status: "confirmed"` — การจองที่ `pending` ไม่ทำให้ห้องเปลี่ยนสถานะ

**เหตุผล:** ผู้ใช้กดจองแล้วห้องยังว่างอยู่จนกว่า admin จะอนุมัติ — ป้องกันการจองซ้ำซ้อน

### 8. Schedule Time Labels — Range Format

**เลือก:** แสดงเวลาเป็นช่วง "08:00 - 08:30" แทน "08:00" อย่างเดียว

**เหตุผล:** อ่านง่ายขึ้น — ผู้ใช้เห็นช่วงเวลาเลยไม่ต้องคิดเอง

### 9. Booking Title — Centered

**เลือก:** ใช้ CSS `gridColumn: span N` เพื่อให้หัวข้อการจองอยู่กึ่งกลางตลอดช่วงเวลาที่จอง

## Risks / Trade-offs

- **[Risk] ตาราง grid อาจ overflow ในมือถือ** → Mitigation: ใช้ `overflow-auto` และ `min-w-[800px]`
- **[Risk] Thai locale บน Vercel อาจไม่มี** → Mitigation: ใช้ hardcoded arrays (`THAI_MONTHS`, `THAI_DOW`) แทน `Intl`
