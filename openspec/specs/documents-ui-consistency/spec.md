# documents-ui-consistency Specification

## Purpose
TBD - created by archiving change documents-ui-redesign. Update Purpose after archive.
## Requirements
### Requirement: Documents page header matches platform standard

The Documents page header SHALL follow the same visual structure as other platform pages (Book Meeting, Intranet, Dashboard) with an eyebrow label, title, and description.

#### Scenario: Header renders with eyebrow, title, and description

- **WHEN** a user navigates to the Documents page
- **THEN** the page SHALL display an eyebrow label (11px, uppercase, with dot) above the title
- **AND** the title SHALL use text-[26px]/sm:text-[32px] with tracking-tight
- **AND** a description SHALL appear below the title in text-[14px] text-tu-text-muted

### Requirement: Documents page retains Storage Progress Bar

The Documents page SHALL retain the existing Storage Progress Bar displaying quota usage (HardDrive icon, progress bar, percentage, and used/total GB).

#### Scenario: Storage Progress Bar visible and functional

- **WHEN** a user navigates to the Documents page
- **THEN** the Storage Progress Bar SHALL be visible displaying the HardDrive icon
- **AND** the progress bar SHALL show current storage usage as a colored fill
- **AND** the used GB / total GB text SHALL be displayed
- **AND** the percentage badge SHALL show the current usage percentage

### Requirement: Documents page has primary action button only

The Documents page SHALL display a single primary "อัปโหลดเอกสาร" button without any secondary buttons.

#### Scenario: Single primary button displayed

- **WHEN** a user with DOCUMENTS_UPLOAD permission views the Documents page
- **THEN** a single primary button labeled "อัปโหลดเอกสาร" SHALL appear in the header toolbar area
- **AND** no secondary or outline buttons SHALL appear beside it

