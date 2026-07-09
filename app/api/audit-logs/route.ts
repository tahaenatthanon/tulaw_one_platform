import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const module_ = searchParams.get("module") || "";
    const action = searchParams.get("action") || "";
    const userId = searchParams.get("userId") || "";

    const where: Record<string, unknown> = {};
    if (module_) where.module = { contains: module_ };
    if (action) where.action = { contains: action };
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, firstNameTh: true, lastNameTh: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return apiSuccess(data, { total, page, limit });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงบันทึกได้");
  }
}
