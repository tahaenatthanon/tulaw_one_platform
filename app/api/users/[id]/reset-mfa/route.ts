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
  if (!session?.user?.email || !hasPermission(roles, "USERS_RESET_MFA")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์รีเซ็ต MFA", 403);
  }

  try {
    const { id } = await params;
    await prisma.userMfa.updateMany({
      where: { userId: id },
      data: { isEnabled: false, updatedBy: session.user.id },
    });
    await prisma.user.update({
      where: { id },
      data: { status: "MFA_PENDING", updatedBy: session.user.id },
    });

    await logAction(session.user.id, "auth", "MFA_RESET", { entityType: "User", entityId: id });
    return apiSuccess({ message: "รีเซ็ต MFA สำเร็จ" });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถรีเซ็ต MFA ได้");
  }
}
