import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { hasPermission, type RoleCode } from "@/lib/permissions";
import { guardSystemConfigAdminOnly } from "@/lib/system-admin-guard";
import type { NextRequest } from "next/server";

// In-memory settings store (since no dedicated settings model yet)
// In production, this would use a SystemSetting model with JSONB
const settingsStore: Record<string, Record<string, unknown>> = {
  auth: {
    sessionTimeout: "28800",
    jwtExpiry: "3600",
    maxLoginAttempts: "5",
    mfaEnforced: true,
  },
  sso: {
    ldapUrl: "ldap://dc.tulaw.ac.th:389",
    baseDn: "DC=tulaw,DC=ac,DC=th",
    domain: "tulaw.ac.th",
    syncInterval: "15",
    enabled: true,
  },
  branding: {
    name: "TULAW ONE",
    color: "#A31D1D",
  },
  storage: {
    quota: "5",
    fileTypes: ["PDF", "XLSX", "PPTX", "DOCX", "PNG", "JPG"],
    projectTypes: ["วิชาการ", "หลักสูตร", "สัมมนา", "วิจัย", "IT", "งบประมาณ"],
  },
  apiKeys: [] as Array<{ id: string; name: string; key: string; permissions: string; createdAt: string; lastUsed: string }>,
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_VIEW")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ดูการตั้งค่า", 403);
  }

  const { searchParams } = new URL(req.url);
  const module = searchParams.get("module");

  if (module && settingsStore[module]) {
    return apiSuccess({ [module]: settingsStore[module] });
  }

  return apiSuccess(settingsStore);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์แก้ไขการตั้งค่า", 403);
  }

  try {
    const { module, ...data } = await req.json();

    if (!module || !settingsStore[module]) {
      return apiError("VALIDATION", "ระบุ module ไม่ถูกต้อง");
    }

    // System Admin cannot modify auth (immutable policies) or branding
    if (module === "auth" || module === "branding") {
      const guardError = await guardSystemConfigAdminOnly();
      if (guardError) return apiError("FORBIDDEN", guardError, 403);
    }

    settingsStore[module] = { ...settingsStore[module], ...data };
    return apiSuccess({ [module]: settingsStore[module] });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถบันทึกการตั้งค่าได้");
  }
}
