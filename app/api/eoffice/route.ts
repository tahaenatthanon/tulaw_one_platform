import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requirePermission("E_OFFICE_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);
  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const secretLevel = searchParams.get("secretLevel");
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { docNo: { contains: search, mode: "insensitive" } }];
  if (status) where.status = status;
  if (secretLevel) where.secretLevel = secretLevel;
  const [data, total] = await Promise.all([
    prisma.eofficeDocument.findMany({ where: where as any, skip, take: limit, orderBy: { createdAt: "desc" }, include: { routings: { take: 5, orderBy: { createdAt: "desc" }, include: { sender: { select: { email: true, firstNameTh: true, lastNameTh: true } }, receiver: { select: { email: true, firstNameTh: true, lastNameTh: true } } } } } }),
    prisma.eofficeDocument.count({ where: where as any }),
  ]);
  return apiSuccess(data, { total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await requirePermission("E_OFFICE_CREATE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์สร้างเอกสาร", 403);
  const body = await req.json();
  const { docNo, title, secretLevel, urgentLevel, senderDepartmentId } = body;
  if (!docNo || !title) return apiError("VALIDATION", "กรุณากรอกเลขที่เอกสารและหัวเรื่อง");
  const doc = await prisma.eofficeDocument.create({
    data: { docNo, title, secretLevel: secretLevel ?? "normal", urgentLevel: urgentLevel ?? "normal", senderDepartmentId, createdBy: session.user.id },
  });
  return apiSuccess(doc);
}

export async function PUT(req: NextRequest) {
  const session = await requirePermission("E_OFFICE_APPROVE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์", 403);
  const body = await req.json();
  const { id, status, title, secretLevel, urgentLevel } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  const update: Record<string, unknown> = { updatedBy: session.user.id };
  if (status) update.status = status;
  if (title) update.title = title;
  if (secretLevel) update.secretLevel = secretLevel;
  if (urgentLevel) update.urgentLevel = urgentLevel;
  const doc = await prisma.eofficeDocument.update({ where: { id }, data: update });
  return apiSuccess(doc);
}

export async function DELETE(req: NextRequest) {
  const session = await requirePermission("E_OFFICE_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  await prisma.eofficeDocument.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
  return apiSuccess({ deleted: true });
}
