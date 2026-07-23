import { getServerSession } from "next-auth";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { ROLE_PERMISSIONS, type RoleCode } from "@/lib/permissions";
import type { NextRequest } from "next/server";

// Module groups mapped to sidebar order: Dashboard, App Hub, Intranet, Book Meeting, Documents, Projects, Users & Roles, Audit Log, Settings
const MODULE_MAP: Record<string, { module: string; actions: string[] }> = {
  DASHBOARD:    { module: "dashboard",    actions: ["view", "manage", "edit", "manage_access"] },
  APPLICATION_HUB: { module: "application_hub", actions: ["view", "manage", "pin"] },
  INTRANET:     { module: "intranet",     actions: ["view", "create", "edit", "delete", "publish"] },
  BOOK_MEETING: { module: "book_meeting", actions: ["view", "create", "edit", "delete", "approve"] },
  DOCUMENTS:    { module: "documents",    actions: ["view", "upload", "edit", "delete", "share", "manage_pool"] },
  PROJECTS:     { module: "projects",     actions: ["view", "create", "edit", "delete", "approve", "manage_all"] },
  USERS:        { module: "users",        actions: ["view", "create", "edit", "delete", "manage_roles", "manage_permissions", "ad_sync", "bulk_import", "bulk_assign_role", "bulk_enable", "bulk_disable", "unlock_account", "reset_mfa", "export_selected"] },
  AUDIT_LOG:    { module: "audit_log",    actions: ["view", "export", "manage"] },
  SETTINGS:     { module: "settings",     actions: ["view", "manage", "api_keys", "branding", "notification", "sso"] },
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") as RoleCode | null;

    if (role && ROLE_PERMISSIONS[role]) {
      // Return permissions for a single role
      return apiSuccess(groupPermissions(ROLE_PERMISSIONS[role]));
    }

    // Return all roles' permissions
    const all: Record<string, Record<string, string[]>> = {};
    for (const [roleCode, perms] of Object.entries(ROLE_PERMISSIONS)) {
      all[roleCode] = groupPermissions(perms);
    }
    return apiSuccess(all);
  } catch (e) {
    console.error("[GET /api/permissions]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลสิทธิ์ได้");
  }
}

function groupPermissions(permList: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const perm of permList) {
    // Extract prefix (e.g., "DASHBOARD_VIEW" → module="DASHBOARD", action="VIEW")
    const idx = perm.indexOf("_");
    if (idx === -1) continue;
    const prefix = perm.substring(0, idx);
    const action = perm.substring(idx + 1).toLowerCase();
    const mapped = MODULE_MAP[prefix];
    if (!mapped) continue;
    if (!result[mapped.module]) result[mapped.module] = [];
    result[mapped.module].push(action);
  }
  return result;
}
