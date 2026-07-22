import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit-log";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  const doc = await prisma.document.findUnique({
    where: { id },
    include: { storageFile: { select: { fileName: true, mimeType: true, fileSize: true, path: true } } },
  });

  if (!doc || doc.deletedAt) return apiError("NOT_FOUND", "ไม่พบเอกสาร");

  const filePath = join(process.cwd(), "public", doc.storageFile.path);
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    return apiError("NOT_FOUND", "ไม่พบไฟล์ในระบบ");
  }

  // Audit log (non-fatal)
  createAuditLog({ userId: session.user.id, module: "DOCUMENTS", action: "DOC_DOWNLOAD", entityType: "Document", entityId: id });

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": doc.storageFile.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.storageFile.fileName)}`,
      "Content-Length": String(doc.storageFile.fileSize),
      "Cache-Control": "no-cache",
    },
  });
}
