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
  const body = await req.json();

  // Accept both single { id, status } and array [{ name, status }]
  const items: Array<{ id?: string; name?: string; status: string }> = Array.isArray(body) ? body : [body];

  for (const item of items) {
    if (item.id) {
      await prisma.application.update({ where: { id: item.id }, data: { status: item.status } });
    } else if (item.name) {
      const app = await prisma.application.findFirst({ where: { name: item.name } });
      if (app) await prisma.application.update({ where: { id: app.id }, data: { status: item.status } });
    }
  }

  await logAction(session.user.id, "settings", "APP_STATUS_CHANGE", {
    entityType: "Application",
    entityId: "bulk",
    oldValue: "bulk",
    newValue: JSON.stringify(items.map(i => `${i.name || i.id}:${i.status}`)),
  });

  return NextResponse.json({ success: true });
}
