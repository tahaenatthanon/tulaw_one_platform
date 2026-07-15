## ADDED Requirements

### Requirement: Intranet fetches real data from API

The Intranet page SHALL fetch announcements, calendar events, department contacts, and organization statistics from their respective API endpoints instead of using hardcoded `MOCK_*` arrays.

#### Scenario: Intranet loads announcements

- **WHEN** a user navigates to Intranet and selects the "ประกาศ" tab
- **THEN** the system SHALL fetch announcements from `GET /api/announcements` and display them
- **AND** SHALL show a loading skeleton while fetching
- **AND** SHALL show an empty state message when no announcements exist
- **AND** SHALL show an error toast if the API call fails

#### Scenario: Intranet loads calendar

- **WHEN** a user selects the "ปฏิทิน" tab
- **THEN** the system SHALL fetch events from the calendar API

#### Scenario: Intranet loads contacts

- **WHEN** a user selects the "ติดต่อหน่วยงาน" tab
- **THEN** the system SHALL fetch departments from the departments API

#### Scenario: Creating an announcement

- **WHEN** a user with `INTRANET_CREATE` permission submits a new announcement
- **THEN** the system SHALL POST to `/api/announcements` and refresh the list

---

### Requirement: Book Meeting fetches real rooms and bookings

The Book Meeting page SHALL fetch meeting rooms and bookings from `GET /api/book-meeting` instead of `MOCK_ROOMS`/`MOCK_BOOKINGS`.

#### Scenario: Book Meeting loads rooms

- **WHEN** a user navigates to Book Meeting
- **THEN** the system SHALL fetch rooms from the API and display them with real-time availability

#### Scenario: Room list shows real-time 3-level status

- **WHEN** a user navigates to the "รายการห้อง" tab
- **THEN** the system SHALL display all meeting rooms with one of three statuses: "ว่าง" (available, green), "กำลังใช้งาน" (in-use, yellow), or "ถูกจองแล้ว" (booked, red)
- **AND** SHALL determine "in-use" when the room has a confirmed or pending booking where `startTime <= now < endTime`
- **AND** SHALL determine "booked" when the room has any upcoming confirmed or pending booking (`startTime > now`, `endTime > now`)
- **AND** SHALL determine "available" when no future or active bookings exist for the room
- **AND** SHALL refresh room status automatically every 30 seconds via SWR polling

#### Scenario: Creating a booking

- **WHEN** a user submits a new booking
- **THEN** the system SHALL POST to `/api/book-meeting` and refresh the booking list

#### Scenario: Double-booking is prevented

- **WHEN** a user attempts to book an occupied time slot
- **THEN** the system SHALL display a conflict error from the API

#### Scenario: Double-booking is prevented with real-time client-side check

- **WHEN** a user selects a room, date, and time range in the booking form
- **THEN** the system SHALL check for conflicts in real-time by converting both the stored booking times (ISO datetime) and the selected times (`"HH:mm"`) to minutes before comparison
- **AND** if a conflict is found, SHALL display an inline error message "ช่วงเวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาใหม่" and disable the "จองห้อง" submit button
- **AND** the server SHALL perform an additional conflict check before creating the booking and return a `CONFLICT` error if the slot is taken

#### Scenario: Pending tab visible to all users

- **WHEN** a user navigates to the "รออนุมัติ" tab
- **THEN** the system SHALL display pending bookings without requiring `BOOK_MEETING_APPROVE` permission
- **AND** for users WITH `BOOK_MEETING_APPROVE`, the tab SHALL show ALL pending bookings with confirm and cancel buttons
- **AND** for users WITHOUT `BOOK_MEETING_APPROVE`, the tab SHALL show only the current user's own pending bookings with NO action buttons

#### Scenario: Approver confirms pending booking

- **WHEN** a user with `BOOK_MEETING_APPROVE` clicks "ยืนยัน" on a pending booking in the "รออนุมัติ" tab
- **THEN** the system SHALL update the booking status to "confirmed"
- **AND** SHALL refresh all tabs so the booking moves from "รออนุมัติ" to "confirmed" in every view (including schedule/timetable grid)
- **AND** SHALL send a notification to the booking owner informing them of the approval

#### Scenario: Schedule displays confirmed bookings with correct time conversion

