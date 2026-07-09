import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstNameTh: { contains: search } },
        { lastNameTh: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { department: true, userRoles: { include: { role: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess(data, { total, page, limit });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
  }
}
