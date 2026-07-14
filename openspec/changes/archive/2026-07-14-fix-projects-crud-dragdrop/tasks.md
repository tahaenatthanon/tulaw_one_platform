## 1. API Route — Improve Error Handling

- [x] 1.1 Import `Prisma` from `@prisma/client` in `app/api/projects/route.ts`
- [x] 1.2 Replace string matching with `Prisma.PrismaClientKnownRequestError` code `P2025` in PUT handler catch block
- [x] 1.3 Add `console.error("[PUT /api/projects]", e)` to PUT handler catch block
- [x] 1.4 Add `console.error("[POST /api/projects]", e)` to POST handler catch block
- [x] 1.5 Add `console.error("[DELETE /api/projects]", e)` + `P2025` check to DELETE handler catch block
- [x] 1.6 Add `console.error("[GET /api/projects]", e)` to GET handler catch block

## 2. Client Page — Fix Unhandled Promise Rejections

- [x] 2.1 Fix `handleDragEnd`: convert to `async`, wrap both `fetchApi` calls in `try/catch`, call `mutate()` outside catch
- [x] 2.2 Fix `handleCreate`: move `mutate()` outside the `try/catch` so it runs on both success and failure
- [x] 2.3 Fix `handleApprove`: move `mutate()` outside the `try/catch` so it runs on both success and failure
- [x] 2.4 Fix `handleReject`: move `mutate()` outside the `try/catch` so it runs on both success and failure

## 3. Verification

- [x] 3.1 Verify `handleDragEnd` no longer throws `unhandledRejection` when API fails (drag card to another column)
- [x] 3.2 Verify creating a project triggers SWR revalidation (card appears in Planning column)
- [x] 3.3 Verify approving a project moves it to Completed column and revalidates
- [x] 3.4 Verify rejecting a project moves it back to Planning column and revalidates
- [x] 3.5 Verify server console shows error details when API operations fail
