# documents-api Specification

## Purpose
TBD - created by archiving change documents-ui-redesign. Update Purpose after archive.
## Requirements
### Requirement: Documents API supports listing documents

The `/api/documents` GET endpoint SHALL return a list of documents filtered by pool type and search query.

#### Scenario: List all documents

- **WHEN** a GET request is made to `/api/documents`
- **THEN** the system SHALL return all non-deleted documents with their metadata (id, title, poolType, fileSize, mimeType, owner name, createdAt)
- **AND** SHALL include the owner's name (firstNameTh + lastNameTh)

#### Scenario: Filter by pool type

- **WHEN** a GET request is made to `/api/documents?pool=personal`
- **THEN** the system SHALL return only documents where poolType matches the query parameter

#### Scenario: Search by title

- **WHEN** a GET request is made to `/api/documents?search=report`
- **THEN** the system SHALL return documents where title contains the search term (case-insensitive)

### Requirement: Documents API supports file upload

The `/api/documents` POST endpoint SHALL accept file uploads via FormData and create a document record.

#### Scenario: Upload a document file

- **WHEN** a POST request is made to `/api/documents` with FormData containing file, title, and poolType
- **THEN** the system SHALL save the file, create a Document record, and return the created document
- **AND** SHALL require DOCUMENTS_UPLOAD permission

### Requirement: Documents API supports document deletion

The `/api/documents` DELETE endpoint SHALL soft-delete a document by ID.

#### Scenario: Delete own document

- **WHEN** a DELETE request is made to `/api/documents?id=<id>` by the document owner
- **THEN** the system SHALL soft-delete the document (set deletedAt)
- **AND** SHALL return success

### Requirement: Documents API supports file download

The `/api/documents/download` GET endpoint SHALL serve a document file for download with proper content headers.

#### Scenario: Download a document file

- **WHEN** a GET request is made to `/api/documents/download?id=<id>` by an authenticated user
- **THEN** the system SHALL read the file from disk and return it as a binary response
- **AND** SHALL set `Content-Type` to the file's mimeType
- **AND** SHALL set `Content-Disposition: attachment` with the original filename
- **AND** SHALL handle missing files with a 404 error

### Requirement: Documents API records audit logs for all mutations

The Documents API SHALL record an immutable audit log entry for every upload, download, and delete action.

#### Scenario: Audit log recorded on upload

- **WHEN** a POST request to `/api/documents` creates a document successfully
- **THEN** an audit log entry SHALL be created with module `DOCUMENTS`, action `DOC_UPLOAD`, and the document ID

#### Scenario: Audit log recorded on download

- **WHEN** a GET request to `/api/documents/download` serves a file successfully
- **THEN** an audit log entry SHALL be created with module `DOCUMENTS`, action `DOC_DOWNLOAD`, and the document ID

#### Scenario: Audit log recorded on delete

- **WHEN** a DELETE request to `/api/documents` soft-deletes a document successfully
- **THEN** an audit log entry SHALL be created with module `DOCUMENTS`, action `DOC_DELETE`, and the document ID

