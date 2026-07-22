## Context

โมดูล Book Meeting มีการใช้งานจริงและพบปัญหา 4 จุดที่ต้องแก้ไข:

1. **History tab scope ไม่ถูกต้อง**: `UpcomingBookings` component ใน `type="history"` กรองเฉพาะ status (`completed` หรือ `confirmed` ที่ past) แต่ไม่ได้ scope ตาม userId ทำให้ผู้ใช้ระดับ User เห็นประวัติของผู้อื่น — ขัดกับ spec `book-meeting-history`
2. **Pending tab ไม่ refresh**: เมื่อ user สร้าง booking ใหม่ด้วย status `pending` แล้ว `mutateBookings()` ถูกเรียก, SWR re-fetch จาก API — แต่เนื่องจาก GET `/api/book-meeting` ไม่มีการ scope ตาม role อาจทำให้ข้อมูลที่ได้ไม่ตรง หรือ optimistic update ใน UI ทำให้เกิด race condition
3. **Conflict error ไม่แสดงผล**: เดิมข้อผิดพลาดเวลาซ้ำซ้อนถูก `console.error` อย่างเดียว ผู้ใช้ไม่เห็น — แก้ไขแล้วด้วย toast แต่ spec ต้องการให้แสดง inline ใน dialog
4. **History แสดงเป็น list view อ่านยาก**: ปัจจุบันแท็บประวัติใช้ `UpcomingBookings` component (list) แบบเดียวกับแท็บอื่น — ไม่เหมาะสมกับข้อมูลประวัติที่มีจำนวนมาก ควรใช้ตารางเพื่อให้เห็นข้อมูลสำคัญครบ (timestamp, หัวข้อ, ห้อง, จำนวน, รายละเอียด, ช่วงเวลา, ผู้จอง)

## Goals / Non-Goals

**Goals:**
- แท็บ "ประวัติ" แสดงเฉพาะ booking ของ user ปัจจุบัน สำหรับบทบาท User (level 30)
- แท็บ "ประวัติ" แสดงผลเป็นตาราง (Table View) เรียงตามวันเวลาล่าสุดก่อน
- แท็บ "รออนุมัติ" แสดง booking ใหม่ที่มี status `pending` ทันทีหลังสร้าง โดย approver เห็นทั้งหมด
- ข้อผิดพลาดเวลาซ้ำซ้อนแสดง inline ใน CreateBookingDialog โดยไม่ปิด dialog

**Non-Goals:**
- ไม่เปลี่ยนแปลง logic การตรวจสอบเวลาซ้ำซ้อนฝั่ง API (ทำงานถูกต้องแล้ว)
- ไม่เพิ่ม header/filter ใหม่ในหน้า Book Meeting
- ไม่เปลี่ยนโมเดลข้อมูลหรือ Prisma schema
- ไม่เปลี่ยนการแสดงผลของ tab อื่น (rooms, schedule, my-bookings, pending) — ยังใช้ UpcomingBookings (list) ตามเดิม

## Decisions

### 1. History scope: แก้ที่ client-side filter

**ตัดสินใจ**: เพิ่มการกรอง `userId` ใน `UpcomingBookings` สำหรับ `type="history"` โดยอิง role level

**เหตุผล**: 
- Spec `book-meeting-history` ระบุ behavior นี้ไว้แล้ว — เป็นการ implement ให้ตรง spec ไม่ใช่ feature ใหม่
- ข้อมูลทั้งหมดถูก fetch มาแล้วจาก API (ไม่ใช่ performance concern เพราะ bookings มีจำนวนไม่มาก)
- API GET ไม่ต้องเปลี่ยน — ลดความซับซ้อนและไม่กระทบ module อื่นที่ใช้ endpoint เดียวกัน

**Alternatives considered**:
- เพิ่ม scope ใน API GET → ไม่เลือก เพราะกระทบทุก consumer และต้องเปลี่ยน contract

### 2. Pending tab: mutateBookings() + เปลี่ยน flow handleCreate ให้ไม่ optimistic

**ตัดสินใจ**: ใน `handleCreate` และ `handleUpdate` เรียก `mutateBookings()` **หลัง** API สำเร็จเท่านั้น (ไม่ใช้ optimistic update) — ทำให้ข้อมูลใน UI ตรงกับ DB เสมอ และ approver เห็น booking ใหม่ในแท็บ "รออนุมัติ" ทันที

