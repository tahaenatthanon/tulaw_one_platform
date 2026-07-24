## ADDED Requirements

### Requirement: Enterprise API Key Card Display

Each API Key SHALL be displayed as an enterprise-style card showing: Name, API Key (masked with show/copy toggle), Permissions, Status (Active/Revoked badge), Created Date, and Last Used Date.

#### Scenario: API Key card shows all fields

- **WHEN** API keys exist in the system
- **THEN** each API key SHALL be rendered showing name, masked key, permissions list, status badge, creation date, and last used date

#### Scenario: Active status is visually distinct

- **WHEN** an API key has status "active"
- **THEN** a green "Active" badge SHALL be displayed next to the key name

#### Scenario: Revoked status is visually distinct

- **WHEN** an API key has status "revoked"
- **THEN** a red "Revoked" badge SHALL be displayed next to the key name
- **AND** the revoke action button SHALL be disabled for this key

### Requirement: API Key Actions

Each API key SHALL provide the following actions: View (toggle key visibility), Copy (copy key to clipboard), and Revoke (revoke the key).

#### Scenario: Copy action copies key to clipboard

- **WHEN** the user clicks the Copy button on an API key
- **THEN** the full API key string SHALL be copied to the clipboard
- **AND** the button SHALL briefly show "Copied" feedback

#### Scenario: Revoke action marks key as revoked

- **WHEN** the user clicks the Revoke button on an active API key
- **THEN** the key's status SHALL change to "revoked"
- **AND** the Revoke button SHALL become disabled

### Requirement: API Key Create Form

The API Key panel SHALL include a "Create API Key" button that opens an inline creation form with Name and Permissions fields.

#### Scenario: Create button opens inline form

- **WHEN** the user clicks "Create API Key"
- **THEN** an inline form SHALL appear above the key list with Name input and Permissions input fields
- **AND** the existing key list SHALL remain visible below

#### Scenario: Create form validates required fields

- **WHEN** the user submits the create form with an empty name
- **THEN** the create button SHALL be disabled or the form SHALL prevent submission

### Requirement: Empty State for No API Keys

When no API keys exist, the panel SHALL display an empty state with icon, title "ยังไม่มี API Key", description text, and a call-to-action button to create one.

#### Scenario: Empty state is displayed when no keys exist

- **WHEN** the system has zero API keys
- **THEN** the panel SHALL show an empty state with a Plug icon, "ยังไม่มี API Key" heading, descriptive text, and a "สร้าง API Key" button