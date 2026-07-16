import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import type { NextRequest } from "next/server";

function detectOS(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ios/i.test(ua)) return "iOS";
  return "Unknown";
}

function detectBrowser(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Unknown";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "AUDIT_LOG_VIEW")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดู Audit Log", 403);
  }

  try {
    const { id } = await params;
    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstNameTh: true,
            lastNameTh: true,
            authSource: true,
            department: { select: { name: true } },
            userRoles: {
              where: { isActive: true },
              select: { role: { select: { nameTh: true, roleCode: true } } },
              take: 1,
            },
          },
        },
      },
    });

    if (!log) return apiError("NOT_FOUND", "ไม่พบรายการ", 404);

    const user = log.user;
    const primaryRole = user?.userRoles?.[0]?.role;
    const os = detectOS(log.userAgent);
    const browser = detectBrowser(log.userAgent);

    return apiSuccess({
      general: {
        logId: log.id,
        timestamp: log.createdAt,
        eventType: log.action,
        module: log.module,
        action: log.action,
        status: log.isSuccess ? "Success" : "Failed",
      },
      user: user ? {
        userId: user.id,
        name: `${user.firstNameTh} ${user.lastNameTh}`,
        email: user.email,
        role: primaryRole?.nameTh ?? "N/A",
        roleCode: primaryRole?.roleCode ?? "N/A",
        department: user.department?.name ?? "N/A",
      } : {
        userId: "N/A", name: "System", email: "N/A",
        role: "N/A", roleCode: "N/A", department: "N/A",
      },
      targetResource: {
        objectType: log.entityType || "N/A",
        recordId: log.entityId || "N/A",
      },
      changeHistory: {
        beforeValue: log.oldValue || null,
        afterValue: log.newValue || null,
        hasChanges: !!(log.oldValue || log.newValue),
      },
      requestInfo: {
        ipAddress: log.ipAddress || "N/A",
        userAgent: log.userAgent || "N/A",
        browser: browser,
        operatingSystem: os,
        device: log.device || "N/A",
        sessionId: "N/A",
        requestId: log.requestId || "N/A",
        apiEndpoint: "N/A",
        httpMethod: "N/A",
      },
      additionalInfo: {
        errorMessage: log.isSuccess ? null : (log.newValue || log.oldValue || "Unknown error"),
        authMethod: user?.authSource === "local" ? "Local" : "LDAP",
        duration: null,
        correlationId: log.correlationId || "N/A",
        statusCode: log.statusCode || (log.isSuccess ? 200 : 500),
      },
    });
  } catch (e) {
    console.error("[GET /api/audit-logs/:id]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลได้");
  }
}

// No PUT, PATCH, or DELETE — audit logs are immutable
