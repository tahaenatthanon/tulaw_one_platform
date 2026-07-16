import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";
import { hasPermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";

// GET is public — any authenticated user can read app statuses for Application Hub
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const apps = await prisma.application.findMany({
    where: { deletedAt: null },
    include: { category: { select: { name: true } } },
  });

  // Sort by predefined order
  const ORDER = ["ERP", "E-Office", "จัดการเอกสาร", "งานวิชาการ", "งานบุคคล"];
  apps.sort((a, b) => {
    const ai = ORDER.indexOf(a.name);
    const bi = ORDER.indexOf(b.name);
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return apiSuccess(apps);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !hasPermission((session.user as { roles?: string[] }).roles ?? [], "SETTINGS_MANAGE")) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ success: false, error: { message: "Missing id/status" } }, { status: 400 });

  // Read old status for audit log
  const oldApp = await prisma.application.findUnique({ where: { id }, select: { status: true, name: true } });
  const oldStatus = oldApp?.status ?? "unknown";

  const app = await prisma.application.update({ where: { id }, data: { status } });

  await logAction(session.user.id, "settings", "APP_STATUS_CHANGE", {
    entityType: "Application",
    entityId: id,
    oldValue: oldStatus,
    newValue: status,
  });

  return apiSuccess(app);
}
