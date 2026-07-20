# dashboard-announcement-timeline Specification

## Purpose
TBD - created by archiving change sidebar-dashboard-redesign. Update Purpose after archive.
## Requirements
### Requirement: Important announcements display as a section header with single-row items

The Dashboard SHALL display "ประกาศสำคัญ" as a standalone section header (h2) followed by 3 latest announcements from Intranet, each in a single row with icon, title, category badge, and date.

#### Scenario: Section header is outside any card

- **WHEN** Dashboard renders the announcements section
- **THEN** "ประกาศสำคัญ" SHALL appear as a standalone h2 section heading (not inside a card header bar)
- **AND** NO card wrapper SHALL surround the heading and items — only the individual item rows SHALL have card styling

#### Scenario: Each announcement shows badge and date below title

- **WHEN** Dashboard loads with announcements data
- **THEN** each of the 3 announcements SHALL display with this layout: [category icon (left)] — [title (top row)] — [category badge + date (bottom row, below title)]
- **AND** the category badge and date SHALL appear together on a second line below the title
- **AND** the icon SHALL appear on the left in a colored rounded box (h-9 w-9)
- **AND** announcements SHALL be ordered by date descending (newest first)

#### Scenario: Click opens detail modal like Intranet

- **WHEN** user clicks an announcement row
- **THEN** a Detail Modal SHALL open showing: announcement title, publisher name, full date (e.g., "17 กรกฎาคม 2569"), and full content in `whitespace-pre-wrap`
- **AND** the modal SHALL have a "ปิด" (close) button
- **AND** user SHALL NOT be navigated away from the Dashboard page
- **AND** clicking the backdrop or close button SHALL dismiss the modal

#### Scenario: Announcements sorted newest first

- **WHEN** Dashboard loads with announcements data
- **THEN** announcements SHALL be sorted by date descending (newest announcement first)
- **AND** the sort order SHALL match the Intranet announcements tab sort order

### Requirement: Announcement items use Intranet category system

All category badges and icons SHALL use the same category definitions as the Intranet page.

#### Scenario: Categories match Intranet

- **WHEN** an announcement renders
- **THEN** the category badge text SHALL use the original Intranet category name (e.g., "ประกาศด่วน", "เชิญชวน", "นโยบาย")
- **AND** the badge color and styling SHALL match `CATEGORY_COLORS` from the Intranet page
- **AND** NO custom "Critical"/"Warning"/"Information" labels SHALL replace the original category names

### Requirement: Announcement items have smooth hover effects

Announcement item rows SHALL animate on hover.

#### Scenario: Item row highlights on hover

- **WHEN** user hovers over an announcement row
- **THEN** the row background SHALL change to `bg-tu-surface-hover`
- **AND** the title text SHALL change to `text-tu-primary`
- **AND** the transition SHALL complete in 150ms

### Requirement: Announcement colors reference globals.css design tokens only

All announcement text, badge, and hover state colors SHALL use CSS variables from `globals.css` via Tailwind `tu-*` utility classes.

#### Scenario: Announcement section uses only --tu-* color tokens

- **WHEN** announcement section renders
- **THEN** section header SHALL use `text-tu-text-primary` and `text-tu-text-muted`
- **AND** category badges SHALL use existing Intranet `CATEGORY_COLORS` patterns (`bg-tu-error/10 text-tu-error border-tu-error/20`, etc.)
- **AND** date text SHALL use `text-tu-text-muted`
- **AND** NO raw hex colors or Tailwind palette colors SHALL be used

