"use client";

import { useSession } from "next-auth/react";
import { hasPermission, ROLE_LEVELS, type PermissionCode, type RoleCode } from "@/lib/permissions";

export type { PermissionCode, RoleCode } from "@/lib/permissions";

/**
 * Check if the current user's roles allow a specific permission.
 */
export function useHasPermission(permission: PermissionCode): boolean {
  const { data: session } = useSession();
  const roles = (session?.user as { roles?: string[] })?.roles ?? [];
  return hasPermission(roles, permission);
}

/**
 * Return list of user roles (sorted by level).
 */
export function useUserRoles(): RoleCode[] {
  const { data: session } = useSession();
  return ((session?.user as { roles?: string[] })?.roles ?? []) as RoleCode[];
}

/**
 * Get the current user's department ID.
 */
export function useUserDepartmentId(): number | null {
  const { data: session } = useSession();
  return (session?.user as { departmentId?: number | null })?.departmentId ?? null;
}

/**
 * Get the current user's ID.
 */
export function useUserId(): string {
  const { data: session } = useSession();
  return (session?.user as { id?: string })?.id ?? "";
}

/**
 * Get the highest role level for the current user.
 */
export function useRoleLevel(): number {
  const roles = useUserRoles();
  return Math.max(0, ...roles.map((r) => ROLE_LEVELS[r] ?? 0));
}

/**
 * Check if user is at or above a given role level.
 */
export function useHasMinRoleLevel(minLevel: number): boolean {
  return useRoleLevel() >= minLevel;
}

/**
 * Convenience: check if user is Super Admin (level 100).
 */
export function useIsSuperAdmin(): boolean {
  return useHasMinRoleLevel(100);
}

/**
 * Convenience: check if user is System Admin or higher (level >= 80).
 */
export function useIsSystemAdminOrHigher(): boolean {
  return useHasMinRoleLevel(80);
}

/**
 * Convenience: check if user is Dean or higher (level >= 70).
 */
export function useIsDeanOrHigher(): boolean {
  return useHasMinRoleLevel(70);
}

/**
 * Check multiple permissions — returns true if user has ANY.
 */
export function useHasAnyPermission(permissions: PermissionCode[]): boolean {
  const { data: session } = useSession();
  const roles = (session?.user as { roles?: string[] })?.roles ?? [];
  return permissions.some((p) => hasPermission(roles, p));
}

/**
 * Check multiple permissions — returns true if user has ALL.
 */
export function useHasAllPermissions(permissions: PermissionCode[]): boolean {
  const { data: session } = useSession();
  const roles = (session?.user as { roles?: string[] })?.roles ?? [];
  return permissions.every((p) => hasPermission(roles, p));
}
