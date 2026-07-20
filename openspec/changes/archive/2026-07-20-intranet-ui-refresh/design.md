## Context

หน้า Intranet (`app/(dashboard)/intranet/page.tsx`) เป็น Client Component ที่ใช้ 3 Tabs (ประกาศ, ปฏิทิน, ติดต่อหน่วยงาน) ปัจจุบันมี Hero Section ขนาดใหญ่ที่ด้านบน ตามด้วย Tab Navigation และ Content การ redesign ครั้งนี้จะปรับ UI ทั้งหมดให้ทันสมัยขึ้น โดยไม่แก้ไข Business Logic, API, State Management หรือระบบหลังบ้านใดๆ

**Constraints:**
- ห้ามแก้ไข Business Logic, API, Database, Prisma, TypeScript Types, Hooks, State Management
- ห้ามแก้ไข CRUD Logic, Search, Filter, Pagination, Permissions, RBAC, Auth, Routing
- เปลี่ยนเฉพาะ UI/UX และ Layout
- ใช้ Design System (CSS variables `--tu-*`) ตามมาตรฐานของ TULAW ONE Platform

**Current State:**
- Hero Section: Welcome Banner + Header Description + Action Buttons + Organization Metrics
- Tab Navigation: ประกาศ | ปฏิทิน | ติดต่อหน่วยงาน
- Announcements Tab: Search + Category Filter + Subscribe Chips + Pinned Cards + List
- Calendar Tab: Month Grid + Upcoming Events (เลือกวันจากเลขวัน)
- Contacts Tab: Department Cards

**Reference Design:** `c:\Users\natth\Downloads\index.tsx` — UI Preview ที่ใช้เป็นแนวทาง

## Goals / Non-Goals

**Goals:**
- ลบ Hero Section ทั้งหมด เริ่มหน้าด้วย Card Statistics
- ออกแบบ Card Statistics ใหม่ (4 ใบ: ประกาศทั้งหมด, ประกาศด่วน, กิจกรรมเดือนนี้, หน่วยงาน)
- รวม Subscribe เข้ากับหน้า "ประกาศ" เป็นส่วนหนึ่งของ Tab ประกาศ
- ใช้ข้อมูลหมวดหมู่ (Category) จาก API/ระบบจริง ไม่ Hardcode
- Calendar อ้างอิง Event Date จริง (วัน/เดือน/ปี) แทนเลขวัน
- ปรับ Card Design ทั้งหมด: ประกาศ, กิจกรรม, หน่วยงาน
- ปรับ Modal Design: สร้าง/แก้ไขประกาศ, สร้าง/แก้ไขกิจกรรม
- ทุกอย่างใช้ `--tu-*` CSS variables จาก Design System

**Non-Goals:**
- ไม่เพิ่ม/ลด Tab (คง 3 Tabs: ประกาศ, ปฏิทิน, ติดต่อหน่วยงาน)
- ไม่เปลี่ยน API endpoints
- ไม่เปลี่ยน Database schema
- ไม่เพิ่มฟีเจอร์ใหม่
- ไม่เปลี่ยน Logic การคำนวณสถิติ
- ไม่เปลี่ยนระบบ Permission/RBAC

## Decisions

### 1. Component Architecture: Refactor page.tsx เป็น Sub-components

**Decision:** แยก UI ออกเป็น component ย่อยภายใน `app/(dashboard)/intranet/` หรือ `components/shared/` เพื่อให้โค้ดอ่านง่ายและ maintainable

