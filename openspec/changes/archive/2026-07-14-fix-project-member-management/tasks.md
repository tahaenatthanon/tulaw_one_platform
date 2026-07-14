## 1. API — User Search Endpoint

- [x] 1.1 Create `GET /api/projects/users/search` route handler that accepts `?q=` query param
- [x] 1.2 Search users by firstNameTh, lastNameTh, email (contains, case-insensitive, limit 10)
- [x] 1.3 Return `{ id, firstNameTh, lastNameTh, email, departmentName }` for each match
- [x] 1.4 Require authentication; return 401 if no session

## 2. API — POST /api/projects — Accept Members

- [x] 2.1 Extract `memberIds: { userId: string; role: string }[]` from request body
- [x] 2.2 Deduplicate by userId on server side
- [x] 2.3 After project create, bulk create `ProjectMember` records via `prisma.projectMember.createMany`
- [x] 2.4 Return created project with members in response (include members)

## 3. API — PUT /api/projects — Accept Members

- [x] 3.1 Extract `memberIds: { userId: string; role: string }[]` from request body
- [x] 3.2 If memberIds is provided (even if empty), delete all existing members for the project
- [x] 3.3 Bulk create new members from the provided list
- [x] 3.4 If memberIds is not provided (undefined), leave existing members unchanged

## 4. Client — Type Updates

- [x] 4.1 Update `Member` interface: `{ userId: string; name: string; role: string; department?: string }`
- [x] 4.2 Map API member response to `Member` type in `GET /api/projects` handler (include userId and department)

## 5. Client — User Search Combobox

- [x] 5.1 Build `UserSearchCombobox` component: search input + dropdown with debounced API call (300ms)
- [x] 5.2 Show "ไม่พบผู้ใช้" when no results
- [x] 5.3 Show loading indicator while searching
- [x] 5.4 Click to select user → add to parent member list

## 6. Client — Integrate into ProjectFormModal

- [x] 6.1 Replace free-text name input with `UserSearchCombobox` for adding members
- [x] 6.2 Keep role input per member row (free-text)
- [x] 6.3 Show real user name + department in each member row
- [x] 6.4 Wire `handleCreate` to pass `memberIds` (userId + role) to API
- [x] 6.5 Wire `handleEdit` to pass `memberIds` to API
- [x] 6.6 Pre-populate existing members when editing

## 7. Verification

- [ ] 7.1 Verify user search returns matching users when typing 2+ characters
- [ ] 7.2 Verify creating project with members persists members and displays on kanban card
- [ ] 7.3 Verify editing project members syncs correctly (add, remove, role change)
- [ ] 7.4 Verify clearing all members works (empty memberIds array)
- [ ] 7.5 Verify member count on kanban card updates after member changes
