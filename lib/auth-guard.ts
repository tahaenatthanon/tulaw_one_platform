import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, type PermissionCode } from "@/lib/permissions";

export async function requirePermission(permission: PermissionCode) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, permission)) {
    return null;
  }
  return session;
}
