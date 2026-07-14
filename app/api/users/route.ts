import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission, type RoleCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";
import { guardSystemAdminDeleteUser, guardSystemAdminChangeRole } from "@/lib/system-admin-guard";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "USERS_VIEW")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดูข้อมูลผู้ใช้", 403);
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    // Apply data scope
    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstNameTh: { contains: search } },
        { lastNameTh: { contains: search } },
      ];
    }
    if (status) where.status = status;

    // Department scope: Dept Admin sees only their department
    if (!scope.canSeeAllDepartments && scope.departmentId !== null) {
      where.departmentId = scope.departmentId;
    }

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

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "USERS_DELETE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ลบผู้ใช้", 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId) return apiError("VALIDATION", "กรุณาระบุ ID ผู้ใช้");

    // System Admin guard: cannot delete Super Admin
    const guardError = await guardSystemAdminDeleteUser(userId);
    if (guardError) return apiError("FORBIDDEN", guardError, 403);

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), deletedBy: session.user.id, status: "INACTIVE" },
    });

    return apiSuccess({ deleted: true });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถลบผู้ใช้ได้");
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "USERS_EDIT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์แก้ไขผู้ใช้", 403);
  }

  try {
    const body = await req.json();
    const { id, roleIds } = body;

    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID ผู้ใช้");

    // System Admin guard: cannot change role of Super Admin
    if (roleIds) {
      const guardError = await guardSystemAdminChangeRole(id);
      if (guardError) return apiError("FORBIDDEN", guardError, 403);
    }

    const updateData: Record<string, unknown> = { updatedBy: session.user.id };
    if (body.firstNameTh) updateData.firstNameTh = body.firstNameTh;
    if (body.lastNameTh) updateData.lastNameTh = body.lastNameTh;
    if (body.departmentId) updateData.departmentId = body.departmentId;
    if (body.status) updateData.status = body.status;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { department: true, userRoles: { include: { role: true } } },
    });

    return apiSuccess(user);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถแก้ไขผู้ใช้ได้");
  }
}
