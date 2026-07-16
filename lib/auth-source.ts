import type { User } from "@prisma/client";

export type AuthSource = "ldap" | "local";

/**
 * Check if a user is an LDAP user (synced from Active Directory).
 */
export function isLdapUser(user: { authSource?: string | null }): boolean {
  return user.authSource === "ldap" || (!user.authSource);
}

/**
 * Check if a user is a local user (development/emergency admin).
 */
export function isLocalUser(user: { authSource?: string | null }): boolean {
  return user.authSource === "local";
}

/**
 * Get the display label for the authentication source.
 */
export function getAuthSourceLabel(authSource: string | null | undefined): string {
  if (authSource === "local") return "Local";
  return "LDAP";
}

/**
 * Determine if a user can be edited (only local users can be edited directly).
 */
export function canEditUser(user: { authSource?: string | null }): boolean {
  return isLocalUser(user);
}

/**
 * Determine if the "Edit" action should be shown for a user in the Action Menu.
 */
export function shouldShowEditAction(user: { authSource?: string | null }): boolean {
  return isLocalUser(user);
}
