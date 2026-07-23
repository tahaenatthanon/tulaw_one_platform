import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";
import type { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const actorId = (session?.user as { id?: string })?.id ?? "";
  if (!session?.user?.email || !hasPermission(roles, "USERS_EDIT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์บังคับออกจากระบบ", 403);
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return apiError("NOT_FOUND", "ไม่พบผู้ใช้", 404);

    // Invalidate all active sessions
    await prisma.userSession.updateMany({
      where: { userId: id, logoutTime: null },
      data: { logoutTime: new Date() },
    });

    await logAction(actorId, "users", "FORCE_SIGN_OUT", {
      entityType: "user",
      entityId: id,
      newValue: JSON.stringify({ action: "force_sign_out" }),
    });

    return apiSuccess({ message: "Force sign out successful" });
  } catch (e) {
    console.error("[POST /api/users/:id/force-sign-out]", e);
    return apiError("DB_ERROR", "ไม่สามารถบังคับออกจากระบบได้");
  }
}
