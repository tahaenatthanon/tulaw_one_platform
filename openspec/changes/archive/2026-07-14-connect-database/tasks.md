## 1. Dependencies & Scripts

- [x] 1.1 Install `tsx` for running seed script — `npm install -D tsx`
- [x] 1.2 Add `db:push`, `db:seed`, `db:setup` scripts to `package.json`

## 2. Database Push

- [x] 2.1 Run `prisma db push` to create all tables on Neon PostgreSQL
- [x] 2.2 Verify tables exist by listing them or running a test query

## 3. Seed Data

- [x] 3.1 Run seed script to create 6 roles with levels
- [x] 3.2 Verify 6 users created with correct role assignments
- [x] 3.3 Verify demo departments and sample data created

## 4. Verify

- [x] 4.1 Start dev server and log in as admin@tulaw.ac.th / TuLaw@2026!
- [x] 4.2 Verify dashboard loads real data from database
