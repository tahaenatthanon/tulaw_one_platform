import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission, type RoleCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";
import { guardSystemAdminDeleteUser, guardSystemAdminChangeRole } from "@/lib/system-admin-guard";
import { isLdapUser, canEditUser } from "@/lib/auth-source";
import { logAction } from "@/lib/audit-log";
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
    const authSource = searchParams.get("authSource");
    const mfa = searchParams.get("mfa");
    const department = searchParams.get("department");
    const lastLoginBefore = searchParams.get("lastLoginBefore");
    const lastLoginAfter = searchParams.get("lastLoginAfter");

    // Apply data scope
    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstNameTh: { contains: search } },
        { lastNameTh: { contains: search } },
        { authSource: { contains: search } },
        { department: { name: { contains: search } } },
        { userRoles: { some: { role: { nameTh: { contains: search } } } } },
        { userRoles: { some: { role: { roleCode: { contains: search } } } } },
      ];
    }
    if (status) where.status = status;
    if (authSource && authSource !== "all") where.authSource = authSource;
    if (mfa) {
      if (mfa === "enabled") where.userMfa = { some: { isEnabled: true } };
      else if (mfa === "disabled") where.OR = [...(where.OR as unknown[] || []), { userMfa: { none: {} } }, { userMfa: { every: { isEnabled: false } } }];
      else if (mfa === "pending") where.status = "MFA_PENDING";
    }
    if (department) where.departmentId = parseInt(department);

    // Department scope: Dept Admin sees only their department
    if (!scope.canSeeAllDepartments && scope.departmentId !== null) {
      where.departmentId = scope.departmentId;
    }

    // Role filter via userRoles
    const roleFilter: Record<string, unknown> | undefined = role ? { userRoles: { some: { role: { roleCode: role }, isActive: true } } } : undefined;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: { ...where, ...(roleFilter || {}) },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          department: true,
          userRoles: { include: { role: true }, where: { isActive: true } },
          userMfa: { select: { isEnabled: true } },
          loginHistories: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true, ipAddress: true } },
        },
      }),
      prisma.user.count({ where: { ...where, ...(roleFilter || {}) } }),
    ]);

    return apiSuccess(data, { total, page, limit });
  } catch (e) {
    console.error("[GET /api/users]", e);
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

    await logAction(session.user.id, "users", "USER_DELETE", { entityType: "User", entityId: userId });
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

    await logAction(session.user.id, "users", "USER_UPDATE", { entityType: "User", entityId: id });
    return apiSuccess(user);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถแก้ไขผู้ใช้ได้");
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email) {
    return apiError("FORBIDDEN", "ไม่ได้รับอนุญาต", 403);
  }

  try {
    const body = await req.json();
    const { action, userIds, roleId } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return apiError("VALIDATION", "กรุณาระบุ action และ userIds");
    }

    // Check permission per action
    const actionPermissionMap: Record<string, string> = {
      "assign-role": "USERS_BULK_ASSIGN_ROLE",
      enable: "USERS_BULK_ENABLE",
      disable: "USERS_BULK_DISABLE",
      unlock: "USERS_UNLOCK_ACCOUNT",
      "reset-mfa": "USERS_RESET_MFA",
    };

    const requiredPermission = actionPermissionMap[action];
    if (!requiredPermission || !hasPermission(roles, requiredPermission as Parameters<typeof hasPermission>[1])) {
      return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดำเนินการนี้", 403);
    }

    // System Admin guard: cannot operate on Super Admin
    const superAdminRole = await prisma.role.findUnique({ where: { roleCode: "super_admin" } });
    if (superAdminRole) {
      const superAdminIds = (await prisma.userRole.findMany({
        where: { userId: { in: userIds }, roleId: superAdminRole.id, isActive: true },
        select: { userId: true },
      })).map(ur => ur.userId);

      if (superAdminIds.length > 0 && !hasPermission(roles, "USERS_MANAGE_ROLES")) {
        return apiError("FORBIDDEN", "ไม่สามารถดำเนินการกับผู้ใช้ Super Admin ได้", 403);
      }
    }

    let result: Record<string, unknown>;

    switch (action) {
      case "assign-role": {
        if (!roleId) return apiError("VALIDATION", "กรุณาระบุ roleId");
        for (const uid of userIds) {
          await prisma.userRole.upsert({
            where: {
              userId_roleId: { userId: uid, roleId: parseInt(roleId) },
            },
            update: { isActive: true, updatedBy: session.user.id },
            create: { userId: uid, roleId: parseInt(roleId), isActive: true, createdBy: session.user.id },
          });
        }
        result = { message: `กำหนด Role ให้ ${userIds.length} รายการสำเร็จ` };
        break;
      }
      case "enable":
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "ACTIVE", isLocked: false, updatedBy: session.user.id },
        });
        result = { message: `เปิดใช้งาน ${userIds.length} รายการสำเร็จ` };
        break;
      case "disable":
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "INACTIVE", updatedBy: session.user.id },
        });
        result = { message: `ปิดใช้งาน ${userIds.length} รายการสำเร็จ` };
        break;
      case "unlock":
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { isLocked: false, updatedBy: session.user.id },
        });
        result = { message: `ปลดล็อกบัญชี ${userIds.length} รายการสำเร็จ` };
        break;
      case "reset-mfa":
        await prisma.userMfa.updateMany({
          where: { userId: { in: userIds } },
          data: { isEnabled: false, updatedBy: session.user.id },
        });
        await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { status: "MFA_PENDING", updatedBy: session.user.id },
        });
        result = { message: `รีเซ็ต MFA ${userIds.length} รายการสำเร็จ` };
        break;
      default:
        return apiError("VALIDATION", `ไม่รู้จัก action: ${action}`);
    }

    await logAction(session.user.id, "users", `BULK_${action.toUpperCase()}`, { entityType: "User", newValue: `${userIds.length} users` });
    return apiSuccess(result);
  } catch (e) {
    console.error("[PATCH /api/users]", e);
    return apiError("DB_ERROR", "ไม่สามารถดำเนินการได้");
  }
}
