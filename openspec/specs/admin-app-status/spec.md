# admin-app-status Specification

## Purpose
TBD - created by archiving change admin-management-modals. Update Purpose after archive.
## Requirements
### Requirement: Application Hub has inline app status management

The Application Hub SHALL provide a "จัดการสถานะแอป" button that opens a modal for administrators to change the operational status of each application.

#### Scenario: Open app status modal

- **WHEN** a user with SETTINGS_VIEW permission clicks "จัดการสถานะแอป"
- **THEN** a modal SHALL open showing all 5 applications (ERP, E-Office, Document Management, Academic, HR)
- **AND** each app SHALL display its current status as a selectable option (online/maintenance/offline)
- **AND** status indicators SHALL use green (online), amber (maintenance), red (offline)

#### Scenario: Save status changes

- **WHEN** the user changes status and clicks "บันทึก"
- **THEN** the system SHALL PUT all statuses to `/api/settings/app-status`
- **AND** the modal SHALL close after save
- **AND** the Application Hub SHALL refresh to show updated status indicators

#### Scenario: Status changes are reflected in real-time

- **WHEN** an administrator saves status changes in the modal
- **THEN** the Application Hub SHALL revalidate its SWR cache via `mutate()`
- **AND** updated status indicators SHALL appear immediately without page refresh

