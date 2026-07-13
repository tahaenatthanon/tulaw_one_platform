import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint — ตรวจสอบว่า environment variables + database พร้อมใช้งาน
 * เรียก GET /api/auth/debug เพื่อดูสถานะ
 */
export async function GET() {
  const checks: Record<string, boolean | string> = {};

  // 1. NEXTAUTH_SECRET
  checks.NEXTAUTH_SECRET = !!process.env.NEXTAUTH_SECRET;

  // 2. DATABASE_URL
  checks.DATABASE_URL = !!process.env.DATABASE_URL;

  // 3. Database connectivity
  try {
    const userCount = await prisma.user.count();
    checks.DB_CONNECTED = true;
    checks.USER_COUNT = String(userCount);
  } catch (e) {
    checks.DB_CONNECTED = false;
    checks.DB_ERROR = e instanceof Error ? e.message : "Unknown DB error";
  }

  const allPassed = checks.NEXTAUTH_SECRET && checks.DATABASE_URL && checks.DB_CONNECTED;

  return Response.json(
    { ok: allPassed, checks },
    { status: allPassed ? 200 : 500 }
  );
}
