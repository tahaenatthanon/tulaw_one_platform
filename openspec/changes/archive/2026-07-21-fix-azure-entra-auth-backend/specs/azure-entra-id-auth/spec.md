## MODIFIED Requirements

### Requirement: Sign in with Microsoft Button on Login Page

The system SHALL display a prominent "Sign in with Microsoft" button on the login page (`/login`) that initiates the Microsoft Entra ID OAuth flow via the explicit Route Handler.

#### Scenario: User clicks Sign in with Microsoft

- **WHEN** a user visits the login page
- **AND** the Microsoft Entra ID provider is configured (env vars are set)
- **THEN** the system SHALL display a "Sign in with Microsoft" button below the credentials form
- **AND** the button SHALL redirect to `/api/auth/azure/login` when clicked

#### Scenario: Microsoft Entra ID not configured

- **WHEN** the Microsoft Entra ID environment variables are not set
- **THEN** the system SHALL hide the "Sign in with Microsoft" button
- **AND** display only the credentials login form
