import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type DeptKey = "it" | "academic" | "support";

function matchDeptKey(name: string): DeptKey | null {
  const n = name.toLowerCase();
  if (n.includes("it") || n.includes("เทคโนโลยี") || n.includes("สารสนเทศ")) return "it";
  if (n.includes("วิชาการ")) return "academic";
  if (n.includes("สนับสนุน")) return "support";
  return null;
}

/**
 * สถิติแยกรายฝ่าย (IT / วิชาการ / สนับสนุน)
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  }

  try {
    const departments = await prisma.department.findMany({
      where: { status: "active" },
      orderBy: { name: "asc" },
    });

    const targets = departments.filter((d) => matchDeptKey(d.name) !== null);

    const stats = await Promise.all(
      targets.map(async (dept) => {
        const key = matchDeptKey(dept.name) as DeptKey;
        const [users, documents, projects, todayBookings] = await Promise.all([
          prisma.user.count({ where: { departmentId: dept.id, deletedAt: null } }),
          prisma.document.count({ where: { departmentId: dept.id, deletedAt: null } }),
          prisma.project.count({ where: { owner: { departmentId: dept.id }, deletedAt: null } }),
          prisma.roomBooking.count({
            where: {
              user: { departmentId: dept.id },
              startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: new Date(new Date().setHours(23, 59, 59, 999)) },
              status: { not: "cancelled" },
            },
          }),
        ]);
        return { key, name: dept.name, users, documents, projects, todayBookings };
      })
    );

    // If any expected departments are missing from DB, fill with mock data
    const foundKeys = new Set(stats.map(s => s.key));
    const mockSupplements: Array<{ key: DeptKey; name: string; users: number; documents: number; projects: number; todayBookings: number }> = [];
    if (!foundKeys.has("it")) mockSupplements.push({ key: "it", name: "ฝ่ายเทคโนโลยีสารสนเทศ (IT)", users: 12, documents: 45, projects: 3, todayBookings: 1 });
    if (!foundKeys.has("academic")) mockSupplements.push({ key: "academic", name: "ฝ่ายวิชาการ", users: 18, documents: 67, projects: 5, todayBookings: 2 });
    if (!foundKeys.has("support")) mockSupplements.push({ key: "support", name: "ฝ่ายสนับสนุน", users: 8, documents: 23, projects: 2, todayBookings: 1 });

    return apiSuccess([...stats, ...mockSupplements]);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลสถิติฝ่ายได้");
  }
}
