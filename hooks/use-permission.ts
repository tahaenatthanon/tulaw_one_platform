"use client";

import { useSession } from "next-auth/react";
import { hasPermission, type PermissionCode, type RoleCode } from "@/lib/permissions";

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
