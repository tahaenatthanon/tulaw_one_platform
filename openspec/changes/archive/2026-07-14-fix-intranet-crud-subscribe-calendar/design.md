## Context

The Intranet page (`app/(dashboard)/intranet/page.tsx`, ~900 lines) is a `"use client"` component with 3 tabs: announcements, calendar, contacts. It fetches announcements via SWR, manages all state locally, and communicates with `app/api/announcements/route.ts` and `app/api/intranet/subscriptions/route.ts`.

Five issues exist:

1. **Create/edit/delete handlers don't await mutate**: Same pattern as the Projects bug — `onMutate()` is called without `await`, so SWR revalidation may not complete before re-render
2. **MOCK_ANNOUNCEMENTS fallback hides real data**: When API returns data, the code checks `apiAnnouncements?.data` but SWR unwraps `fetchApi`'s `json.data`, so the `.data` access returns `undefined` — always falls back to mock
3. **Subscribe is local-only**: `handleSubscribe` toggles a `useState<Set<string>>()` — never calls `/api/intranet/subscriptions`. The API endpoint exists and works.
4. **Calendar month navigation broken**: `MONTH`, `YEAR`, `DAYS_IN_MONTH`, `START_DAY` are module-scope `const` computed once from `new Date()`. ChevronLeft/Right buttons have no `onClick` handlers.
5. **No notification on new announcement**: Subscribers don't get notified when new announcements are published in categories they follow. The `Notification`, `NotificationRead`, and `AnnouncementSubscription` tables all exist — just not wired.

## Goals / Non-Goals

**Goals:**
- All CRUD handlers use `await onMutate()` for consistent revalidation
- Remove `MOCK_ANNOUNCEMENTS` fallback and fix API data unwrapping
- Wire subscription to API: load on mount, toggle via POST
- Calendar month navigation with `useState`
- Show edit/delete buttons only on own announcements (frontend ownership)
- Replace `confirm()` with `ConfirmDialog` for delete
- Create notifications for subscribers when a new announcement is published

**Non-Goals:**
- No changes to subscription API route (already functional)
- No push notification delivery (FCM/APNs) — only in-app Notification records
- No changes to calendar event persistence (in-memory is acceptable, tracked separately)
- No changes to contacts tab (separate fix)

## Decisions

### Decision 1: Fix API data unwrapping + remove mock fallback

Same bug as projects: `fetchApi<T>()` returns `json.data` directly (unwrapped), so `useSWR` data is the array itself, not `{ data: [...] }`.

```typescript
// Before (broken)
const { data: apiAnnouncements } = useSWR("/api/announcements", swrFetcher);
const rawAnns = (apiAnnouncements as unknown as { data?: Announcement[] })?.data;
const announcements = Array.isArray(rawAnns) && rawAnns.length > 0 ? rawAnns : MOCK_ANNOUNCEMENTS;

// After (fixed)
const { data: apiAnnouncements } = useSWR("/api/announcements", swrFetcher);
const announcements: Announcement[] = Array.isArray(apiAnnouncements) ? apiAnnouncements : [];
```

### Decision 2: Wire subscription API

Load subscriptions on `AnnouncementsTab` mount via a separate `useSWR("/api/intranet/subscriptions")` call, initialize `subscribed` state from the API response. On toggle, call `POST /api/intranet/subscriptions` then revalidate.

### Decision 3: Calendar month navigation

Convert `CalendarTab` to use state:
```typescript
const [calMonth, setCalMonth] = useState(now.getMonth());
const [calYear, setCalYear] = useState(now.getFullYear());
```
Compute derived values from `calMonth`/`calYear` instead of module-scope `const`. Wire ChevronLeft/Right to decrement/increment month (wrapping year boundaries).

### Decision 4: Frontend ownership visibility

Add `currentUserId` to props. In `AnnouncementsTab`, show edit/delete buttons only when `ann.publisherUserId === currentUserId || !canEdit/canDelete` (admin override). Backend already enforces this.

### Decision 5: Create notifications for subscribers when announcement is published

After `POST /api/announcements` creates the announcement, query `Subscription` for all users subscribed to the announcement's category (`isSubscribed: true`). For each subscriber, create one `Notification` record and one `NotificationRead` record (with `isRead: false`). This is done in the same transaction flow but uses `createMany` for efficiency.

```typescript
// In POST /api/announcements, after creating the announcement:
const subscribers = await prisma.announcementSubscription.findMany({
  where: { categoryId, isSubscribed: true, deletedAt: null },
  select: { userId: true },
});

if (subscribers.length > 0) {
  const notif = await prisma.notification.create({
    data: {
      title: `ประกาศใหม่: ${title}`,
      message: `มีประกาศใหม่ในหมวด "${category}"`,
      actionUrl: `/intranet?tab=announcements`,
      createdBy: session.user.id,
    },
  });
  await prisma.notificationRead.createMany({
    data: subscribers.map(s => ({
      notificationId: notif.id,
      userId: s.userId,
      isRead: false,
    })),
  });
}
```

**Rationale**: Uses existing `Notification` + `NotificationRead` schema already in the DB. No new tables needed. `NotificationRead` per-user approach allows tracking read/unread state per subscriber. Future: the `Notification` records surface in the global header notification bell.

## Risks / Trade-offs

- **[Risk] Subscription API uses different response format** → The subscriptions API uses `NextResponse.json({ success: true, data })` not `apiSuccess` — need to handle in fetcher
- **[Risk] Mock removal shows empty state on first load** → This is correct behavior — the empty state message is already in the template
- **[Risk] Many subscribers could slow down POST** → Current user count is low (university-scale); `createMany` is efficient. If needed later, move to background job via `after` or queue.
