import type { RoleCode, PermissionCode } from "@/lib/permissions";
import { ROLE_LEVELS, ROLE_PERMISSIONS, hasPermission, isAdminOrHigher } from "@/lib/permissions";

export interface UserPermissionContext {
  userId: string;
  roles: RoleCode[];
  departmentId?: number | null;
}

/**
 * Check if a user has a specific permission code.
 * Combines role-level permission check with data scope awareness.
 */
export function checkPermission(
  user: UserPermissionContext | null | undefined,
  permission: PermissionCode
): boolean {
  if (!user) return false;
  return hasPermission(user.roles, permission);
}

/**
 * Get the highest role level for a user.
 */
export function getHighestRoleLevel(user: UserPermissionContext | null | undefined): number {
  if (!user?.roles?.length) return 0;
  return Math.max(0, ...user.roles.map((r) => ROLE_LEVELS[r] ?? 0));
}

/**
 * Check if user is at or above a given role level.
 */
export function hasMinRoleLevel(
  user: UserPermissionContext | null | undefined,
  minLevel: number
): boolean {
  return getHighestRoleLevel(user) >= minLevel;
}

/**
 * Convenience: check if user is Super Admin (level 100).
 */
export function isSuperAdmin(user: UserPermissionContext | null | undefined): boolean {
  return hasMinRoleLevel(user, 100);
}

/**
 * Convenience: check if user is System Admin or higher (level >= 80).
 */
export function isSystemAdminOrHigher(user: UserPermissionContext | null | undefined): boolean {
  return hasMinRoleLevel(user, 80);
}

/**
 * Convenience: check if user is Dean or higher (level >= 70).
 */
export function isDeanOrHigher(user: UserPermissionContext | null | undefined): boolean {
  return hasMinRoleLevel(user, 70);
}

/**
 * Convenience: check if user is Department Admin or higher (level >= 50).
 */
export function isDeptAdminOrHigher(user: UserPermissionContext | null | undefined): boolean {
  return hasMinRoleLevel(user, 50);
}

/**
 * Build a UserPermissionContext from a NextAuth session.
 */
export function getUserPermissionContext(session: {
  user?: { id?: string; roles?: string[]; departmentId?: number | null };
} | null): UserPermissionContext | null {
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    roles: (session.user.roles ?? []) as RoleCode[],
    departmentId: (session.user as { departmentId?: number | null }).departmentId ?? null,
  };
}

// Re-export for convenience
export { hasPermission, isAdminOrHigher, ROLE_LEVELS, ROLE_PERMISSIONS };
export type { RoleCode, PermissionCode };
