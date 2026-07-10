import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requirePermission("SUPPORT_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);
  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }];
  if (status) where.status = status;
  if (priority) where.priority = priority;
  const [data, total] = await Promise.all([
    prisma.helpdeskTicket.findMany({ where: where as any, skip, take: limit, orderBy: { createdAt: "desc" }, include: { requester: { select: { email: true, firstNameTh: true, lastNameTh: true } }, histories: { take: 5, orderBy: { createdAt: "desc" } } } }),
    prisma.helpdeskTicket.count({ where: where as any }),
  ]);
  return apiSuccess(data, { total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await requirePermission("SUPPORT_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์", 403);
  const body = await req.json();
  const { title, description, priority, category } = body;
  if (!title || !description) return apiError("VALIDATION", "กรุณากรอกหัวข้อและรายละเอียด");
  const ticket = await prisma.helpdeskTicket.create({
    data: { requesterUserId: session.user.id, title, description, priority: priority ?? "medium", category: category ?? "general", createdBy: session.user.id },
  });
  return apiSuccess(ticket);
}

export async function PUT(req: NextRequest) {
  const session = await requirePermission("SUPPORT_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const body = await req.json();
  const { id, status, priority } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  const old = await prisma.helpdeskTicket.findUnique({ where: { id } });
  const ticket = await prisma.helpdeskTicket.update({ where: { id }, data: { ...(status && { status }), ...(priority && { priority }), updatedBy: session.user.id } });
  if (status && old?.status !== status) {
    await prisma.helpdeskTicketHistory.create({ data: { ticketId: id, oldStatus: old?.status ?? "", newStatus: status, createdBy: session.user.id } });
  }
  return apiSuccess(ticket);
}
