import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !hasPermission((session.user as { roles?: string[] }).roles ?? [], "SETTINGS_VIEW")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  const rooms = await prisma.meetingRoom.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  return apiSuccess(rooms);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !hasPermission((session.user as { roles?: string[] }).roles ?? [], "SETTINGS_MANAGE")) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { name, capacity } = await req.json();
  if (!name) return apiError("VALIDATION", "กรุณาระบุชื่อห้อง");
  const room = await prisma.meetingRoom.create({
    data: { name, capacity: capacity || 10, createdBy: (session.user as { id: string }).id },
  });
  return apiSuccess(room);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !hasPermission((session.user as { roles?: string[] }).roles ?? [], "SETTINGS_MANAGE")) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const { id, name, capacity } = await req.json();
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  const room = await prisma.meetingRoom.update({
    where: { id },
    data: { ...(name && { name }), ...(capacity !== undefined && { capacity }) },
  });
  return apiSuccess(room);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !hasPermission((session.user as { roles?: string[] }).roles ?? [], "SETTINGS_MANAGE")) {
    return NextResponse.json({ success: false }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  await prisma.meetingRoom.update({ where: { id }, data: { deletedAt: new Date() } });
  return apiSuccess({ deleted: true });
}
