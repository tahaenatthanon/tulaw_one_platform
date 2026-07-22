## 1. เธเธฒเธเธเนเธญเธกเธนเธฅเนเธฅเธฐ Permission Codes

- [x] 1.1 เน€เธเธดเนเธก `DashboardStat` model เนเธ `prisma/schema.prisma` โ€” fields: id, department, statType, month, values (JSON), updatedBy, updatedAt, unique constraint on (department, statType, month)
- [x] 1.2 เน€เธเธดเนเธก permission codes `DASHBOARD_EDIT` (level 50+) เนเธฅเธฐ `DASHBOARD_MANAGE_ACCESS` (level 80+) เนเธ `lib/permissions.ts`
- [x] 1.3 `npx prisma db push` เน€เธเธทเนเธญ sync schema

## 2. API โ€” Dashboard Stats

- [x] 2.1 เนเธเนเนเธ `GET /api/dashboard/stats` โ€” เธญเนเธฒเธ `departmentId` เธเธฒเธ JWT session โ’ เธเธฃเธญเธเธเนเธญเธกเธนเธฅเธ•เธฒเธก role + department
- [x] 2.2 Org stats: query เธเธฒเธ DB เธเธฃเธดเธ (user count, document count, active project count, today bookings)
- [x] 2.3 Weekly/Trend/Proportion/Comparison data: query เธเธฒเธ `DashboardStat` table โ’ fallback เนเธ default values เธ–เนเธฒเนเธกเนเธกเธต
- [x] 2.4 เน€เธเธดเนเธก `PUT /api/dashboard/stats` โ€” เธฃเธฑเธ `{ type, department, month, data }` โ’ validate DASHBOARD_EDIT + department scope โ’ upsert DashboardStat
- [x] 2.5 เน€เธเธดเนเธก query param `?department=it` เธฃเธญเธเธฃเธฑเธเธเธฒเธฃเธเธฃเธญเธเธ•เธฒเธกเนเธเธเธ

## 3. API โ€” Dashboard Permissions

- [x] 3.1 เธชเธฃเนเธฒเธ `GET /api/dashboard/permissions` โ€” return list of users with dashboard edit permissions
- [x] 3.2 เธชเธฃเนเธฒเธ `PUT /api/dashboard/permissions` โ€” admin เธญเธฑเธเน€เธ”เธ•เธชเธดเธ—เธเธดเนเธเธฒเธฃเนเธเนเนเธ dashboard เนเธซเน user

## 4. Frontend โ€” Role-based View Filtering

- [x] 4.1 เนเธเนเนเธ `page.tsx` โ€” เนเธเน `useHasMinRoleLevel()` เธเธณเธซเธเธ” `visibleViews` เธ•เธฒเธก role
- [x] 4.2 Viewer (level 10): เนเธชเธ”เธ Overview, Weekly เน€เธ—เนเธฒเธเธฑเนเธ
- [x] 4.3 User (level 30): เนเธชเธ”เธ Overview, Weekly, Proportion
- [x] 4.4 Dept Admin (level 50): เนเธชเธ”เธ Overview, Weekly, Trend, Proportion
- [x] 4.5 Dean+ (level 70+): เนเธชเธ”เธเธ—เธฑเนเธ 5 views
- [x] 4.6 Department tabs โ€” เธเธฃเธญเธเธ•เธฒเธก role (Dept Admin เน€เธซเนเธเน€เธเธเธฒเธฐเนเธเธเธเธ•เธฑเธงเน€เธญเธ)

## 5. Frontend โ€” Department Context

- [x] 5.1 เธชเนเธ `department` query param เนเธ `/api/dashboard/stats` เน€เธกเธทเนเธญเน€เธฅเธทเธญเธเนเธเธเธ
- [x] 5.2 Dept Admin: department selector lock เน€เธเนเธเนเธเธเธเธ•เธฑเธงเน€เธญเธ
- [x] 5.3 Dean+: เน€เธฅเธทเธญเธเนเธเธเธเนเธ”เนเธญเธดเธชเธฃเธฐ
- [x] 5.4 Chart components เธฃเธฑเธ data เธเธฒเธ API (เนเธกเนเนเธเน mock constants)

## 6. Frontend โ€” Edit Mode (เธชเธณเธซเธฃเธฑเธเธเธนเนเธกเธต DASHBOARD_EDIT)

- [x] 6.1 เน€เธเธดเนเธกเธเธธเนเธก "เนเธเนเนเธ" เนเธ Trend/Weekly/Proportion views เธชเธณเธซเธฃเธฑเธเธเธนเนเธกเธต `DASHBOARD_EDIT`
- [x] 6.2 Edit mode: เน€เธเธฅเธตเนเธขเธ chart data เน€เธเนเธ input fields
- [x] 6.3 Month selector เธชเธณเธซเธฃเธฑเธเนเธเนเนเธเธเนเธญเธกเธนเธฅเธขเนเธญเธเธซเธฅเธฑเธ
- [x] 6.4 Submit โ’ PUT `/api/dashboard/stats` โ’ mutate SWR โ’ เนเธชเธ”เธเธเนเธญเธกเธนเธฅเนเธซเธกเนเธ—เธฑเธเธ—เธต

## 7. เธเธฃเธฐเธเธฒเธจเธชเธณเธเธฑเธ

- [x] 7.1 เธ•เธฃเธงเธเธชเธญเธเธงเนเธฒ `AnnouncementsCard` เนเธชเธ”เธเธเธฃเธฐเธเธฒเธจเธเธฒเธ API เนเธ”เธขเนเธกเนเธเธฃเธญเธเธ•เธฒเธก department
- [x] 7.2 เธเธฃเธฐเธเธฒเธจเนเธชเธ”เธ 3 เธฃเธฒเธขเธเธฒเธฃเธฅเนเธฒเธชเธธเธ”เน€เธซเธกเธทเธญเธเธเธฑเธเธ—เธธเธ role

- [x] 7.3 ตรวจสอบว่าหมวดหมู่ประกาศ (category badge) แสดงสีจาก nnouncementCategories ใน API (ไม่ใช้สีเทา #6b7280) โดยดึง color_code จากตาราง announcement_categories โดยตรง

## 8. เธ—เธ”เธชเธญเธ

- [ ] 8.1 เธ—เธ”เธชเธญเธ Dean login โ’ เน€เธซเนเธ 5 views + เธ—เธธเธเนเธเธเธ
- [ ] 8.2 เธ—เธ”เธชเธญเธ Dept Admin login โ’ เน€เธซเนเธ 4 views + เน€เธเธเธฒเธฐเนเธเธเธเธ•เธฑเธงเน€เธญเธ
- [ ] 8.3 เธ—เธ”เธชเธญเธ User login โ’ เน€เธซเนเธ 3 views
- [ ] 8.4 เธ—เธ”เธชเธญเธ Viewer login โ’ เน€เธซเนเธ 2 views
- [ ] 8.5 เธ—เธ”เธชเธญเธ edit dashboard data โ’ PUT โ’ revalidate
- [ ] 8.6 เธ—เธ”เธชเธญเธ permissions API โ’ grant/revoke edit rights
- [ ] 8.7 เธ—เธ”เธชเธญเธ announcements เน€เธซเธกเธทเธญเธเธเธฑเธเธ—เธธเธ role
- [ ] 8.8 เธ—เธ”เธชเธญเธเธเนเธญเธกเธนเธฅเธญเธฑเธ•เนเธเธกเธฑเธ•เธด (org stats เธเธฒเธ DB)
