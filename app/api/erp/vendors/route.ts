import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

// GET /api/erp/vendors
export async function GET(req: NextRequest) {
  const session = await requirePermission("ERP_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);

  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [{ companyName: { contains: search, mode: "insensitive" } }, { taxId: { contains: search, mode: "insensitive" } }];
  }

  const [data, total] = await Promise.all([
    prisma.erpVendor.findMany({ where: where as any, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.erpVendor.count({ where: where as any }),
  ]);

  return apiSuccess(data, { total, page, limit });
}

// POST /api/erp/vendors
export async function POST(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const body = await req.json();
  const { taxId, companyName } = body;
  if (!taxId || !companyName) return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");

  const existing = await prisma.erpVendor.findUnique({ where: { taxId } });
  if (existing) return apiError("DUPLICATE", "เลขประจำตัวผู้เสียภาษีนี้มีอยู่แล้ว");

  const vendor = await prisma.erpVendor.create({
    data: { taxId, companyName, createdBy: session.user.id },
  });

  return apiSuccess(vendor);
}

// PUT /api/erp/vendors
export async function PUT(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const body = await req.json();
  const { id, taxId, companyName } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  const vendor = await prisma.erpVendor.update({
    where: { id },
    data: { ...(taxId && { taxId }), ...(companyName && { companyName }), updatedBy: session.user.id },
  });

  return apiSuccess(vendor);
}

// DELETE /api/erp/vendors
export async function DELETE(req: NextRequest) {
  const session = await requirePermission("ERP_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  await prisma.erpVendor.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: session.user.id } });
  return apiSuccess({ deleted: true });
}
