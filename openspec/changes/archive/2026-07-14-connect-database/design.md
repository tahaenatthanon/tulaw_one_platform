## Context

Neon PostgreSQL connection string มีใน `.env` แล้ว (DATABASE_URL). Prisma schema มีทุกโมเดล. Prisma client ใช้ `PrismaNeon` adapter ใน `lib/prisma.ts` อยู่แล้ว. Seed script พร้อม. แค่ยังไม่มี `tsx` และ scripts ที่เหมาะสม.

## Goals / Non-Goals

**Goals:**
- Push schema to Neon DB (สร้างตารางทั้งหมด)
- Seed ข้อมูลเริ่มต้น: 6 roles, 6 users, departments, demo data
- เพิ่ม npm scripts ให้รันสะดวก

**Non-Goals:**
- Migration-based workflow — ใช้ `prisma db push` (เหมาะกับ development)
- ไม่เปลี่ยน Prisma adapter หรือ DATABASE_URL

## Decisions

- **`tsx` over `ts-node`**: เบากว่า ไม่ต้อง config, รองรับ ESM
- **`prisma db push` over `prisma migrate dev`**: เหมาะกับ stage นี้ — schema ยังเปลี่ยนบ่อย ไม่ต้อง track migration files
- **ไม่ใช้ `prisma.config.ts` สำหรับ push/seed โดยตรง**: scripts ใช้ `prisma db push` + `npx tsx`

## Risks

- [Risk] Seed ล้มเหลวเพราะตารางไม่มี → Mitigation: ใช้ `upsert` ใน seed
- [Risk] Neon connection timeout → Mitigation: `connect_timeout=10` ใน URL แล้ว
