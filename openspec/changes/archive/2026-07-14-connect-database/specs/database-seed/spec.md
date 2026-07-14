## ADDED Requirements

### Requirement: Database Schema Push

The system SHALL push the Prisma schema to the connected Neon PostgreSQL database, creating all tables defined in `prisma/schema.prisma`.

#### Scenario: Schema push succeeds

- **WHEN** running `npm run db:push`
- **THEN** all model tables SHALL be created in the database
- **AND** the command SHALL exit with code 0

### Requirement: Database Seeding

The system SHALL seed initial data including 6 roles, 6 users, departments, and demo records via `prisma/seed.ts`.

#### Scenario: Seed creates users

- **WHEN** running `npm run db:seed`
- **THEN** 6 users SHALL be created with credentials (password: TuLaw@2026!)
- **AND** each user SHALL be assigned their respective role

#### Scenario: Seed is idempotent

- **WHEN** running seed multiple times
- **THEN** existing records SHALL be updated instead of duplicated (upsert)
