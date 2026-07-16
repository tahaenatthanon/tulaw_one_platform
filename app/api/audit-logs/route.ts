import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, parsePagination } from "@/lib/api-utils";
import { hasPermission, type RoleCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";
import { guardClearAuditLog } from "@/lib/system-admin-guard";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "AUDIT_LOG_VIEW")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดู Audit Log", 403);
  }

  const { searchParams } = new URL(req.url);

  // Check if export
  const format = searchParams.get("format");
  if (format === "csv" || format === "xlsx") {
    return handleExport(req, session, roles, departmentId, userId, format);
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const module_ = searchParams.get("module") || "";
    const action = searchParams.get("action") || "";
    const filterUserId = searchParams.get("userId") || "";
    const search = searchParams.get("search") || "";
    const eventType = searchParams.get("eventType") || "";
    const severity = searchParams.get("severity") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") || "desc";

    // Apply data scope
    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

    const where: Record<string, unknown> = {};
    if (module_) where.module = { contains: module_ };
    if (action) where.action = { contains: action };
    if (filterUserId) where.userId = filterUserId;
    if (eventType) where.action = eventType; // exact match for event type

    // Search across user name, module, action
    if (search) {
      where.OR = [
        { user: { firstNameTh: { contains: search } } },
        { user: { lastNameTh: { contains: search } } },
        { user: { email: { contains: search } } },
        { module: { contains: search } },
        { action: { contains: search } },
      ];
    }

    // Date range
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.gte = new Date(dateFrom);
      if (dateTo) createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
      where.createdAt = createdAt;
    }

    // Department scope
    if (!scope.canSeeAllDepartments && scope.departmentId !== null) {
      where.user = { departmentId: scope.departmentId };
    }

    // Severity (inferred from isSuccess)
    if (severity === "error") where.isSuccess = false;
    else if (severity === "success") where.isSuccess = true;

    // Validate sort column (whitelist)
    const allowedSort = ["createdAt", "module", "action", "isSuccess"];
    const orderBy: Record<string, string> = {};
    orderBy[allowedSort.includes(sortBy) ? sortBy : "createdAt"] = sortDir === "asc" ? "asc" : "desc";

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { email: true, firstNameTh: true, lastNameTh: true, department: { select: { name: true } } } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return apiSuccess(data, { total, page, limit });
  } catch (e) {
    console.error("[GET /api/audit-logs]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงบันทึกได้");
  }
}

async function handleExport(
  req: NextRequest,
  session: { user?: { email?: string | null; id?: string | null; roles?: string[] } | null },
  roles: string[], departmentId: number | null, userId: string, format: string
) {
  if (!hasPermission(roles, "AUDIT_LOG_EXPORT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ส่งออก Audit Log", 403);
  }
  try {
    const { searchParams } = new URL(req.url);
    // Reuse same filter logic
    const where = buildFilterWhere(req, roles, departmentId, userId);
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000, // max rows for export
      include: {
        user: { select: { email: true, firstNameTh: true, lastNameTh: true } },
      },
    });

    if (format === "csv") {
      const headers = ["Timestamp", "User", "Email", "Module", "Action", "IP Address", "Status", "Old Value", "New Value"];
      const rows = logs.map(l => [
        l.createdAt.toISOString(),
        `"${l.user?.firstNameTh ?? ""} ${l.user?.lastNameTh ?? ""}"`,
        l.user?.email ?? "",
        `"${l.module}"`,
        `"${l.action}"`,
        l.ipAddress ?? "",
        l.isSuccess ? "Success" : "Failed",
        `"${(l.oldValue ?? "").replace(/"/g, '""')}"`,
        `"${(l.newValue ?? "").replace(/"/g, '""')}"`,
      ].join(","));
      const bom = "\uFEFF";
      return new Response(bom + headers.join(",") + "\n" + rows.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Excel format — simple CSV with .xlsx extension (or use a proper lib)
    // For now, use same CSV but with xlsx content-type
    const headers = ["Timestamp", "User", "Email", "Module", "Action", "IP Address", "Status"];
    const rows = logs.map(l => [
      l.createdAt.toISOString().slice(0, 19),
      `${l.user?.firstNameTh ?? ""} ${l.user?.lastNameTh ?? ""}`,
      l.user?.email ?? "",
      l.module,
      l.action,
      l.ipAddress ?? "",
      l.isSuccess ? "Success" : "Failed",
    ].join("\t"));
    const bom = "\uFEFF";
    return new Response(bom + headers.join("\t") + "\n" + rows.join("\n"), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (e) {
    console.error("[Export audit-logs]", e);
    return apiError("DB_ERROR", "ไม่สามารถส่งออกข้อมูลได้");
  }
}

function buildFilterWhere(req: NextRequest, roles: string[], departmentId: number | null, userId: string): Record<string, unknown> {
  const { searchParams } = new URL(req.url);
  const module_ = searchParams.get("module") || "";
  const action = searchParams.get("action") || "";
  const filterUserId = searchParams.get("userId") || "";
  const eventType = searchParams.get("eventType") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

  const where: Record<string, unknown> = {};
  if (module_) where.module = { contains: module_ };
  if (action) where.action = { contains: action };
  if (filterUserId) where.userId = filterUserId;
  if (eventType) where.action = eventType;
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
    where.createdAt = createdAt;
  }
  if (!scope.canSeeAllDepartments && scope.departmentId !== null) {
    where.user = { departmentId: scope.departmentId };
  }
  return where;
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
