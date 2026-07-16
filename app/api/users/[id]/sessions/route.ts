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
    const sessions = await prisma.userSession.findMany({
      where: { userId: id },
      orderBy: { loginTime: "desc" },
      take: 20,
      select: {
        id: true,
        device: true,
        browser: true,
        ipAddress: true,
        loginTime: true,
        logoutTime: true,
        createdAt: true,
      },
    });

    const formattedSessions = sessions.map(s => ({
      id: s.id,
      device: s.device ?? "Unknown",
      browser: s.browser ?? "Unknown",
      operatingSystem: extractOS(s.device),
      ipAddress: s.ipAddress,
      loginTime: s.loginTime,
      lastActivity: s.createdAt,
      sessionStatus: s.logoutTime ? "ended" : "active",
    }));

    return apiSuccess(formattedSessions);
  } catch (e) {
    console.error("[GET /api/users/:id/sessions]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูล sessions ได้");
  }
}

function extractOS(device: string | null | undefined): string {
  if (!device) return "Unknown";
  if (/windows/i.test(device)) return "Windows";
  if (/mac/i.test(device)) return "macOS";
  if (/linux/i.test(device)) return "Linux";
  if (/android/i.test(device)) return "Android";
  if (/iphone|ipad|ios/i.test(device)) return "iOS";
  return "Unknown";
}