**Components ที่จะสร้าง/ปรับปรุง:**
- `StatCards` — Card Statistics 4 ใบ
- `AnnouncementsTab` — Tab ประกาศ (รวม Subscribe, Category Filter, Announcement List)
- `CalendarTab` — Tab ปฏิทิน (Calendar Grid + Event List)
- `ContactsTab` — Tab ติดต่อหน่วยงาน (Department Cards)
- `CreateAnnouncementModal` / `EditAnnouncementModal` — Modal จัดการประกาศ
- `CreateEventModal` / `EditEventModal` — Modal จัดการกิจกรรม
- `AnnouncementCard` — Card ประกาศ (ใช้ใน List)
- `EventCard` — Card กิจกรรม
- `DepartmentCard` — Card หน่วยงาน
- `CategoryBadge` — Badge หมวดหมู่ที่ดึงข้อมูลจากระบบ
- `CalendarGrid` — Calendar Grid แสดงวันและ Events

**Rationale:** แยก component เพื่อให้แต่ละส่วนมี single responsibility จัดการง่าย และ reuse ได้

**Alternatives considered:** ใช้ component library สำเร็จรูป → ปฏิเสธ เพราะต้องควบคุม Design System เอง

### 2. Category Colors: ดึงจาก API แบบ Dynamic

**Decision:** หมวดหมู่ประกาศใช้ข้อมูลจาก API `/api/announcements/categories` (หรือ endpoint ที่มีอยู่แล้ว) แทน Hardcode `CATEGORY_COLORS` Record

**Implementation:**
- ดึงรายการหมวดหมู่จาก API พร้อม `name`, `color`
- Map สีจาก API ไปยัง badge styles (dot, text, soft background)
- รองรับกรณี API ยังไม่มี → fallback ใช้ค่าจาก `DEFAULT_ANN_CATS`

**Rationale:** รองรับการเปลี่ยนชื่อ/เพิ่ม/ลบหมวดหมู่ในอนาคต โดย UI เปลี่ยนตามข้อมูลจริง

### 3. Calendar: ใช้ Event Date จริง

**Decision:** Calendar อ้างอิง Event Date จากข้อมูลจริง (day, month, year) แทนการใช้เฉพาะ `day` number ในการ match กับ current month

**Implementation:**
- เปลี่ยน CalendarEvent type ให้มี `month` และ `year` (หรือใช้ `startDate` แบบ Date object)
- เมื่อ render calendar cell: เช็ค `eventDate.getMonth() === viewMonth && eventDate.getDate() === cellDay`
- ไม่แสดง event ที่มีเลขวันตรงกันแต่คนละเดือน

**Rationale:** ป้องกันการแสดง event ซ้ำทุกเดือน เช่น event วันที่ 15 จะแสดงเฉพาะเดือนที่มี event จริง

### 4. Merge Subscribe into Announcements Tab

**Decision:** ยุบ Subscribe section เข้ามาอยู่ใน Tab "ประกาศ" ใต้ Category Filter Chips โดยไม่ต้องมี Tab แยก

**Layout Order (Tab ประกาศ):**
1. Search Bar
2. Category Filter Chips
3. Subscribe Toggle Chips (หมวดหมู่ที่ติดตาม)
4. Pinned Announcement Cards
5. Regular Announcement List

**Rationale:** ลดความซับซ้อนของ UI รวมเรื่องประกาศไว้ที่เดียว

### 5. Layout Structure (Top to Bottom)

**Decision:**
```
[Tab Navigation: ประกาศ | ปฏิทิน | ติดต่อหน่วยงาน]
[Card Statistics: 4 ใบ]
[Tab Content]
```

ไม่มี Hero Section ด้านบนอีกต่อไป

## Risks / Trade-offs

- **[Risk] โค้ด page.tsx มีขนาดใหญ่ (~1200+ บรรทัด) →** แก้โดยแยกเป็น sub-components อยู่ใน `app/(dashboard)/intranet/_components/`
- **[Risk] การเปลี่ยน Calendar logic อาจกระทบ event display →** ทดสอบด้วย event date จริงก่อน deploy
- **[Trade-off] Category dynamic colors อาจแตกต่างจาก Hardcode เดิม →** fallback ใช้ `DEFAULT_ANN_CATS` เมื่อ API ไม่พร้อม
