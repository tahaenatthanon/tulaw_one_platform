## ADDED Requirements

### Requirement: Real-Time Branding Preview

The Branding settings panel SHALL include a preview area that reflects the current form state values in real-time without affecting the actual system until the user saves.

#### Scenario: Theme color preview updates in real-time

- **WHEN** the user changes the primary color value in the branding form
- **THEN** the preview area SHALL immediately show the new color applied to preview elements (buttons, header bar, sidebar) using inline styles only
- **AND** the actual CSS custom properties of the page SHALL NOT be modified until the user saves

#### Scenario: System name preview updates in real-time

- **WHEN** the user changes the system name in the branding form
- **THEN** the preview header bar and sidebar SHALL immediately reflect the new name text

#### Scenario: Logo preview updates when logo is uploaded

- **WHEN** the user uploads a new logo image
- **THEN** the preview header bar SHALL display the new logo image in place of the system name text

### Requirement: Branding Preview Components

The preview area SHALL display the following components to help the administrator visualize the branding changes: Primary Button preview, Outline Button preview, Header Bar preview, and Sidebar preview.

#### Scenario: Primary and outline button previews are shown

- **WHEN** the branding preview renders
- **THEN** the preview SHALL show a "Primary Button" with the current color as background and an "Outline Button" with the current color as border and text

#### Scenario: Header bar preview is shown

- **WHEN** the branding preview renders
- **THEN** the preview SHALL show a mini header bar with the current primary color as background, displaying the system name and a mock user avatar

#### Scenario: Sidebar preview is shown

- **WHEN** the branding preview renders
- **THEN** the preview SHALL show a mini sidebar with mock navigation items (Dashboard, Application Hub, Intranet, Settings) using the primary color variant as background

### Requirement: Branding Preview Has No Side Effects

The preview SHALL NOT modify any global CSS variables, DOM attributes, or persistent settings. All preview styling SHALL use inline `style` attributes scoped to the preview component.

#### Scenario: Preview does not affect other page elements

- **WHEN** the user changes branding values and the preview updates
- **THEN** no other elements on the page (header, sidebar, buttons outside the preview) SHALL change appearance
- **AND** the system's CSS custom properties SHALL remain at their saved values

#### Scenario: Preview resets on discard

- **WHEN** the user changes branding values, observes the preview, and clicks Discard
- **THEN** the preview SHALL revert to reflect the last saved values

### Requirement: Logo Propagation Across All Views After Save

After a new logo is uploaded and saved via System Configuration, the updated logo SHALL appear immediately in all locations that display the system logo: Sidebar, Login page, and any other component reading from the same data source. All changes SHALL take effect without requiring a page refresh or logout/login.

#### Scenario: Sidebar shows updated logo after save

- **WHEN** the user uploads a new logo in System Configuration and clicks Save
- **THEN** the application sidebar SHALL display the new logo immediately after the save completes
- **AND** no page refresh or re-login SHALL be required

#### Scenario: Login page shows updated logo after save

- **WHEN** the user uploads a new logo in System Configuration and clicks Save
- **THEN** the login page SHALL display the new logo on the next visit
- **AND** the logo SHALL be sourced from the same `branding.logoUrl` API field

#### Scenario: All logo consumers use Single Source of Truth

- **WHEN** any component displays the system logo
- **THEN** it SHALL read the logo URL from `branding.logoUrl` via the `/api/settings` response (SWR cache)
- **AND** no component SHALL maintain a separate or cached copy of the logo URL

#### Scenario: Default logo shown when no logo is uploaded

- **WHEN** no logo has been uploaded (`branding.logoUrl` is null or empty)
- **THEN** all logo-displaying components SHALL show the default logo or fallback placeholder as per original behavior
</content>
