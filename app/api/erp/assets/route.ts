import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

// GET /api/erp/assets
export async function GET(req: NextRequest) {
  const session = await requirePermission("ERP_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);

  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { assetNo: { contains: search, mode: "insensitive" } }];
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.erpAsset.findMany({
      where: where as any, skip, take: limit, orderBy: { createdAt: "desc" },
      include: { depreciations: { orderBy: { year: "desc" }, take: 5 }, maintenances: { orderBy: { maintenanceDate: "desc" }, take: 5 } },
    }),
    prisma.erpAsset.count({ where: where as any }),
  ]);

  return apiSuccess(data, { total, page, limit });
}

// POST /api/erp/assets
export async function POST(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const body = await req.json();
  const { assetNo, name, purchaseValue, status } = body;
  if (!assetNo || !name) return apiError("VALIDATION", "กรุณากรอกชื่อและรหัสครุภัณฑ์");

  const asset = await prisma.erpAsset.create({
    data: { assetNo, name, purchaseValue: purchaseValue ?? 0, status: status ?? "active", createdBy: session.user.id },
  });

  return apiSuccess(asset);
}

// PUT /api/erp/assets
export async function PUT(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const body = await req.json();
  const { id, name, purchaseValue, status } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  const asset = await prisma.erpAsset.update({
    where: { id },
    data: { ...(name && { name }), ...(purchaseValue !== undefined && { purchaseValue }), ...(status && { status }), updatedBy: session.user.id },
  });

  return apiSuccess(asset);
}

// DELETE /api/erp/assets
export async function DELETE(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  await prisma.erpAsset.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
  return apiSuccess({ deleted: true });
}
