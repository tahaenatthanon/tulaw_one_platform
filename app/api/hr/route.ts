import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requirePermission("HR_VIEW");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์เข้าถึง", 403);
  const { page, limit, skip } = parsePagination(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
      const whereUser = { OR: [{ email: { contains: search, mode: "insensitive" } }, { firstNameTh: { contains: search, mode: "insensitive" } }, { lastNameTh: { contains: search, mode: "insensitive" } }] };
    const matchedUsers = await prisma.user.findMany({ where: whereUser as any, select: { id: true } });
    where.userId = { in: matchedUsers.map((u) => u.id) };
  }

  const [data, total] = await Promise.all([
    prisma.hrEmployeeProfile.findMany({ where: where as any, skip, take: limit, orderBy: { hireDate: "desc" }, include: { user: { select: { email: true, firstNameTh: true, lastNameTh: true } } } }),
    prisma.hrEmployeeProfile.count({ where: where as any }),
  ]);
  return apiSuccess(data, { total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await requirePermission("HR_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const body = await req.json();
  const { userId, employeeType, managerUserId, bankAccountNo } = body;
  if (!userId || !employeeType) return apiError("VALIDATION", "กรุณากรอกข้อมูลให้ครบถ้วน");
  const existing = await prisma.hrEmployeeProfile.findUnique({ where: { userId } });
  if (existing) return apiError("DUPLICATE", "บุคลากรนี้มีโปรไฟล์อยู่แล้ว");
  const profile = await prisma.hrEmployeeProfile.create({
    data: { userId, employeeType, managerUserId, bankAccountNo, hireDate: new Date(), createdBy: session.user.id },
  });
  return apiSuccess(profile);
}

export async function PUT(req: NextRequest) {
  const session = await requirePermission("HR_MANAGE");
  if (!session) return apiError("UNAUTHORIZED", "ไม่มีสิทธิ์จัดการ", 403);
  const body = await req.json();
  const { id, employeeType, managerUserId, bankAccountNo } = body;
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");
  const profile = await prisma.hrEmployeeProfile.update({
    where: { id }, data: { ...(employeeType && { employeeType }), ...(managerUserId && { managerUserId }), ...(bankAccountNo && { bankAccountNo }), updatedBy: session.user.id },
  });
  return apiSuccess(profile);
}
