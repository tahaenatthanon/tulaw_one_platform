import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * Check if the current user is a System Admin (not Super Admin).
 * Used to enforce System Admin restrictions.
 */
async function isSystemAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  return maxLevel >= 80 && maxLevel < 100;
}

/**
 * Check if the current user is a Super Admin.
 */
async function isSuperAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  return maxLevel >= 100;
}

/**
 * Guard: System Admin cannot delete a Super Admin user.
 * Returns an error message if the operation is blocked, or null if allowed.
 */
export async function guardSystemAdminDeleteUser(targetUserId: string): Promise<string | null> {
  if (!(await isSystemAdmin())) return null; // Super Admin allowed, others handled by permissions

  // Check if target user is a Super Admin
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      userRoles: {
        where: { isActive: true },
        include: { role: true },
      },
    },
  });

  if (!targetUser) return "ไม่พบผู้ใช้ที่ต้องการลบ";

  const isTargetSuperAdmin = targetUser.userRoles.some(
    (ur) => ROLE_LEVELS[ur.role.roleCode as RoleCode] === 100
  );

  if (isTargetSuperAdmin) {
    return "ไม่สามารถลบผู้ใช้ที่มีสิทธิ์ Super Admin ได้";
  }

  return null;
}

/**
 * Guard: System Admin cannot change the role of a Super Admin user.
 * Returns an error message if the operation is blocked, or null if allowed.
 */
export async function guardSystemAdminChangeRole(targetUserId: string): Promise<string | null> {
  if (!(await isSystemAdmin())) return null;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: {
      userRoles: {
        where: { isActive: true },
        include: { role: true },
      },
    },
  });

  if (!targetUser) return "ไม่พบผู้ใช้ที่ต้องการแก้ไข";

  const isTargetSuperAdmin = targetUser.userRoles.some(
    (ur) => ROLE_LEVELS[ur.role.roleCode as RoleCode] === 100
  );

  if (isTargetSuperAdmin) {
    return "ไม่สามารถเปลี่ยนบทบาทของผู้ใช้ที่มีสิทธิ์ Super Admin ได้";
  }

  return null;
}

/**
 * Guard: System Admin cannot clear/truncate audit logs.
 * Only Super Admin can clear audit logs.
 * Returns an error message if the operation is blocked, or null if allowed.
 */
export async function guardClearAuditLog(): Promise<string | null> {
  if (!(await isSuperAdmin())) {
    return "เฉพาะ Super Admin เท่านั้นที่สามารถล้าง Audit Log ได้";
  }
  return null;
}

/**
 * Guard: Only Super Admin can manage certain system configurations.
 * System Admin has limited branding and policy access.
 */
export async function guardSystemConfigAdminOnly(): Promise<string | null> {
  if (!(await isSuperAdmin())) {
    return "เฉพาะ Super Admin เท่านั้นที่สามารถแก้ไขการตั้งค่านี้ได้";
  }
  return null;
}
