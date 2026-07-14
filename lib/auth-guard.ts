import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, ROLE_LEVELS, type PermissionCode, type RoleCode } from "@/lib/permissions";

export async function requirePermission(permission: PermissionCode) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, permission)) {
    return null;
  }
  return session;
}

/**
 * Require a minimum role level. Returns session if user meets the level, null otherwise.
 */
export async function requireMinRoleLevel(minLevel: number) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email) return null;
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  if (maxLevel < minLevel) return null;
  return session;
}

/**
 * Require Super Admin (level 100).
 */
export async function requireSuperAdmin() {
  return requireMinRoleLevel(100);
}

/**
 * Require System Admin or higher (level >= 80).
 */
export async function requireSystemAdmin() {
  return requireMinRoleLevel(80);
}

/**
 * Require Dean or higher (level >= 70).
 */
export async function requireDean() {
  return requireMinRoleLevel(70);
}

/**
 * Require Department Admin or higher (level >= 50).
 */
export async function requireDeptAdmin() {
  return requireMinRoleLevel(50);
}
