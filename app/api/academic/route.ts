import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requirePermission("ACADEMIC_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);
  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ nameTh: { contains: search, mode: "insensitive" } }, { courseCode: { contains: search, mode: "insensitive" } }];
  const [data, total] = await Promise.all([
    prisma.academicCourse.findMany({ where: where as any, skip, take: limit, orderBy: { courseCode: "asc" }, include: { teachingLoads: { include: { room: true, user: { select: { email: true, firstNameTh: true, lastNameTh: true } } } } } }),
    prisma.academicCourse.count({ where: where as any }),
  ]);
  return apiSuccess(data, { total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await requirePermission("ACADEMIC_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const body = await req.json();
  const { courseCode, nameTh, credits } = body;
  if (!courseCode || !nameTh || !credits) return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
  const course = await prisma.academicCourse.create({ data: { courseCode, nameTh, credits: Number(credits), createdBy: session.user.id } });
  return apiSuccess(course);
}

export async function PUT(req: NextRequest) {
  const session = await requirePermission("ACADEMIC_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const body = await req.json();
  const { id, nameTh, credits } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  const course = await prisma.academicCourse.update({ where: { id }, data: { ...(nameTh && { nameTh }), ...(credits && { credits: Number(credits) }), updatedBy: session.user.id } });
  return apiSuccess(course);
}

export async function DELETE(req: NextRequest) {
  const session = await requirePermission("ACADEMIC_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  await prisma.academicCourse.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
  return apiSuccess({ deleted: true });
}
