## Context

Sidebar มี 2 `NavItem[]` arrays: `platformNav` (6 items) และ `adminNav` (3 items) เปลี่ยนเฉพาะ `label` property จากภาษาไทยเป็นภาษาอังกฤษ คง `href`, `icon`, `permission`, `roles` ไว้เหมือนเดิม

## Goals / Non-Goals

**Goals:**
- เปลี่ยน label ทั้ง 9 รายการเป็นภาษาอังกฤษ

**Non-Goals:**
- ไม่เปลี่ยน path, icon, permission, หรือ roles
- ไม่เปลี่ยนลำดับเมนู

## Decisions

1. **Map labels ตรงตามที่กำหนด**
   - แดชบอร์ด → Dashboard
   - ศูนย์กลางแอปพลิเคชัน → Application Hub
   - อินทราเน็ต → Intranet
   - จองห้องประชุม → Book Meeting
   - เอกสาร → Document
   - โครงการ → Projects
   - ผู้ใช้งานและสิทธิ์ → Users & Roles
   - บันทึกความปลอดภัย → Audit Log
   - ตั้งค่าระบบ → System Config

## Risks / Trade-offs

- **[Risk]**: ผู้ใช้ที่คุ้นเคยกับภาษาไทยอาจสับสน → **Mitigation**: icon และตำแหน่งยังเหมือนเดิม
