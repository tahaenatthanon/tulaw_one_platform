import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "USERS_VIEW")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดูข้อมูลผู้ใช้", 403);
  }

  try {
    const { id } = await params;
    const [loginHistories, auditLogs] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, status: true, ipAddress: true, createdAt: true },
      }),
      prisma.auditLog.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, action: true, module: true, createdAt: true },
      }),
    ]);

    const activities = [
      ...loginHistories.map(lh => ({
        id: lh.id,
        type: "login" as const,
        action: lh.status === "success" ? "Login" : "Login Failed",
        ipAddress: lh.ipAddress,
        timestamp: lh.createdAt,
      })),
      ...auditLogs.map(log => ({
        id: log.id,
        type: "audit" as const,
        action: log.action,
        module: log.module,
        ipAddress: null,
        timestamp: log.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return apiSuccess(activities.slice(0, 50));
  } catch (e) {
    console.error("[GET /api/users/:id/activity]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงประวัติกิจกรรมได้");
  }
}
