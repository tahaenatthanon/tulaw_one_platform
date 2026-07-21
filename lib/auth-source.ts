import type { User } from "@prisma/client";

export type AuthSource = "ldap" | "local" | "azure";

/**
 * Check if a user is an LDAP user (synced from Active Directory).
 */
export function isLdapUser(user: { authSource?: string | null }): boolean {
  return user.authSource === "ldap";
}

/**
 * Check if a user is a local user (development/emergency admin).
 */
export function isLocalUser(user: { authSource?: string | null }): boolean {
  return user.authSource === "local";
}

/**
 * Check if a user is an Azure AD user.
 */
export function isAzureUser(user: { authSource?: string | null }): boolean {
  return user.authSource === "azure";
}

/**
 * Get the display label for the authentication source.
 */
export function getAuthSourceLabel(
  authSource: string | null | undefined
): string {
  if (authSource === "local") return "Local";
  if (authSource === "azure") return "Azure AD";
  if (authSource === "ldap") return "LDAP";
  return "LDAP";
}

/**
 * Determine if a user can be edited (only local users can be edited directly).
 * Azure AD users' core profile is read-only (source of truth is Azure AD).
 * LDAP users' core profile is read-only (source of truth is Active Directory).
 */
export function canEditUser(
  user: { authSource?: string | null }
): boolean {
  return isLocalUser(user);
}

/**
 * Determine if the "Edit" action should be shown for a user in the Action Menu.
 */
export function shouldShowEditAction(
  user: { authSource?: string | null }
): boolean {
  return isLocalUser(user);
}
