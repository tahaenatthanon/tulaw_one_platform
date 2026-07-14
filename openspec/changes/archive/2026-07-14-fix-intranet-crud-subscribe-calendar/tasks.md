## 1. API — Error Logging

- [x] 1.1 Add `console.error("[POST /api/announcements]", e)` to POST handler catch block
- [x] 1.2 Add `console.error("[PUT /api/announcements]", e)` to PUT handler catch block
- [x] 1.3 Add `console.error("[DELETE /api/announcements]", e)` to DELETE handler catch block

## 2. Client — Fix Data Fetching & SWR Pattern

- [x] 2.1 Fix `apiAnnouncements` unwrapping: remove `.data` access, use array directly
- [x] 2.2 Remove `MOCK_ANNOUNCEMENTS` fallback; show empty state when no announcements
- [x] 2.3 Add `await` before `onMutate()` in `handleCreate`, `handleEditSave`, `handleDelete`

## 3. Client — Wire Subscription API

- [x] 3.1 Add `useSWR("/api/intranet/subscriptions")` in `AnnouncementsTab` to load subscriptions on mount
- [x] 3.2 Initialize `subscribed` state from API response (set of category names where `isSubscribed: true`)
- [x] 3.3 Update `handleSubscribe` to POST to `/api/intranet/subscriptions` with `{ categoryName, isSubscribed }` and revalidate
- [x] 3.4 Show loading state on subscribe buttons while API call is in progress

## 4. Client — Enforce Ownership Visibility

- [x] 4.1 Add `currentUserId` prop to `AnnouncementsTab` (get from session)
- [x] 4.2 Show edit (Pencil) button only on own announcements or when user has higher role (admin)
- [x] 4.3 Show delete (Trash2) button only on own announcements or when user has higher role
- [x] 4.4 Replace native `confirm()` with `ConfirmDialog` in delete flow
- [x] 4.5 Pass `canDelete` check through `SortableCard`-like pattern — disable for non-own announcements

## 5. Client — Calendar Month Navigation

- [x] 5.1 Add `calMonth` and `calYear` state to `CalendarTab`
- [x] 5.2 Replace module-scope `MONTH`, `YEAR`, `DAYS_IN_MONTH`, `START_DAY` with state-derived values
- [x] 5.3 Wire ChevronLeft onClick: decrement month (wrap to Dec of previous year)
- [x] 5.4 Wire ChevronRight onClick: increment month (wrap to Jan of next year)
- [x] 5.5 Update day-of-week header to use state-derived start day
- [x] 5.6 Update `TODAY` reference to use state-aware comparison

## 7. API — Create Notifications for Subscribers

- [x] 7.1 In POST `/api/announcements`, after create: query `AnnouncementSubscription` for all active subscribers to the announcement's category
- [x] 7.2 Create one `Notification` record with title `"ประกาศใหม่: <title>"`, message mentioning the category, and `actionUrl` pointing to intranet
- [x] 7.3 Create `NotificationRead` records via `createMany` for all subscriber userIds with `isRead: false`
- [x] 7.4 Skip notification creation if zero subscribers found (no-op)

## 8. Verification

- [ ] 8.1 Verify creating announcement shows new card without page refresh
- [ ] 8.2 Verify editing announcement updates card in-place
- [ ] 8.3 Verify deleting announcement removes card
- [ ] 8.4 Verify subscribe button persists across page reloads
- [ ] 8.5 Verify calendar navigates to previous/next months correctly
- [ ] 8.6 Verify edit/delete buttons hidden for other users' announcements
- [ ] 8.7 Verify delete shows ConfirmDialog instead of browser native dialog
- [ ] 8.8 Verify subscribers receive Notification + NotificationRead records when announcement published
- [ ] 8.9 Verify no notifications created when no subscribers exist for the category
