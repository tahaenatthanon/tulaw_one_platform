import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

// GET /api/erp/purchase-requests
export async function GET(req: NextRequest) {
  const session = await requirePermission("ERP_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);

  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (search) where.prNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.erpPurchaseRequest.findMany({
      where: where as any, skip, take: limit, orderBy: { createdAt: "desc" },
      include: { items: true, requester: { select: { email: true, firstNameTh: true, lastNameTh: true } } },
    }),
    prisma.erpPurchaseRequest.count({ where: where as any }),
  ]);

  return apiSuccess(data, { total, page, limit });
}

// POST /api/erp/purchase-requests
export async function POST(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const body = await req.json();
  const { prNo, requesterUserId, items } = body;
  if (!prNo || !requesterUserId || !items?.length) return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");

  const totalAmount = items.reduce((sum: number, i: { quantity: number; unitPrice: number }) => sum + i.quantity * i.unitPrice, 0);

  const pr = await prisma.erpPurchaseRequest.create({
    data: {
      prNo, requesterUserId, totalAmount,
      items: { create: items.map((i: { itemName: string; quantity: number; unitPrice: number }) => ({ itemName: i.itemName, quantity: i.quantity, unitPrice: i.unitPrice })) },
      createdBy: session.user.id,
    },
    include: { items: true },
  });

  return apiSuccess(pr);
}

// PUT /api/erp/purchase-requests
export async function PUT(req: NextRequest) {
  const session = await requirePermission("ERP_APPROVE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์อนุมัติ", 403);

  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return apiError("VALIDATION", "กรุณาระบุ ID และสถานะ");

  const pr = await prisma.erpPurchaseRequest.update({
    where: { id }, data: { status, updatedBy: session.user.id },
    include: { items: true },
  });

  return apiSuccess(pr);
}

// DELETE /api/erp/purchase-requests
export async function DELETE(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  await prisma.erpPurchaseRequest.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
  return apiSuccess({ deleted: true });
}
