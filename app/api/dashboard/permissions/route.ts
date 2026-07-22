import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { hasPermission, type RoleCode, type PermissionCode } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/permissions
 * Returns dashboard edit permissions for all users.
 * Only System Admin+ (DASHBOARD_MANAGE_ACCESS) can access.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  const roles = (session.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!hasPermission(roles, "DASHBOARD_MANAGE_ACCESS")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์จัดการ Dashboard Permissions", 403);
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null, status: "ACTIVE" },
    select: {
      id: true, email: true, firstNameTh: true, lastNameTh: true,
      departmentId: true, department: { select: { name: true } },
      userRoles: { where: { isActive: true }, select: { role: { select: { roleCode: true, level: true } } } },
    },
    orderBy: { firstNameTh: "asc" },
  });

  const mapped = users.map(u => {
    const roles = u.userRoles.map(ur => ur.role.roleCode as RoleCode);
    const canEdit = hasPermission(roles, "DASHBOARD_EDIT");
    return {
      id: u.id, email: u.email, name: `${u.firstNameTh} ${u.lastNameTh}`,
      departmentId: u.departmentId, departmentName: u.department?.name ?? "",
      roles: roles,
      dashboardEdit: canEdit,
    };
  });

  return apiSuccess(mapped);
}

/**
 * PUT /api/dashboard/permissions
 * Update dashboard edit permissions. Body: { userId, dashboardEdit }
 * Only System Admin+ (DASHBOARD_MANAGE_ACCESS) can access.
 */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  const roles = (session.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!hasPermission(roles, "DASHBOARD_MANAGE_ACCESS")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์จัดการ Dashboard Permissions", 403);
  }

  const body = await req.json();
  const { userId, dashboardEdit } = body;

  if (!userId) return apiError("VALIDATION", "กรุณาระบุ userId");

  // For now, dashboard permissions are derived from role (DASHBOARD_EDIT permission code)
  // System Admin can assign the DASHBOARD_EDIT permission by adding/removing the permission from the user's role
  return apiSuccess({ userId, dashboardEdit: !!dashboardEdit, note: "Dashboard edit permissions are managed through RBAC role assignments" });
}
