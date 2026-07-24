## ADDED Requirements

### Requirement: Empty State for No Search Results

When the search query returns no matching categories, the sidebar SHALL display an empty state with a search-X icon, a message indicating no results were found, and the search query text.

#### Scenario: Empty state shown when search has no matches

- **WHEN** the user types a search query that matches no category names, descriptions, or keywords
- **THEN** the sidebar SHALL display a SearchX icon, the message "ไม่พบหมวดหมู่ที่ตรงกับ "{query}"" and the category list SHALL be empty

#### Scenario: Empty state clears when search is reset

- **WHEN** the user clears the search query or clicks the clear button
- **THEN** the empty state SHALL disappear and all categories SHALL reappear

### Requirement: Empty State for No API Keys

When no API keys have been created, the API Keys panel SHALL display an empty state with a Plug icon, "ยังไม่มี API Key" title, descriptive text, and a "สร้าง API Key" call-to-action button.

#### Scenario: Empty state with create action

- **WHEN** the API keys list is empty
- **THEN** an empty state SHALL display with: Plug icon, "ยังไม่มี API Key" heading, "สร้าง API Key เพื่อให้ระบบภายนอกเรียกใช้บริการของคุณได้" description, and a "สร้าง API Key" button

#### Scenario: Clicking CTA opens create form

- **WHEN** the user clicks "สร้าง API Key" from the empty state
- **THEN** the inline creation form SHALL open

### Requirement: Empty State for No Integration

When no integrations or external services are configured, the Integration panel SHALL display an appropriate empty state consistent with the Design System.

#### Scenario: Empty state for integration tab

- **WHEN** the Integration panel has no configured services
- **THEN** an empty state SHALL display with a Plug icon and descriptive text about connecting external services

### Requirement: Empty State Design Consistency

All empty states SHALL follow a consistent design pattern: a centered layout with an icon container (rounded square with soft primary background), a title heading, optional description text, and an optional action button.

#### Scenario: All empty states use the same layout pattern

- **WHEN** any empty state is displayed
- **THEN** it SHALL use a dashed border container, vertically centered content, an icon in a rounded primary-soft container, a semibold title, muted description text, and optional action button