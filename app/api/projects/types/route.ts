import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";
import type { NextRequest } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  const types = await prisma.projectType.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true } });
  return apiSuccess(types);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  try {
    const { names } = await req.json();
    if (!Array.isArray(names)) return apiError("VALIDATION", "กรุณาระบุ names เป็น array");

    // Resolve existing types by name to avoid foreign key issues on delete
    const existing = await prisma.projectType.findMany({ select: { id: true, name: true } });
    const existingNames = new Set(existing.map(t => t.name));
    const newNames = new Set(names);

    // Delete types no longer in the list (only if no projects reference them)
    for (const t of existing) {
      if (!newNames.has(t.name)) {
        try { await prisma.projectType.delete({ where: { id: t.id } }); } catch { /* skip if referenced */ }
      }
    }

    // Add types not already existing
    for (const name of names) {
      if (!existingNames.has(name)) {
        await prisma.projectType.create({ data: { name } });
      }
    }

    const types = await prisma.projectType.findMany({ orderBy: { id: "asc" }, select: { id: true, name: true } });
    createAuditLog({
      userId: session.user.id, module: "PROJECTS", action: "TYPE_UPDATE", entityType: "ProjectType",
      oldValue: JSON.stringify(existing.map(t => t.name)), newValue: JSON.stringify(names),
    });
    return apiSuccess(types);
  } catch (e) {
    console.error("[PUT /api/projects/types]", e);
    return apiError("DB_ERROR", "ไม่สามารถแก้ไขประเภทโครงการได้");
  }
}
