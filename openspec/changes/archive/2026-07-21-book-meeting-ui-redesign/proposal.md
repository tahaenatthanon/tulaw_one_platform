## Why

หน้า Book Meeting ปัจจุบัน UI ยังดูธรรมดา — การ์ดห้องประชุมเป็นแบบตาราง, Schedule tab เป็นตาราง grid พื้นฐาน, ไม่มีปฏิทินเลือกวันที่แบบ visual, ไม่มี right sidebar แสดง upcoming bookings และระยะห่าง (spacing) ไม่เท่ากับหน้าอื่น ต้องการยกระดับ UI ให้ดูเป็นมืออาชีพ สวยงาม ใช้งานง่ายขึ้น และระยะห่างสอดคล้องกับหน้าอื่นๆ (dashboard) โดยยังคง tab layout เดิม (rooms, schedule, my-bookings, pending, history)

## What Changes

- แทนที่ `RoomsTab` เดิมด้วย `RoomCard` component ใหม่ — การ์ดสวยงาม มี gradient banner, status badge, อุปกรณ์, ปุ่มจอง
- **Schedule tab ใช้ตารางเวลาแบบเก่า (grid ตาราง):** แถว = ห้อง, คอลัมน์ = เวลา (08:00-17:00 รายชั่วโมง), booking block แสดงชื่อการจอง — ไม่ใช้ timeline แนวตั้ง
- เพิ่มปฏิทินเลือกวันที่ด้านบนตารางเวลา (เลื่อนวันซ้าย/ขวา, แสดงวันเดือนปีภาษาไทย)
- **Tab selector ใช้รูปแบบมาตรฐาน UI 5 view ของ dashboard** ตาม claude.md section 5.4a: `flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5`
- **ระยะห่างทุก section ใช้ `space-y-6` + `mt-8` เท่ากับหน้า dashboard**
- เพิ่ม stat cards (ห้องทั้งหมด, ห้องว่างวันนี้, การจองวันนี้, การจองของฉัน) เหนือส่วน rooms
- เพิ่ม `SearchFilterBar` สำหรับค้นหาและกรองห้อง (อาคาร, ความจุ, สถานะ)
- เพิ่ม right sidebar component `UpcomingBookings` — แสดงรายการจองที่กำลังจะถึง
- แทนที่ modal จอง/แก้ไข ด้วย `CreateBookingDialog` แบบ Dialog สวยงาม พร้อมฟอร์มครบถ้วน
- แทนที่ปุ่มแก้ไข/ยกเลิก ด้วย `BookingDetailSheet` — แสดงรายละเอียดการจองแบบ Sheet
- เพิ่ม `EmptyState` component สำหรับกรณีไม่พบผลลัพธ์
- **ตารางเวลาแสดงหัวข้อการจองตรงกลางช่วงเวลา:** เวลาแสดงแบบ "08:00 - 08:30", หัวข้อการจองจัดกึ่งกลางตามจำนวนช่องที่จอง
- **ปุ่มสร้างการจองเปลี่ยนชื่อเป็น "จองห้องประชุม"**
- **สถานะห้องประชุมอัปเดตเมื่ออนุมัติเท่านั้น:** การจองที่ยัง `pending` ไม่ทำให้ห้องเปลี่ยนสถานะ — ห้องยังคง "ว่าง" จนกว่าจะได้รับการอนุมัติ
- **คง tab layout เดิม**: rooms, schedule, my-bookings, pending, history
- **คง API endpoints เดิม**: `/api/book-meeting`, `/api/book-meeting/rooms`
- ข้อมูลทั้งหมดดึงจาก API จริง (ไม่ใช้ mock data)

## Capabilities

### New Capabilities
- `book-meeting-ui-components`: ระบบ UI Components ใหม่สำหรับ Book Meeting — RoomCard, BookingCalendar, UpcomingBookings, SearchFilterBar, CreateBookingDialog, BookingDetailSheet, EmptyState, StatCard — ทั้งหมดเชื่อมต่อกับ API จริง

### Modified Capabilities
- `book-meeting-history`: ปรับ requirement เดิมที่ใช้ BookingsList แสดง history → ใช้ BookingDetailSheet แสดงรายละเอียด + UpcomingBookings

## Impact

- **`app/(dashboard)/book-meeting/page.tsx`**: เปลี่ยนโครงสร้างหลัก — ใช้ components ใหม่แทน RoomsTab/ScheduleTab/BookingsList เดิม
- **`app/(dashboard)/book-meeting/`** (ใหม่): components ย่อย — `room-card.tsx`, `booking-calendar.tsx`, `upcoming-bookings.tsx`, `search-filter-bar.tsx`, `create-booking-dialog.tsx`, `booking-detail-sheet.tsx`, `empty-state.tsx`
- **`components/tulaw/stat-card.tsx`** (อาจมีอยู่แล้ว): ใช้สำหรับแสดงสถิติ
- **API**: ไม่เปลี่ยนแปลง — ใช้ `/api/book-meeting` และ `/api/book-meeting/rooms` เดิม
- **UI**: ใช้ shadcn/ui components (`Dialog`, `Sheet`, `Select`, `Input`, `Textarea`, `Label`) ที่มีอยู่แล้ว
- **Library**: ใช้ `lucide-react` icons เท่านั้น
