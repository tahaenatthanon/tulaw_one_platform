## ADDED Requirements

### Requirement: Subscribers SHALL receive notification when an announcement is published in a subscribed category

The system SHALL create a `Notification` and `NotificationRead` record for each user who has an active subscription to the announcement's category when a new announcement is published.

#### Scenario: Single subscriber receives notification
- **WHEN** a user publishes an announcement in category "ประกาศด่วน" and one other user is subscribed to "ประกาศด่วน"
- **THEN** a Notification record is created with title and message mentioning the category, and a NotificationRead record is created for the subscribed user with `isRead: false`

#### Scenario: Multiple subscribers receive notifications
- **WHEN** a user publishes an announcement and 5 users are subscribed to its category
- **THEN** 5 NotificationRead records are created linking all subscribers to the same Notification

#### Scenario: No subscribers — no notifications
- **WHEN** a user publishes an announcement in a category with zero active subscriptions
- **THEN** no Notification or NotificationRead records are created

#### Scenario: Notification includes announcement link
- **WHEN** a notification is created for a subscriber
- **THEN** the Notification's `actionUrl` points to the intranet announcements tab
