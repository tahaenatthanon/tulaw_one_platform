import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { hasPermission, ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";

const DEFAULTS: Record<string, unknown> = {
  "auth.sessionTimeout": "28800",
  "auth.jwtExpiry": "3600",
  "auth.maxLoginAttempts": "5",
  "auth.mfaEnforced": "true",
  "sso.ldapUrl": "ldap://dc.tulaw.ac.th:389",
  "sso.baseDn": "DC=tulaw,DC=ac,DC=th",
  "sso.domain": "tulaw.ac.th",
  "sso.syncInterval": "15",
  "sso.enabled": "true",
  "branding.name": "TULAW ONE",
  "branding.color": "#A31D1D",
  "storage.quota": "5",
  "storage.fileTypes": JSON.stringify(["PDF", "XLSX", "PPTX", "DOCX", "PNG", "JPG"]),
};

function parseValue(key: string, val: string) {
  if (key.includes("fileTypes") || key.includes("annCats") || key.includes("projCats") || key.includes("projectTypes")) {
    try { return JSON.parse(val); } catch { return val; }
  }
  if (val === "true") return true;
  if (val === "false") return false;
  if (/^\d+$/.test(val)) return val;
  return val;
}

function buildSettingsObject(rows: Array<{ configKey: string; configValue: string }>) {
  const result: Record<string, unknown> = {};
  for (const r of rows) result[r.configKey] = parseValue(r.configKey, r.configValue);
  // Fill defaults for missing keys
  for (const [key, val] of Object.entries(DEFAULTS)) {
    if (!(key in result)) result[key] = parseValue(key, val as string);
  }
  // Group by section
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const [key, val] of Object.entries(result)) {
    const [section, ...rest] = key.split(".");
    if (!grouped[section]) grouped[section] = {};
    grouped[section][rest.join(".")] = val;
  }
  return grouped;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_VIEW")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ดูการตั้งค่า" } }, { status: 403 });
  }

  try {
    const rows = await prisma.systemConfig.findMany();
    const settings = buildSettingsObject(rows);
    return apiSuccess(settings);
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงการตั้งค่าได้");
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  try {
    const { section, key, value } = await req.json();
    if (!section || !key) return apiError("VALIDATION", "กรุณาระบุ section และ key");

    const configKey = `${section}.${key}`;
    const val = typeof value === "string" ? value : JSON.stringify(value);

    await prisma.systemConfig.upsert({
      where: { configKey },
      create: { configKey, configValue: val },
      update: { configValue: val },
    });

    // Audit log (non-fatal)
    logAction(session.user.id, "settings", "CONFIG_UPDATE", { entityType: "SystemConfig", entityId: configKey, newValue: key });

    return apiSuccess({ section, key, updated: true });
  } catch (e) {
    console.error("[PATCH /api/settings]", e);
    return apiError("DB_ERROR", "ไม่สามารถแก้ไขการตั้งค่าได้");
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์แก้ไขการตั้งค่า" } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const userId = (session.user as { id?: string }).id || "";

    // Flatten the grouped settings object to key-value pairs
    const entries: Array<{ key: string; value: string }> = [];
    for (const [section, values] of Object.entries(body)) {
      if (typeof values !== "object" || !values) continue;
      for (const [k, v] of Object.entries(values as Record<string, unknown>)) {
        // Only Super Admin can modify auth
        if (section === "auth" && maxLevel < 100) continue;
        entries.push({ key: `${section}.${k}`, value: typeof v === "string" ? v : JSON.stringify(v) });
      }
    }

    if (entries.length === 0) return apiSuccess({ message: "No changes to save" });

    // Upsert all entries
    for (const { key, value } of entries) {
      await prisma.systemConfig.upsert({
        where: { configKey: key },
        update: { configValue: value },
        create: { configKey: key, configValue: value },
      });
    }

    // Update CSS variables if branding changed
    if (body.branding?.color) {
      try {
        const cssPath = join(process.cwd(), "app", "globals.css");
        if (existsSync(cssPath)) {
          let css = readFileSync(cssPath, "utf-8");
          const color = body.branding.color as string;
          // Update primary color and derived shades
          const darken = (hex: string, amt: number) => {
            const num = parseInt(hex.replace("#", ""), 16);
            const r = Math.max(0, ((num >> 16) & 0xFF) - amt);
            const g = Math.max(0, ((num >> 8) & 0xFF) - amt);
            const b = Math.max(0, (num & 0xFF) - amt);
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
          };
          const lighten = (hex: string) => {
            const num = parseInt(hex.replace("#", ""), 16);
            const r = Math.min(255, ((num >> 16) & 0xFF) + 60);
            const g = Math.min(255, ((num >> 8) & 0xFF) + 60);
            const b = Math.min(255, (num & 0xFF) + 60);
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
          };
          css = css.replace(/--tu-primary:\s*#[0-9A-Fa-f]+/, `--tu-primary: ${color}`);
          css = css.replace(/--tu-primary-hover:\s*#[0-9A-Fa-f]+/, `--tu-primary-hover: ${darken(color, 30)}`);
          css = css.replace(/--tu-primary-active:\s*#[0-9A-Fa-f]+/, `--tu-primary-active: ${darken(color, 50)}`);
          css = css.replace(/--tu-primary-soft:\s*#[0-9A-Fa-f]+/, `--tu-primary-soft: ${lighten(color)}`);
          writeFileSync(cssPath, css);
        }
      } catch (cssErr) {
        console.error("[settings] CSS update failed:", cssErr);
      }
    }

    await logAction(session.user.id, "settings", "CONFIG_UPDATE", {
      entityType: "SystemConfig", newValue: `${entries.length} settings updated`,
    });

    // Re-read and return
    const rows = await prisma.systemConfig.findMany();
    return apiSuccess(buildSettingsObject(rows));
  } catch (e) {
    console.error("[PUT /api/settings]", e);
    return apiError("DB_ERROR", "ไม่สามารถบันทึกการตั้งค่าได้");
  }
}
