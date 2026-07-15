## MODIFIED Requirements

### Requirement: Documents fetches real documents

The Documents page SHALL fetch documents from `GET /api/documents` instead of `MOCK_DOCS`.

#### Scenario: Documents page loads

- **WHEN** a user navigates to Documents
- **THEN** the system SHALL fetch documents respecting the user's data scope (pool access) via `resolveDataScope`
- **AND** SHALL display a loading skeleton while fetching
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
- **AND** the API SHALL read the file from local storage (`public/uploads/documents/`) and return it with `Content-Type` and `Content-Disposition: attachment` headers
- **AND** the browser SHALL trigger a file download with the correct filename and content type
- **AND** the system SHALL record a "download" audit entry (non-fatal)

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
- **AND** SHALL NOT send a delete request to the server
- **AND** the delete button SHALL only be visible on documents where `ownerUserId === currentUserId`

#### Scenario: User upload always goes to personal pool

- **WHEN** a User role (level < 50) uploads a file while viewing any pool tab
- **THEN** the system SHALL force `poolType = "personal"` regardless of the currently selected tab
- **AND** the file SHALL appear in the user's Personal Pool after upload

#### Scenario: Audit trail records document access

- **WHEN** a user views, downloads, uploads, edits, or deletes a document
- **THEN** the system SHALL record the action (action type, document ID, user ID, timestamp) in the audit log
- **AND** the audit entry SHALL be immutable (append-only)

#### Scenario: Storage progress bar shows real-time usage from database

- **WHEN** the documents page loads or refreshes
- **THEN** the system SHALL calculate total storage usage from actual `StorageFile.fileSize` values in the database
- **AND** SHALL display a progress bar with used/total GB and percentage
- **AND** SHALL auto-refresh via SWR every 15 seconds
- **AND** SHALL update immediately after any upload or delete action
