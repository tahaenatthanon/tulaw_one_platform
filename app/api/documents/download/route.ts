import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, type RoleCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "DOCUMENTS_VIEW")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์ดาวน์โหลด" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { storageFile: true },
  });
  if (!doc || doc.deletedAt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Data scope check
  const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);
  if (!scope.canSeeAllDepartments) {
    if (doc.poolType === "personal" && doc.ownerUserId !== userId && !scope.canAccessOtherPersonalPools) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ดาวน์โหลด" }, { status: 403 });
    }
    if (doc.poolType === "department" && doc.departmentId !== scope.departmentId) {
      return NextResponse.json({ error: "ไม่มีสิทธิ์ดาวน์โหลด" }, { status: 403 });
    }
  }

  // Audit (non-fatal)
  try { await prisma.documentAudit.create({ data: { documentId: id, userId, action: "download" } }); } catch {}

  // Serve file from local filesystem
  const fullPath = join(process.cwd(), "public", doc.storageFile.path);
  if (!existsSync(fullPath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  const fileBuffer = readFileSync(fullPath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": doc.storageFile.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.storageFile.fileName)}"`,
      "Content-Length": String(doc.storageFile.fileSize),
    },
  });
}
