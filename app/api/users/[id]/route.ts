import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "USERS_VIEW")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดูข้อมูลผู้ใช้", 403);
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        userRoles: {
          include: { role: true },
          where: { isActive: true },
        },
        userMfa: { select: { isEnabled: true, verifiedAt: true } },
        userSessions: {
          orderBy: { loginTime: "desc" },
          take: 10,
          select: {
            id: true, device: true, browser: true,
            ipAddress: true, loginTime: true, logoutTime: true,
            createdAt: true,
          },
        },
        loginHistories: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, status: true, ipAddress: true, createdAt: true },
        },
        auditLogs: {
          where: { module: { in: ["users", "auth"] } },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, action: true, module: true, createdAt: true },
        },
        adProfile: {
          select: { lastSyncAt: true },
        },
      },
    });

    if (!user) {
      return apiError("NOT_FOUND", "ไม่พบผู้ใช้", 404);
    }

    // Get effective permissions from role_permissions table
    const roleIds = user.userRoles.map(ur => ur.roleId);
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true },
    });

    const effectivePermissions = rolePermissions.map(rp => rp.permission.code);

    return apiSuccess({
      profile: {
        id: user.id,
        name: `${user.firstNameTh} ${user.lastNameTh}`,
        email: user.email,
        department: user.department?.name ?? null,
        authSource: user.authSource,
        status: user.status,
        mfaEnabled: user.userMfa.some(m => m.isEnabled),
        mfaVerifiedAt: user.userMfa.find(m => m.isEnabled)?.verifiedAt ?? null,
        lastAdSyncAt: user.adProfile?.lastSyncAt ?? user.lastAdSyncAt,
        lastLogin: user.loginHistories[0]?.createdAt ?? null,
        ipAddress: user.loginHistories[0]?.ipAddress ?? user.ipAddress,
        isLocked: user.isLocked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      roles: user.userRoles.map(ur => ({
        id: ur.roleId,
        name: ur.role.nameTh,
        code: ur.role.roleCode,
        level: ur.role.level,
      })),
      permissions: effectivePermissions,
      activity: [
        ...user.auditLogs.map(log => ({
          id: log.id,
          action: log.action,
          module: log.module,
          timestamp: log.createdAt,
        })),
        ...user.loginHistories.map(lh => ({
          id: lh.id,
          action: lh.status === "success" ? "Login" : "Login Failed",
          module: "auth",
          ipAddress: lh.ipAddress,
          timestamp: lh.createdAt,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20),
      sessions: user.userSessions.map(s => ({
        id: s.id,
        device: s.device ?? "Unknown",
        browser: s.browser ?? "Unknown",
        ipAddress: s.ipAddress,
        loginTime: s.loginTime,
        lastActivity: s.createdAt,
        status: s.logoutTime ? "ended" : "active",
      })),
    });
  } catch (e) {
    console.error("[GET /api/users/:id]", e);
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "USERS_DELETE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ลบผู้ใช้", 403);
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { department: true, userRoles: { include: { role: true } } },
    });
    if (!user) return apiError("NOT_FOUND", "ไม่พบผู้ใช้", 404);

    const oldSnapshot = {
      name: `${user.firstNameTh} ${user.lastNameTh}`,
      email: user.email,
      department: user.department?.name,
      status: user.status,
    };

    await prisma.user.delete({
      where: { id },
    });

    await logAction(session.user.id, "users", "USER_DELETE", {
      entityType: "User",
      entityId: id,
      oldValue: JSON.stringify(oldSnapshot),
      newValue: null,
    });

    return apiSuccess({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/users/:id]", e);
    return apiError("DB_ERROR", "ไม่สามารถลบผู้ใช้ได้");
  }
}
