import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requirePermission("RESEARCH_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);
  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const where: Record<string, unknown> = {};
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  const [data, total] = await Promise.all([
    prisma.project.findMany({ where: { ...where as any, projectTypeId: 1 }, skip, take: limit, orderBy: { createdAt: "desc" }, include: { tasks: true, members: { include: { user: { select: { email: true, firstNameTh: true, lastNameTh: true } } } } } }),
    prisma.project.count({ where: { ...where as any, projectTypeId: 1 } }),
  ]);
  return apiSuccess(data, { total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await requirePermission("RESEARCH_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const body = await req.json();
  const { title, description, startDate, endDate } = body;
  if (!title) return apiError("VALIDATION", "กรุณากรอกชื่อโครงการ");
  const project = await prisma.project.create({
    data: { name: title, description, projectTypeId: 1, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, status: "planning", ownerUserId: session.user.id, createdBy: session.user.id },
  });
  return apiSuccess(project);
}

export async function PUT(req: NextRequest) {
  const session = await requirePermission("RESEARCH_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const body = await req.json();
  const { id, status, title, description, budget } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  const update: Record<string, unknown> = { updatedBy: session.user.id };
  if (status) update.status = status;
  if (title) update.name = title;
  if (description) update.description = description;
  const project = await prisma.project.update({ where: { id }, data: update });
  return apiSuccess(project);
}

export async function DELETE(req: NextRequest) {
  const session = await requirePermission("RESEARCH_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  await prisma.project.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
  return apiSuccess({ deleted: true });
}
