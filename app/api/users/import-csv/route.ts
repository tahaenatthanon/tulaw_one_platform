import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAction } from "@/lib/audit-log";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "USERS_BULK_IMPORT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์นำเข้า CSV", 403);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return apiError("VALIDATION", "กรุณาอัปโหลดไฟล์ CSV");

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return apiError("VALIDATION", "ไฟล์ต้องมีขนาดไม่เกิน 5MB");
    }

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return apiError("VALIDATION", "ไฟล์ CSV ไม่มีข้อมูล");

    // Parse headers
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const emailIdx = headers.indexOf("email");
    const roleIdx = headers.indexOf("role");

    if (emailIdx === -1) return apiError("VALIDATION", "ไม่พบคอลัมน์ email ในไฟล์ CSV");

    // Validate row count (max 500)
    const dataRows = lines.slice(1);
    if (dataRows.length > 500) {
      return apiError("VALIDATION", "จำนวนแถวต้องไม่เกิน 500 แถวต่อครั้ง");
    }

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const cols = dataRows[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const email = cols[emailIdx]?.trim();
      if (!email) { skipped++; continue; }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) { skipped++; continue; }

      // Only update role if provided
      if (roleIdx !== -1 && cols[roleIdx]) {
        const roleCode = cols[roleIdx].trim().toLowerCase();
        const role = await prisma.role.findUnique({ where: { roleCode } });
        if (role) {
          await prisma.userRole.upsert({
            where: { userId_roleId: { userId: user.id, roleId: role.id } },
            update: { isActive: true, updatedBy: session.user.id },
            create: { userId: user.id, roleId: role.id, isActive: true, createdBy: session.user.id },
          });
          updated++;
        } else {
          errors.push(`แถวที่ ${i + 2}: ไม่พบ Role "${cols[roleIdx]}"`);
        }
      }
    }

    await logAction(session.user.id, "import-export", "CSV_IMPORT", { entityType: "User", newValue: `${updated} updated, ${skipped} skipped` });
    return apiSuccess({
      message: `อัปเดต ${updated} รายการ, ข้าม ${skipped} รายการ`,
      updated,
      skipped,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (e) {
    console.error("[POST /api/users/import-csv]", e);
    return apiError("DB_ERROR", "ไม่สามารถนำเข้า CSV ได้");
  }
}
