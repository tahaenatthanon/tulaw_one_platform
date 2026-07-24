import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { join } from "node:path";
import { mkdir, writeFile, unlink, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { hasPermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์อัปโหลดโลโก้" } },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return apiError("VALIDATION", "ไม่พบไฟล์โลโก้ที่อัปโหลด");
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return apiError("VALIDATION", "ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ PNG, JPG, SVG หรือ WebP");
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiError("VALIDATION", "ขนาดไฟล์เกินกำหนด กรุณาเลือกไฟล์ขนาดไม่เกิน 2MB");
    }

    // Read old logo before replacing
    const oldConfig = await prisma.systemConfig.findUnique({
      where: { configKey: "branding.logoUrl" },
    });
    const oldLogoPath = oldConfig?.configValue;

    // Save file to disk
    const uploadDir = join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "png";
    const safeName = `logo-${Date.now()}.${ext.replace(/[^a-zA-Z0-9]/g, "")}`;
    const filePath = join(uploadDir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const logoUrl = `/uploads/logos/${safeName}`;

    // Save logo URL to SystemConfig
    await prisma.systemConfig.upsert({
      where: { configKey: "branding.logoUrl" },
      create: { configKey: "branding.logoUrl", configValue: logoUrl },
      update: { configValue: logoUrl },
    });

    // Log the action
    await logAction(session.user.id, "settings", "BRANDING_LOGO_UPLOAD", {
      entityType: "SystemConfig",
      entityId: "branding.logoUrl",
      oldValue: oldLogoPath ?? undefined,
      newValue: logoUrl,
    });

    // Clean up old logo file if it exists (skip default)
    if (oldLogoPath && oldLogoPath.startsWith("/uploads/logos/")) {
      try {
        const oldFilePath = join(process.cwd(), "public", oldLogoPath);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      } catch {
        // Cleanup failure is non-critical; log silently
        console.warn("[logo] Failed to clean up old logo:", oldLogoPath);
      }
    }

    return apiSuccess({ logoUrl, message: "อัปโหลดโลโก้สำเร็จ" });
  } catch (e) {
    console.error("[POST /api/settings/logo]", e);
    return apiError("SERVER_ERROR", "ไม่สามารถอัปโหลดโลโก้ได้");
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "SETTINGS_MANAGE")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ลบโลโก้" } },
      { status: 403 },
    );
  }

  try {
    const oldConfig = await prisma.systemConfig.findUnique({
      where: { configKey: "branding.logoUrl" },
    });

    // Delete config entry
    await prisma.systemConfig.deleteMany({ where: { configKey: "branding.logoUrl" } });

    // Delete file
    if (oldConfig?.configValue?.startsWith("/uploads/logos/")) {
      const filePath = join(process.cwd(), "public", oldConfig.configValue);
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch {
        console.warn("[logo] Failed to delete logo file:", oldConfig.configValue);
      }
    }

    await logAction(session.user.id, "settings", "BRANDING_LOGO_DELETE", {
      entityType: "SystemConfig",
      entityId: "branding.logoUrl",
      oldValue: oldConfig?.configValue ?? undefined,
      newValue: undefined,
    });

    return apiSuccess({ message: "ลบโลโก้สำเร็จ" });
  } catch (e) {
    console.error("[DELETE /api/settings/logo]", e);
    return apiError("SERVER_ERROR", "ไม่สามารถลบโลโก้ได้");
  }
}