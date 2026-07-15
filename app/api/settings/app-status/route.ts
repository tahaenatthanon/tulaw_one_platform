import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-utils";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !hasPermission((session.user as { roles?: string[] }).roles ?? [], "SETTINGS_VIEW")) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const apps = await prisma.application.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } },
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
  const app = await prisma.application.update({ where: { id }, data: { status } });
  return apiSuccess(app);
}
