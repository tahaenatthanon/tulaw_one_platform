## 1. Remove RightSidebar rendering

- [x] 1.1 ลบ `{rightPanelOpen && <RightSidebar />}` จาก JSX
- [x] 1.2 ลบ `rightPanelOpen` state

## 2. Remove Header toggle button

- [x] 2.1 ลบ toggle button (PanelRightClose/PanelRightOpen) จาก Header

## 3. Remove RightSidebar component definition

- [x] 3.1 ลบ `RightSidebar` function component ทั้งหมด

## 4. Clean up unused imports

- [x] 4.1 ลบ `PanelRightClose`, `PanelRightOpen` imports
- [x] 4.2 ลบ `ChevronRight`, `Clock`, `Calendar` imports (ถ้าไม่ได้ใช้ที่อื่น)

## 5. Verify

- [x] 5.1 TypeScript compilation — zero errors
