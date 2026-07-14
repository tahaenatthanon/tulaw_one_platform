import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, parsePagination } from "@/lib/api-utils";
import { hasPermission, ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import { resolveDataScope, buildDepartmentWhere } from "@/lib/data-scope";
import { guardClearAuditLog } from "@/lib/system-admin-guard";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "AUDIT_LOG_VIEW")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ดู Audit Log" } }, { status: 403 });
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const module_ = searchParams.get("module") || "";
    const action = searchParams.get("action") || "";
    const filterUserId = searchParams.get("userId") || "";

    // Apply data scope: Dept Admin sees only their department's audit logs
    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);
    const deptWhere = buildDepartmentWhere(scope);

    const where: Record<string, unknown> = {};
    if (module_) where.module = { contains: module_ };
    if (action) where.action = { contains: action };
    if (filterUserId) where.userId = filterUserId;

    // Apply department scope via user relation
    if (!scope.canSeeAllDepartments && scope.departmentId !== null) {
      where.user = { departmentId: scope.departmentId };
    }

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

/**
 * DELETE /api/audit-logs — Clear/truncate all audit logs.
 * Only Super Admin can clear audit logs.
 * Individual audit log entries are immutable and cannot be deleted.
 */
export async function DELETE() {
  const guardError = await guardClearAuditLog();
  if (guardError) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: guardError } }, { status: 403 });
  }

  try {
    // Soft-delete all audit logs (mark as deleted rather than actually removing)
    await prisma.auditLog.updateMany({
      where: { deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return apiSuccess({ cleared: true, message: "ล้าง Audit Log สำเร็จ" });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถล้าง Audit Log ได้");
  }
}
