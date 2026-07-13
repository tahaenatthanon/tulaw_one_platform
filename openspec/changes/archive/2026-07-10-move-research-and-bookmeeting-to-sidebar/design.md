## Context

ปัจจุบัน sidebar (`components/layouts/dashboard-layout.tsx`) มีรายการ `platformNav` เพียง 3 รายการ: Dashboard, Application Hub, Intranet ส่วน "งานวิจัย" (Research Management) และ "จองห้องประชุม" (Book Meeting) ถูกซ่อนเป็น sub-module ภายใต้ Application Hub เท่านั้น การจะเข้าถึงต้องคลิกผ่าน Application Hub ก่อนเสมอ

CLAUDE.md กำหนดให้ทั้ง Research Management และ Book Meeting เป็น Business Applications ระดับ platform ที่มี permission codes และ sub-modules เป็นของตัวเอง การย้ายขึ้น sidebar จะสะท้อนถึงความสำคัญของทั้งสอง module และลดจำนวนคลิกที่ผู้ใช้ต้องทำ

## Goals / Non-Goals

**Goals:**
- เพิ่มรายการ "งานวิจัย" และ "จองห้องประชุม" ใน `platformNav` ของ sidebar
- แสดง/ซ่อนรายการตาม permission code `RESEARCH_VIEW` และ `BOOK_MEETING_VIEW`
- คง backward compatibility: ทั้งสอง module ยังเข้าถึงได้จาก Application Hub
- ใช้ icon และ label ที่สอดคล้องกับ design system

**Non-Goals:**
- ไม่ย้าย module อื่นจาก Application Hub ไป sidebar
- ไม่แก้ไขโครงสร้างหรือเนื้อหาของหน้า Research Management หรือ Book Meeting
- ไม่เปลี่ยนแปลงเส้นทาง URL ของทั้งสอง module
- ไม่เพิ่ม sub-menu หรือ expand/collapse ใน sidebar

## Decisions

### 1. เพิ่มใน `platformNav` (ไม่ใช่ `adminNav`)

**เลือก**: เพิ่ม NavItem ใน `platformNav` array

**เหตุผล**: `platformNav` คือกลุ่มเมนูหลักที่ผู้ใช้ทุกคนเห็น (ตามสิทธิ์) "งานวิจัย" และ "จองห้องประชุม" เป็น Business Application ที่ผู้ใช้ทั่วไปเข้าถึงได้ ไม่ใช่ module สำหรับ admin เท่านั้น

**ทางเลือกที่พิจารณา**: สร้าง nav group แยกใหม่ — แต่จะเพิ่มความซับซ้อนให้ sidebar โดยไม่จำเป็น เพราะทั้งสอง module ไม่มี sub-module ที่ต้องแสดงใน sidebar

### 2. ใช้ permission codes ที่มีอยู่แล้ว

**เลือก**: ใช้ `RESEARCH_VIEW` และ `BOOK_MEETING_VIEW` ในการควบคุมการแสดงผล

**เหตุผล**: Permission codes เหล่านี้ถูกกำหนดไว้แล้วใน CLAUDE.md และ `useHasPermission` hook รองรับอยู่แล้ว ไม่ต้องสร้าง permission ใหม่ ลด scope ของการเปลี่ยนแปลง

**ทางเลือกที่พิจารณา**: ใช้ role-based check โดยตรง — แต่การเช็ค permission code มี granularity ดีกว่าและสอดคล้องกับ RBAC model ที่วางไว้

### 3. URL สำหรับ Research Management ใช้ `/application-hub/research-management`

**เลือก**: Research Management sidebar item ลิงก์ไปที่ `/application-hub/research-management`

**เหตุผล**: Research Management เป็นส่วนหนึ่งของ Application Hub ในเชิงโครงสร้างไฟล์ (`app/(dashboard)/application-hub/research-management/`) ไม่มีหน้า standalone ที่ `/research-management` การชี้ไปที่ path เดิมช่วยให้ไม่ต้องสร้าง route ใหม่หรือย้ายไฟล์

**ทางเลือกที่พิจารณา**: สร้าง `/research-management` เป็น route ใหม่ — แต่จะทำให้เกิด code duplication และ maintenance burden โดยไม่จำเป็น

### 4. Book Meeting ใช้ `/book-meeting` ที่มีอยู่แล้ว

**เลือก**: Book Meeting sidebar item ลิงก์ไปที่ `/book-meeting`

**เหตุผล**: Book Meeting มีหน้า standalone ที่ `/book-meeting` อยู่แล้ว (ตาม CLAUDE.md folder structure) การใช้เส้นทางนี้สอดคล้องกับโครงสร้างที่มีอยู่

### 5. ไม่ลบ module ทั้งสองออกจาก Application Hub

**เลือก**: คง Research Management และ Book Meeting ไว้ใน Application Hub

**เหตุผล**: Backward compatibility — ผู้ใช้ที่คุ้นเคยกับเส้นทางเดิมยังเข้าใช้งานได้ และบางผู้ใช้ (เช่น Viewer role) อาจไม่เห็น sidebar item ตาม permission แต่ยังเข้าใช้ผ่าน Application Hub ได้

## Risks / Trade-offs

- **[Sidebar ยาวเกินไป]** — การเพิ่ม 2 รายการทำให้ sidebar มี 5 รายการในกลุ่มหลัก (+ admin items สำหรับ admin) → **Mitigation**: ผู้ใช้สามารถ collapse sidebar ได้ (ฟีเจอร์ที่มีอยู่แล้ว), และรายการจะซ่อนตาม permission ทำให้ผู้ใช้ทั่วไปเห็นเฉพาะที่มีสิทธิ์
- **[Navigation inconsistency]** — "งานวิจัย" ใน sidebar ชี้ไป `/application-hub/research-management` ซึ่งอยู่ภายใต้ Application Hub ในเชิงโครงสร้าง → **Mitigation**: เน้นที่ UX — ผู้ใช้ไม่จำเป็นต้องรู้โครงสร้างไฟล์, และ Application Hub ยังคงทำหน้าที่เป็น directory รวม
