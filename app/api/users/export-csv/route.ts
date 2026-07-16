import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission, type RoleCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";
import { logAction } from "@/lib/audit-log";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "USERS_BULK_IMPORT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ส่งออก CSV", 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const selectedIds = searchParams.get("ids")?.split(",").filter(Boolean);

    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

    const where: Record<string, unknown> = {};
    if (selectedIds && selectedIds.length > 0) {
      where.id = { in: selectedIds };
    }
    if (!scope.canSeeAllDepartments && scope.departmentId !== null) {
      where.departmentId = scope.departmentId;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        department: true,
        userRoles: { include: { role: true }, where: { isActive: true } },
        userMfa: { select: { isEnabled: true } },
        loginHistories: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true, ipAddress: true } },
        adProfile: { select: { lastSyncAt: true } },
      },
    });

    // Build CSV
    const headers = [
      "Name", "Email", "Authentication Source", "Role", "Department",
      "Status", "MFA", "Last AD Sync", "Last Login", "IP Address",
    ];
    const rows = users.map(u => {
      const lastLogin = u.loginHistories[0];
      const primaryRole = u.userRoles.length > 0 ? u.userRoles[0] : null;
      return [
        `"${u.firstNameTh} ${u.lastNameTh}"`,
        u.email,
        u.authSource?.toUpperCase() ?? "LDAP",
        primaryRole?.role.nameTh ?? "-",
        u.department?.name ?? "-",
        u.status,
        u.userMfa.some(m => m.isEnabled) ? "Enabled" : "Disabled",
        u.adProfile?.lastSyncAt ? formatDate(u.adProfile.lastSyncAt) : (u.lastAdSyncAt ? formatDate(u.lastAdSyncAt) : "-"),
        lastLogin?.createdAt ? formatDate(lastLogin.createdAt) : "-",
        lastLogin?.ipAddress ?? u.ipAddress ?? "-",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM for Excel Thai support

    await logAction(session.user.id, "import-export", "CSV_EXPORT", { entityType: "User", newValue: `${users.length} users exported` });
    return new Response(bom + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    console.error("[GET /api/users/export-csv]", e);
    return apiError("DB_ERROR", "ไม่สามารถส่งออก CSV ได้");
  }
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = d.getDate().toString().padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${mins}`;
}