**เหตุผล**:
- ลด race condition ระหว่าง optimistic update กับ SWR re-fetch
- หลัง API สำเร็จ → mutate → UI refresh → booking ใหม่โผล่ใน pending

**Alternatives considered**:
- optimistic update + revalidate → ไม่เลือก เพราะอาจทำให้ UI แสดงสถานะผิดชั่วคราวและเกิดความสับสน

### 3. Conflict error: แสดง inline ใน dialog (แทน toast)

**ตัดสินใจ**: ใช้ `conflict` state ที่มีอยู่แล้วใน `CreateBookingDialog` เป็นกลไกหลัก — ข้อความ error จาก API (ถ้าเป็น conflict/time overlap) จะถูก set เข้า `conflict` state เพื่อแสดง inline แทนการ throw

**เหตุผล**:
- `CreateBookingDialog` มี `conflict` state และ inline error UI อยู่แล้ว (`AlertTriangle` + ข้อความสีแดง)
- ลดการพึ่งพา toast สำหรับ error ที่ผู้ใช้ต้องแก้ไขใน dialog
- Toast ใช้สำหรับ success/generic error เท่านั้น

**Alternatives considered**:
- Toast only → ไม่เลือก เพราะ dialog ปิดแล้วผู้ใช้ต้องเปิดใหม่
- Toast + inline → redundant, เลือก inline เพราะ user อยู่ใน dialog อยู่แล้ว

### 4. History table view: สร้าง HistoryTable component แยก

**ตัดสินใจ**: สร้าง `HistoryTable` component ใหม่แยกจาก `UpcomingBookings` สำหรับแท็บประวัติโดยเฉพาะ — แสดงเป็นตาราง HTML `<table>` พร้อมคอลัมน์: วัน/เวลา (timestamp), หัวข้อ, ห้อง, จำนวนคน, รายละเอียด, ช่วงเวลา (start–end), ผู้จอง

**เหตุผล**:
- `UpcomingBookings` ถูกออกแบบเป็น list view สำหรับ upcoming/pending/my-bookings — ไม่เหมาะกับ history ที่มีข้อมูลจำนวนมากและต้องการสแกนข้อมูลเร็ว
- ตารางช่วยให้เห็นข้อมูลสำคัญครบใน glance เดียว โดยไม่ต้องคลิกดูรายละเอียด
- แยก component ชัดเจน — ไม่กระทบ tab อื่น (rooms, schedule, my-bookings, pending)
- ใช้ semantic `<table>` รองรับ accessibility และ responsive ด้วย `overflow-x-auto`

**คอลัมน์ตาราง**:
| คอลัมน์ | Source field | รูปแบบ |
|---|---|---|
| วัน/เวลา | `date` + `startTime` | `22 ก.ค. 2569, 09:00` |
| หัวข้อ | `title` | text |
| ห้อง | `rooms.find(r => r.id === roomId)?.name` | text |
| จำนวน | `attendeeCount` | `10 คน` |
| รายละเอียด | `notes` / `purpose` | text (truncate) |
| ช่วงเวลา | `startTime` – `endTime` | `09:00 – 12:00` |
| ผู้จอง | `bookerName` | text |

**Alternatives considered**:
- ใช้ `UpcomingBookings` เดิมแล้วเพิ่ม view toggle → ไม่เลือก เพราะ component ซับซ้อนเกินและกระทบ tab อื่น
- ใช้ DataTable library → ไม่เลือก เพราะ overkill กับข้อมูลที่ไม่ต้อง sort/filter ซับซ้อน

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| เปลี่ยน history filter อาจกระทบการแสดงผลของ tab "my-bookings" | ตรวจสอบว่า filter แยกกันอิสระ — `my-bookings` ใช้ `userId === currentUserId` อยู่แล้ว |
| `handleCreate` ไม่ใช้ optimistic update → อาจรู้สึกช้าลง | API response < 500ms (local) — acceptable trade-off สำหรับความถูกต้องของข้อมูล |
| Conflict inline error อาจมีกรณีที่ error ไม่ใช่ conflict → user ไม่เห็น error | เพิ่ม fallback: ถ้าไม่ใช่ conflict error ให้ใช้ toast |
| HistoryTable component ใหม่ เพิ่มไฟล์ใน book-meeting/ | แยก component ชัดเจน ไม่กระทบ existing — `UpcomingBookings` ยังคงใช้ใน tab อื่นไม่เปลี่ยนแปลง |
