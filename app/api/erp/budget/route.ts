import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

// GET /api/erp/budget — List budgets
export async function GET(req: NextRequest) {
  const session = await requirePermission("ERP_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);

  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const fiscalYear = searchParams.get("fiscalYear");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (fiscalYear) where.fiscalYear = Number(fiscalYear);
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.erpBudget.findMany({ where: where as any, skip, take: limit, orderBy: { createdAt: "desc" }, include: { transactions: { take: 5, orderBy: { transDate: "desc" } } } }),
    prisma.erpBudget.count({ where: where as any }),
  ]);

  return apiSuccess(data, { total, page, limit });
}

// POST /api/erp/budget — Create budget
export async function POST(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const body = await req.json();
  const { budgetCode, name, fiscalYear, totalAmount, category, department } = body;
  if (!budgetCode || !name || !fiscalYear || !totalAmount) {
    return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  const existing = await prisma.erpBudget.findUnique({ where: { budgetCode } });
  if (existing) return apiError("DUPLICATE", "รหัสงบประมาณนี้มีอยู่แล้ว");

  const budget = await prisma.erpBudget.create({
    data: { budgetCode, name, fiscalYear: Number(fiscalYear), totalAmount, category, department, createdBy: session.user.id },
  });

  return apiSuccess(budget);
}

// PUT /api/erp/budget — Update budget
export async function PUT(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const body = await req.json();
  const { id, name, totalAmount, category, department, status } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  const budget = await prisma.erpBudget.update({
    where: { id },
    data: { ...(name && { name }), ...(totalAmount && { totalAmount }), ...(category && { category }), ...(department && { department }), ...(status && { status }), updatedBy: session.user.id },
  });

  return apiSuccess(budget);
}

// DELETE /api/erp/budget — Soft delete budget
export async function DELETE(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  await prisma.erpBudget.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
  return apiSuccess({ deleted: true });
}
