import { prisma } from "@/lib/prisma";

interface CreateAuditLogParams {
  userId?: string | null;
  module: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  isSuccess?: boolean;
  userAgent?: string | null;
}

/**
 * Create an audit log entry. This is the ONLY way to write to the AuditLog table.
 * Audit logs are append-only and immutable — no update or delete endpoint exists.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        module: params.module,
        action: params.action,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        oldValue: params.oldValue ?? null,
        newValue: params.newValue ?? null,
        ipAddress: params.ipAddress ?? null,
        isSuccess: params.isSuccess ?? true,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (e) {
    console.error("[createAuditLog] Failed:", e);
    // Never throw — audit logging must not break the main flow
  }
}

/**
 * Shorthand to log a successful action.
 */
export async function logAction(
  userId: string | undefined,
  module: string,
  action: string,
  detail?: { entityType?: string; entityId?: string; oldValue?: string; newValue?: string; ipAddress?: string }
): Promise<void> {
  return createAuditLog({
    userId: userId ?? null,
    module,
    action,
    entityType: detail?.entityType ?? null,
    entityId: detail?.entityId ?? null,
    oldValue: detail?.oldValue ?? null,
    newValue: detail?.newValue ?? null,
    ipAddress: detail?.ipAddress ?? null,
    isSuccess: true,
  });
}

/**
 * Shorthand to log a failed action.
 */
export async function logFailedAction(
  userId: string | undefined,
  module: string,
  action: string,
  ipAddress?: string
): Promise<void> {
  return createAuditLog({
    userId: userId ?? null,
    module,
    action,
    ipAddress: ipAddress ?? null,
    isSuccess: false,
  });
}