- **WHEN** the schedule tab renders bookings for a selected date
- **THEN** the system SHALL convert each booking's `startTime` and `endTime` from ISO datetime to local time (using `new Date(iso).getHours()` / `.getMinutes()`) before comparing with time slot strings
- **AND** SHALL filter bookings to only those matching the selected date (`b.date === selectedDateStr`) and with `status === "confirmed"`
- **AND** SHALL NOT display pending bookings in the schedule grid

#### Scenario: Schedule updates in real-time when booking is approved

- **WHEN** a user with `BOOK_MEETING_APPROVE` confirms a pending booking
- **AND** the `mutateBookings()` call completes after PUT
- **THEN** the "ตารางเวลา" tab SHALL immediately refresh to show the newly confirmed booking without requiring a page reload
- **AND** the booking SHALL appear in the correct time slot for the booked room in the schedule grid
- **AND** the schedule SHALL be visible to ALL authenticated roles

#### Scenario: Confirmed booking visible in schedule for all roles

- **WHEN** a booking is confirmed (status = "confirmed")
- **THEN** the system SHALL display the booking in the "ตารางเวลา" tab for ALL authenticated roles (Super Admin, System Admin, Dean, Dept Admin, User, Viewer)
- **AND** the booking SHALL appear in its correct time slot for the booked room

#### Scenario: History tab shows past approved bookings only

- **WHEN** a user navigates to the "ประวัติ" tab
- **THEN** the system SHALL display past bookings that were approved (`confirmed` with `endTime < now`, `completed`) only
- **AND** SHALL NOT display cancelled bookings in the history tab
- **AND** for User role, SHALL show only the current user's own bookings with NO action buttons
- **AND** for Admin/Dean/Dept Admin roles, SHALL show all users' bookings with NO action buttons (read-only)
- **AND** SHALL sort entries by date descending (newest first)
- **AND** SHALL display status labels for each booking entry

#### Scenario: Cancel booking requires confirmation

- **WHEN** a user clicks the "ยกเลิก" button on any booking
- **THEN** the system SHALL display a confirmation dialog with the message "คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?"
- **AND** SHALL show a danger-styled "ยกเลิกการจอง" button and a "ยกเลิก" (cancel/close) button
- **WHEN** the user confirms by clicking "ยกเลิกการจอง"
- **THEN** the system SHALL send the cancel request to the API and refresh all views
- **WHEN** the user dismisses the dialog by clicking "ยกเลิก" (close)
- **THEN** the system SHALL NOT send any cancel request

#### Scenario: User edits own booking details

- **WHEN** a user clicks "แก้ไข" on their own booking in the "การจองของฉัน" tab
- **THEN** the system SHALL open an edit form pre-filled with the booking's current data
- **AND** SHALL allow modifying title, date, time, attendees, purpose, and notes
- **AND** SHALL re-check for time conflicts when date/time/room changes

#### Scenario: Editing time/date resets booking to pending

- **WHEN** a user edits a confirmed booking's startTime, endTime, roomId, or date
- **THEN** the system SHALL automatically set the booking status to "pending"
- **AND** SHALL require admin re-approval

#### Scenario: Full booking workflow is end-to-end functional

- **WHEN** a user with `BOOK_MEETING_CREATE` creates a booking
- **THEN** the booking SHALL appear in "การจองของฉัน" tab with status "รออนุมัติ"
- **AND** SHALL appear in "รออนุมัติ" tab for the user (view only) and for approvers (with action buttons)
- **WHEN** an approver confirms the booking
- **THEN** the booking SHALL move to "confirmed" status
- **AND** the "ตารางเวลา" tab SHALL refresh immediately via SWR revalidation to display the confirmed booking in its correct time slot
- **AND** SHALL appear in "ตารางเวลา" tab for all roles without page reload
- **AND** SHALL appear in "การจองของฉัน" tab with status "ยืนยัน"
- **AND** after the booking's `endTime` passes, SHALL appear in "ประวัติ" tab

---

### Requirement: Documents fetches real documents

The Documents page SHALL fetch documents from `GET /api/documents` instead of `MOCK_DOCS`.

#### Scenario: Documents page loads

