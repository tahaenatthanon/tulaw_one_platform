## ADDED Requirements

### Requirement: Storage Usage Progress Bar

The Storage settings panel SHALL include a visual progress bar showing the percentage of storage usage relative to the configured quota.

#### Scenario: Progress bar displays usage percentage

- **WHEN** the storage panel renders with a configured quota value
- **THEN** a progress bar SHALL display with a filled portion representing usage percentage and a numeric label showing the percentage

#### Scenario: Progress bar color indicates usage level

- **WHEN** storage usage is over 90%
- **THEN** the progress bar label SHALL display in error color (red)
- **WHEN** storage usage is between 60% and 90%
- **THEN** the progress bar label SHALL display in warning color (amber)
- **WHEN** storage usage is below 60%
- **THEN** the progress bar label SHALL display in success color (green)

### Requirement: Storage Statistics Cards

The visualization SHALL display two statistics cards: "Used Space" showing used GB and total GB, and "Remaining Space" showing remaining GB with "per user" label.

#### Scenario: Used space card shows calculated values

- **WHEN** the storage visualization renders with a quota value
- **THEN** the "Used Space" card SHALL display used GB, total GB, and the phrase "of {quota} GB total"

#### Scenario: Remaining space card shows calculated values

- **WHEN** the storage visualization renders with a quota value
- **THEN** the "Remaining Space" card SHALL display remaining GB and the label "per user"

### Requirement: Visualization Uses Quota Setting Only

The storage visualization SHALL derive its displayed values solely from the configured quota number in the form. It SHALL NOT make API calls or perform new calculations to determine actual storage usage.

#### Scenario: Visualization reflects quota value only

- **WHEN** the user changes the quota value in the form
- **THEN** the visualization SHALL update to reflect the new quota value in the stats cards
- **AND** no API calls SHALL be triggered by the visualization component itself