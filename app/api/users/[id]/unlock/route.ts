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
  if (!session?.user?.email || !hasPermission(roles, "USERS_UNLOCK_ACCOUNT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ปลดล็อกบัญชี", 403);
  }

  try {
    const { id } = await params;
    const oldUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true, isLocked: true },
    });

    await prisma.user.update({
      where: { id },
      data: { isLocked: false, updatedBy: session.user.id },
    });

    await logAction(session.user.id, "users", "ACCOUNT_UNLOCK", {
      entityType: "User",
      entityId: id,
      oldValue: JSON.stringify({ isLocked: oldUser?.isLocked ?? true }),
      newValue: JSON.stringify({ isLocked: false }),
    });
    return apiSuccess({ message: "ปลดล็อกบัญชีสำเร็จ" });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถปลดล็อกบัญชีได้");
  }
}
