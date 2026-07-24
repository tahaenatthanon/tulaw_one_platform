## MODIFIED Requirements

### Requirement: Categories Management with Real Backend

Meeting Room, Application Status, Categories, Security, and Audit management SHALL NO LONGER be accessible from the System Configuration page. These features have their own dedicated management pages and SHALL be removed from the System Configuration category navigation.

#### Scenario: Meeting Room tab is removed

- **WHEN** a system administrator navigates to System Configuration
- **THEN** Meeting Room settings SHALL NOT appear in the category sidebar or navigation
- **AND** Meeting Room management SHALL be accessible only via its dedicated page

#### Scenario: Application Status tab is removed

- **WHEN** a system administrator navigates to System Configuration
- **THEN** Application Status settings SHALL NOT appear in the category sidebar or navigation
- **AND** Application Status management SHALL be accessible only via its dedicated page

#### Scenario: Categories tab is removed

- **WHEN** a system administrator navigates to System Configuration
- **THEN** Categories (Announcement Categories, Project Categories) management SHALL NOT appear in the category sidebar or navigation
- **AND** Categories management SHALL be accessible only via its dedicated pages

#### Scenario: Security tab is removed

- **WHEN** a system administrator navigates to System Configuration
- **THEN** Security settings SHALL NOT appear in the category sidebar or navigation

#### Scenario: Audit tab is removed

- **WHEN** a system administrator navigates to System Configuration
- **THEN** Audit settings SHALL NOT appear in the category sidebar or navigation
- **AND** Audit Log viewing SHALL be accessible only via its dedicated page

### Requirement: Data Persistence — System Configuration

Existing persistence behavior for remaining categories (Authentication, SSO/LDAP, Branding, Storage, API Keys) SHALL remain unchanged. Navigation structure changes SHALL NOT affect how settings are stored, retrieved, or applied.

#### Scenario: Remaining categories persist normally

- **WHEN** a system administrator saves settings for Authentication, SSO/LDAP, Branding, Storage, or API Keys
- **THEN** the settings SHALL be saved to the database via the existing API endpoints exactly as before
- **AND** settings SHALL persist after refresh and logout/login