- **WHEN** a user navigates to Documents
- **THEN** the system SHALL fetch documents respecting the user's data scope (pool access) via `resolveDataScope`
- **AND** SHALL display a loading state while fetching
- **AND** SHALL show an empty state message when no documents exist

#### Scenario: Uploading a document with Pool selection via Modal

- **WHEN** a user with `DOCUMENTS_UPLOAD` permission clicks "อัปโหลดเอกสาร"
- **THEN** the system SHALL open a modal with a Pool dropdown selector and a drag-and-drop file upload area
- **AND** the Pool dropdown SHALL show only pools the user has access to (Admin: all, User: personal only)
- **AND** the user SHALL be able to select a file by clicking the dropzone or dragging a file onto it
- **AND** when a file is selected, the modal SHALL preview the file name and size
- **WHEN** the user clicks "อัปโหลด"
- **THEN** the system SHALL send the file as `multipart/form-data` to `POST /api/documents` with the selected poolType

#### Scenario: Downloading a document

- **WHEN** a user clicks the "ดาวน์โหลด" button on a document they have access to
- **THEN** the system SHALL call `GET /api/documents/download?id=<docId>`
- **AND** the API SHALL read the file from local storage and return it with `Content-Type` and `Content-Disposition: attachment` headers
- **AND** the browser SHALL trigger a file download with the correct filename and content type

#### Scenario: Deleting a document

- **WHEN** a user with `DOCUMENTS_DELETE` permission deletes a document
- **THEN** the system SHALL verify the user owns the document or has sufficient role level
- **AND** SHALL soft-delete the document and its storage file
- **AND** SHALL NOT allow deletion from central or department pool unless user is admin or dept admin

#### Scenario: Pool access based on role

- **WHEN** a Super Admin or System Admin user views documents
- **THEN** the system SHALL show all documents from all pools (central, department, personal)
- **WHEN** a Dean user views documents
- **THEN** the system SHALL show all central and department pool documents plus their own personal pool documents
- **WHEN** a Dept Admin user views documents
- **THEN** the system SHALL show central pool documents, their own department's documents, and their own personal documents
- **WHEN** a User views documents
- **THEN** the system SHALL show central pool documents and their own personal pool documents only

#### Scenario: User can only edit, delete, and upload to personal pool

- **WHEN** a User role clicks "ลบ" on a central or department pool document
- **THEN** the system SHALL display an error message "คุณสามารถลบได้เฉพาะเอกสารใน Personal Pool เท่านั้น"
- **AND** the delete button SHALL only be visible on documents where `ownerUserId === currentUserId`

#### Scenario: User upload always goes to personal pool

- **WHEN** a User role (level < 50) uploads a file
- **THEN** the system SHALL force `poolType = "personal"` regardless of the pool selected
- **AND** the file SHALL appear in the user's Personal Pool after upload

#### Scenario: Audit trail records document access

- **WHEN** a user views, downloads, uploads, edits, or deletes a document
- **THEN** the system SHALL record the action in the `DocumentAudit` table
- **AND** the audit entry SHALL be immutable (append-only)

#### Scenario: Storage progress bar shows real-time usage from database

- **WHEN** the documents page loads or refreshes
- **THEN** the system SHALL calculate total storage usage from actual `StorageFile.fileSize` values in the database
- **AND** SHALL display a progress bar with used/total GB and percentage
- **AND** SHALL auto-refresh via SWR every 15 seconds
- **AND** SHALL update immediately after any upload or delete action

---

### Requirement: Projects fetches and persists kanban board

The Projects page SHALL fetch projects from `GET /api/projects` and persist all mutations (create, edit, drag-drop, approve, reject) via the API.

#### Scenario: Projects kanban loads

- **WHEN** a user navigates to Projects
- **THEN** the system SHALL fetch projects from the API and display them in kanban columns filtered by status

#### Scenario: Drag-and-drop updates status

- **WHEN** a user drags a project card to a different column
- **THEN** the system SHALL PUT to `/api/projects` with the new status and refresh

#### Scenario: Creating a project

- **WHEN** a user with `PROJECTS_CREATE` creates a new project
- **THEN** the system SHALL POST to `/api/projects` and add it to the planning column

#### Scenario: Approving a project

- **WHEN** a user with `PROJECTS_APPROVE` approves a project
- **THEN** the system SHALL update the project status via API and move it to the completed column
