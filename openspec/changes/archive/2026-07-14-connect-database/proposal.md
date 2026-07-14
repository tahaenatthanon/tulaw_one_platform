## Why

Prisma schema, Neon PostgreSQL adapter, และ seed ข้อมูลพร้อมแล้ว แต่ยังไม่ได้ push schema ลง database จริง และยังไม่มี script `db:seed` ใน `package.json` ทำให้รัน seed ไม่ได้โดยตรง ระบบจึงยังไม่มีตารางและข้อมูลเริ่มต้นในฐานข้อมูล

## What Changes

- เพิ่ม `tsx` dependency สำหรับรัน seed script
- เพิ่ม script `db:push`, `db:seed`, `db:setup` ใน `package.json`
- Push Prisma schema to Neon PostgreSQL (`prisma db push`)
- รัน seed เพื่อสร้างข้อมูลเริ่มต้น (6 users, 6 roles, departments, demo data)

## Capabilities

### New Capabilities

- `database-seed`: Push schema to Neon DB and seed initial data (users, roles, departments, demo entries)

### Modified Capabilities

_None._

## Impact

- **package.json**: เพิ่ม `tsx` dependency และ scripts `db:push`, `db:seed`, `db:setup`
- **Database**: ตารางและข้อมูลเริ่มต้นสร้างบน Neon PostgreSQL
- **No code changes** needed — Prisma adapter และ API routes ใช้ DATABASE_URL ที่มีอยู่แล้ว
