## Context

Intranet page redesign with tabs, subscribe, filters, announcement cards, monthly calendar, and department contacts.

## Goals / Non-Goals

**Goals:**
- 3 tabs: ประกาศ, ปฏิทิน, ติดต่อหน่วยงาน
- Org stats below page description
- Subscribe bar (multi-select category pills)
- Filter bar (category count buttons)
- Announcement cards with icon, title, category, date
- Create announcement modal with dropdown
- Monthly calendar with 5 event types color-coded
- Department contact cards
- All data is mock/sample

**Non-Goals:**
- ไม่ใช้ API จริง (mock data)

## Decisions

1. **All in one file** — ใช้ component ย่อยภายในไฟล์เดียวกันเพื่อความง่าย
2. **Mock data** — ประกาศ 5 รายการ, events 5 ประเภท, หน่วยงาน 6 แห่ง
3. **Calendar** — static July 2568, 5 category colors
