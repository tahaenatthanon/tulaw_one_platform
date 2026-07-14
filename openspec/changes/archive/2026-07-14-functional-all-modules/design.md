## Context

The platform has all API routes implemented and RBAC guards in place. However, most pages use hardcoded `MOCK_*` arrays and local state instead of fetching from APIs. Buttons appear to work (modals open, forms accept input) but changes are lost on refresh. This is the last mile — wiring UI to backend.

## Goals / Non-Goals

**Goals:**
- Replace all mock/hardcoded data with `fetch()` calls to existing API routes
- Add proper loading, empty, error states to every page
- Make all CRUD operations persist to the database
- Create missing API routes (ERP Finance, Settings persistence)
- Handle data scope correctly per user role

**Non-Goals:**
- Redesigning UI — pages keep their current layout and components
- Changing API contracts — existing routes stay as-is
- Adding new features beyond making existing mock data real
- Performance optimization beyond basic loading states

## Decisions

### Decision 1: Use SWR for data fetching on client pages

**Choice:** Use `swr` for data fetching, caching, and revalidation on all client pages.

**Rationale:** Most pages are `"use client"` (they have interactive state). SWR provides:
- Automatic revalidation on focus
- Built-in loading/error states
- Request deduplication
- Simple API: `const { data, error, isLoading, mutate } = useSWR(url, fetcher)`

**Alternatives considered:**
- React Query — heavier; SWR is lighter and sufficient for this use case
- Server Components — would require significant refactoring of interactive pages (kanban drag-drop, forms, modals)
- Raw `useEffect` + `fetch` — verbose, no caching, manual error handling

### Decision 2: Create a shared fetcher utility

**Choice:** Create `lib/fetcher.ts` with a typed `fetch` wrapper that includes auth headers and error handling.

**Rationale:** Every page needs the same pattern. Centralizing avoids repetition.

```typescript
export async function fetchApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...init?.headers }, ...init });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "เกิดข้อผิดพลาด");
  return json.data as T;
}
```

### Decision 3: Page-level data fetching pattern

**Choice:** Each page follows this pattern:
1. `useSWR` for GET data with loading/error/empty states
2. `mutate()` after mutations (POST/PUT/DELETE) to refresh data
3. Toast notifications for success/error feedback

**Rationale:** Consistent pattern makes pages predictable and maintainable.

### Decision 4: Settings persistence uses a simple key-value API

**Choice:** Create `/api/settings/route.ts` that stores settings as JSON in a `Settings` model or as a JSONB column.

**Alternative:** Individual endpoints per setting category — too many routes for config data that changes rarely.

### Decision 5: ERP Finance GL needs a new API route

**Choice:** Create `/api/erp/finance/route.ts` with GET (list GL entries) and POST (create journal entry).

**Rationale:** Finance data has a distinct schema (debit/credit, account codes) from other ERP modules.

## Risks / Trade-offs

- **[Risk] API call failures reveal empty states**: Previously mock data always showed something → **Mitigation**: Every page has empty state UI; API errors trigger toast notifications
- **[Risk] Breaking existing mock-based UI**: Some pages may have hardcoded data assumptions → **Mitigation**: Test each page after migration; fallback to empty state when API returns no data
- **[Trade-off] SWR adds dependency**: 30KB gzipped → **Accepted**: Benefits outweigh cost
- **[Trade-off] Client-side fetching vs RSC**: Would be ideal for pages without interactivity, but most have interactive elements → **Accepted**: Use SWR on client; migrate to RSC later if needed
