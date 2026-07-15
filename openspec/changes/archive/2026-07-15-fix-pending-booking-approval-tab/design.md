## Context

หลัง `fix-book-meeting-booking` ระบบจองห้องประชุมมี approval workflow แล้ว: ผู้ใช้สร้าง booking → status `"pending"` → Admin/Dean ยืนยัน → status `"confirmed"`

แต่แท็บ "รออนุมัติ" ถูก gate ด้วย `canApprove` (`BOOK_MEETING_APPROVE`) ทำให้ผู้ใช้ทั่วไป (User role) กดแท็บแล้วเห็นหน้าว่าง — ไม่รู้ว่าการจองของตัวเองรออนุมัติอยู่

## Goals / Non-Goals

**Goals:**
- แท็บ "รออนุมัติ" แสดงผลสำหรับทุกบทบาท
- ผู้ใช้ทั่วไปเห็นเฉพาะ pending bookings ของตัวเอง
- Admin/Dean เห็น pending bookings ทั้งหมด (เหมือนเดิม)
- เมื่ออนุมัติแล้ว refresh ทุก view รวมถึงตารางเวลา (schedule tab)

**Non-Goals:**
- ไม่เปลี่ยน permission ของปุ่มยืนยัน (ยัง gate ด้วย `BOOK_MEETING_APPROVE` เหมือนเดิม)
- ไม่เปลี่ยน API หรือ database schema

## Decisions

### Decision 1: เปลี่ยน logic ฝั่ง client-only ไม่แก้ API

**เลือก:** แก้ไขเฉพาะ `page.tsx` ฝั่ง frontend โดยเปลี่ยน condition การแสดงผลแท็บ pending

**เหตุผล:** API ไม่จำเป็นต้องเปลี่ยน — `GET /api/book-meeting` ส่ง bookings ทั้งหมดที่มี status ไม่ใช่ cancelled อยู่แล้ว ฝั่ง client แค่เปลี่ยนการ filter ตาม permission
- ส่วนการอัปเดตตารางเวลา: `mutateBookings()` ที่ถูกเรียกหลัง `handleConfirm` จะ re-fetch ข้อมูลทั้งหมด ทำให้ทุก tab (รวม `ScheduleTab` และ `BookingsList` ทุกประเภท) ได้รับข้อมูลใหม่โดยอัตโนมัติผ่าน SWR

### Decision 2: แยก filter ตาม permission

```typescript
// เดิม
{activeTab === "pending" && canApprove && <BookingsList ... type="pending" />}

// ใหม่
{activeTab === "pending" && (
  <BookingsList
    type="pending"
    filterByUser={!canApprove ? currentUserId : undefined}
  />
)}
```

**เหตุผล:** ใช้ `BookingsList` component เดิม โดยเพิ่ม prop `filterByUser` เพื่อกรองตาม userId เมื่อผู้ใช้ไม่มีสิทธิ์อนุมัติ

### Decision 3: เพิ่ม `filterByUser` prop ใน `BookingsList`

**เลือก:** เพิ่ม optional prop แทนการเปลี่ยน type logic

**เหตุผล:** 
- `type="pending"` logic เดิม filter `b.status === "pending"` — ยังใช้ได้
- เพิ่ม `filterByUser` เพื่อกรองซ้อนอีกชั้นเมื่อจำเป็น
- ไม่กระทบ tab อื่น (`my-bookings`, `history`)

### Decision 4: ซ่อนทุกปุ่มบน pending tab สำหรับผู้ใช้ที่ไม่มีสิทธิ์อนุมัติ

**เลือก:** เมื่อ `type === "pending"` และ `!canApprove` → ไม่แสดงปุ่มใดๆ เลย (ไม่มีทั้งยืนยันและยกเลิก)

```tsx
// ปุ่มจะแสดงเฉพาะ:
// - my-bookings tab (ทุกคน)
// - pending tab + canApprove (เฉพาะ approver)
{((type === "my-bookings") || (type === "pending" && canApprove)) && (
  <div className="flex gap-1.5">
    /* confirm + cancel buttons */
  </div>
)}
```

**เหตุผล:**
- ผู้ใช้ทั่วไปควรเห็นสถานะเฉยๆ โดยไม่ต้องกังวลว่าจะกดผิด
- การยกเลิกสำหรับ User ทำได้จากแท็บ "การจองของฉัน" อยู่แล้ว
- ลดความซับซ้อนของ UI

### Decision 5: สร้าง Notification เมื่ออนุมัติ booking

**เลือก:** ใน `PUT /api/book-meeting` เมื่อ `status === "confirmed"` → สร้าง Notification + NotificationRead ให้ผู้จอง

**Pattern:** ตามรูปแบบเดียวกับ `app/api/announcements/route.ts`:
1. `prisma.notification.create()` — สร้าง notification 1 record
2. `prisma.notificationRead.createMany()` — link ไปยัง userId ของผู้จอง

```typescript
// ใน PUT handler หลังจาก update status เป็น "confirmed"
if (status === "confirmed") {
  const booking = await prisma.roomBooking.findUnique({ where: { id }, select: { userId: true, title: true } });
  if (booking) {
    const notif = await prisma.notification.create({
      data: {
        title: "การจองห้องประชุมได้รับการอนุมัติ",
        message: `การจอง "${booking.title}" ของคุณได้รับการอนุมัติแล้ว`,
        actionUrl: "/book-meeting?tab=my-bookings",
        createdBy: session.user.id,
      },
    });
    await prisma.notificationRead.createMany({
      data: [{ notificationId: notif.id, userId: booking.userId, isRead: false }],
    });
  }
}
```

**เหตุผล:**
- ผู้จองต้องรู้ทันทีว่าได้รับการอนุมัติ
- ใช้ infrastructure ที่มีอยู่แล้ว (Notification + NotificationRead models)
- Follow pattern เดียวกับ announcements

## Risks / Trade-offs

- [Low] ถ้า `currentUserId` เป็น `undefined` หรือ null → `filterByUser` จะไม่กรอง แสดงทั้งหมด (fallback เป็นพฤติกรรมเดิมของ approver)
- [Low] Notification ใช้ `prisma` query เพิ่ม 2 queries ต่อการอนุมัติ 1 ครั้ง → ไม่กระทบ performance (อนุมัติไม่ใช่ high-frequency operation)
- [Low] ถ้า Notification สร้างไม่สำเร็จ → booking ยังได้รับการยืนยัน (notification เป็น best-effort ไม่ rollback)
