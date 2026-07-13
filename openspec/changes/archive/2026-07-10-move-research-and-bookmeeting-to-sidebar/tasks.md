## 1. Update Sidebar Navigation Data

- [x] 1.1 Add `FlaskConical` and `CalendarCheck` icons to the import from `lucide-react` in `components/layouts/dashboard-layout.tsx`
- [x] 1.2 Add `useHasPermission` hook import from `@/hooks/use-permission` in `components/layouts/dashboard-layout.tsx`
- [x] 1.3 Add `permission` field (optional) to the `NavItem` interface to support permission-based visibility

## 2. Add Research Management to Sidebar

- [x] 2.1 Add "งานวิจัย" NavItem to `platformNav` array with `href: "/application-hub/research-management"`, `icon: FlaskConical`, and `permission: "RESEARCH_VIEW"`
- [x] 2.2 Update sidebar rendering logic to filter items by `permission` code using `useHasPermission` hook (in addition to existing role-based check)

## 3. Add Book Meeting to Sidebar

- [x] 3.1 Add "จองห้องประชุม" NavItem to `platformNav` array with `href: "/book-meeting"`, `icon: CalendarCheck`, and `permission: "BOOK_MEETING_VIEW"`

## 4. Verification

- [ ] 4.1 Verify both sidebar items appear correctly for users with appropriate permissions
- [ ] 4.2 Verify both sidebar items are hidden for users without permissions (Viewer role)
- [ ] 4.3 Verify active state highlighting works when navigating to `/application-hub/research-management` and `/book-meeting`
- [ ] 4.4 Verify sidebar collapse mode displays icons correctly
- [ ] 4.5 Verify mobile sidebar behavior with new items
- [ ] 4.6 Verify Application Hub still lists both modules (backward compatibility)
