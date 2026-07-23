import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit-log";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  const { searchParams } = new URL(req.url);
  const pool = searchParams.get("pool");
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = { deletedAt: null };
  if (pool) where.poolType = pool;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const docs = await prisma.document.findMany({
    where: where as any,
    include: {
      storageFile: { select: { id: true, fileName: true, fileSize: true, mimeType: true } },
      owner: { select: { id: true, firstNameTh: true, lastNameTh: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = docs.map((d) => ({
    id: d.id,
    title: d.title,
    pool: d.poolType,
    department: "—",
    uploadedBy: d.owner ? `${d.owner.firstNameTh} ${d.owner.lastNameTh}` : "—",
    date: d.createdAt.toISOString(),
    size: formatFileSize(Number(d.storageFile.fileSize)),
    type: getExtension(d.storageFile.mimeType),
    fileSize: Number(d.storageFile.fileSize),
    ownerUserId: d.ownerUserId,
  }));

  return apiSuccess(mapped);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!hasPermission(roles, "DOCUMENTS_UPLOAD")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์อัปโหลดเอกสาร", 403);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "Untitled";
    const poolType = (formData.get("poolType") as string) || "personal";

    if (!file) return apiError("VALIDATION", "กรุณาเลือกไฟล์");

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    if (!allowed.includes(file.type)) {
      return apiError("VALIDATION", "เฉพาะ PDF, XLSX, PPTX, DOCX, PNG, JPG เท่านั้น");
    }

    // Save file to disk
    const uploadDir = join(process.cwd(), "public", "uploads", "documents");
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_ก-๙]/g, "_")}`;
    const filePath = join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    // Create storage file record
    const storageFile = await prisma.storageFile.create({
      data: {
        fileName: file.name,
        fileSize: BigInt(file.size),
        mimeType: file.type,
        storageProvider: "local",
        path: `/uploads/documents/${safeName}`,
        createdBy: session.user.id,
      },
    });

    // Create document record
    const doc = await prisma.document.create({
      data: {
        title,
        poolType,
        storageFileId: storageFile.id,
        ownerUserId: session.user.id,
        createdBy: session.user.id,
      },
      include: {
        storageFile: { select: { id: true, fileName: true, fileSize: true, mimeType: true } },
        owner: { select: { id: true, firstNameTh: true, lastNameTh: true } },
      },
    });

    // Audit log (non-fatal)
    createAuditLog({ userId: session.user.id, module: "DOCUMENTS", action: "DOC_UPLOAD", entityType: "Document", entityId: doc.id, newValue: doc.title });

    return apiSuccess({
      id: doc.id,
      title: doc.title,
      pool: doc.poolType,
      uploadedBy: doc.owner ? `${doc.owner.firstNameTh} ${doc.owner.lastNameTh}` : "—",
      date: doc.createdAt.toISOString(),
      size: formatFileSize(Number(doc.storageFile.fileSize)),
      type: getExtension(doc.storageFile.mimeType),
      fileSize: Number(doc.storageFile.fileSize),
      ownerUserId: doc.ownerUserId,
    });
  } catch (e) {
    console.error("[POST /api/documents]", e);
    return apiError("DB_ERROR", "ไม่สามารถอัปโหลดเอกสารได้");
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc || doc.deletedAt) return apiError("NOT_FOUND", "ไม่พบเอกสาร");
  if (doc.ownerUserId !== session.user.id) {
    const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
    if (!hasPermission(roles, "DOCUMENTS_DELETE")) {
      return apiError("FORBIDDEN", "คุณสามารถลบได้เฉพาะเอกสารของตนเอง", 403);
    }
  }

  await prisma.document.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: session.user.id },
  });

  // Audit log (non-fatal)
  createAuditLog({
    userId: session.user.id, module: "DOCUMENTS", action: "DOC_DELETE", entityType: "Document", entityId: id,
    oldValue: JSON.stringify({ title: doc.title, fileType: doc.fileType }), newValue: null,
  });

  return apiSuccess({ id, deleted: true });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "image/png": "PNG",
    "image/jpeg": "JPG",
  };
  return map[mimeType] || "FILE";
}
