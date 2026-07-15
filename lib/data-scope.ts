import type { RoleCode } from "@/lib/permissions";
import { ROLE_LEVELS } from "@/lib/permissions";

/**
 * DataScope defines what data a user can access based on their role.
 */
export interface DataScope {
  /** Filter by department ID, or null for all departments */
  departmentId: number | null;
  /** Filter by owner/creator user ID, or null for all users */
  ownerUserId: string | null;
  /** Whether the user can see all records across all departments */
  canSeeAllDepartments: boolean;
  /** Whether the user can access personal pools of other users */
  canAccessOtherPersonalPools: boolean;
}

/**
 * Resolve the data scope for a given set of roles and user context.
 */
export function resolveDataScope(
  roles: RoleCode[],
  userDepartmentId: number | null,
  userId: string
): DataScope {
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r] ?? 0));

  // Super Admin (100), System Admin (80): see everything
  if (maxLevel >= 80) {
    return {
      departmentId: null,
      ownerUserId: null,
      canSeeAllDepartments: true,
      canAccessOtherPersonalPools: true,
    };
  }

  // Dean (70): see all departments, but limited personal pool access
  if (maxLevel >= 70) {
    return {
      departmentId: null,
      ownerUserId: null,
      canSeeAllDepartments: true,
      canAccessOtherPersonalPools: false,
    };
  }

  // Department Admin (50): own department only
  if (maxLevel >= 50) {
    return {
      departmentId: userDepartmentId,
      ownerUserId: null,
      canSeeAllDepartments: false,
      canAccessOtherPersonalPools: false,
    };
  }

  // User (30): own records + department data where permitted
  if (maxLevel >= 30) {
    return {
      departmentId: userDepartmentId,
      ownerUserId: userId,
      canSeeAllDepartments: false,
      canAccessOtherPersonalPools: false,
    };
  }

  // Viewer (10): public + explicitly authorized data only
  return {
    departmentId: userDepartmentId,
    ownerUserId: null,
    canSeeAllDepartments: false,
    canAccessOtherPersonalPools: false,
  };
}

/**
 * Build a Prisma WHERE clause for department-scoped queries.
 * Returns a where object that filters by department if the scope is limited.
 */
export function buildDepartmentWhere(
  scope: DataScope,
  departmentField: string = "departmentId"
): Record<string, unknown> {
  if (scope.canSeeAllDepartments) return {};
  if (scope.departmentId !== null) {
    return { [departmentField]: scope.departmentId };
  }
  return {};
}

/**
 * Build a Prisma WHERE clause for documents pool access.
 * Central pool is visible to all authenticated users.
 * Department pool is filtered by department scope.
 * Personal pool is filtered by owner scope.
 */
export function buildDocumentPoolWhere(
  scope: DataScope,
  requestedPool?: string | null
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (requestedPool) {
    where.poolType = requestedPool;
  }

  // For personal pool, limit to own documents unless scope allows all
  if (requestedPool === "personal" && !scope.canAccessOtherPersonalPools) {
    where.ownerUserId = scope.ownerUserId;
  }

  // For department pool, limit to own department unless scope allows all
  if (requestedPool === "department" && !scope.canSeeAllDepartments) {
    if (scope.departmentId !== null) {
      where.departmentId = scope.departmentId;
    }
  }

  return where;
}
