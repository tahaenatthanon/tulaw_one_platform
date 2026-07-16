import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, parsePagination } from "@/lib/api-utils";
import { hasPermission, ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import { resolveDataScope, buildDocumentPoolWhere } from "@/lib/data-scope";
import { logAction } from "@/lib/audit-log";

async function auditAction(userId: string, documentId: string, action: string) {
  try {
    await prisma.documentAudit.create({ data: { documentId, userId, action } });
  } catch { /* non-fatal */ }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const departmentId = (session?.user as { departmentId?: number | null })?.departmentId ?? null;
  if (!session?.user?.email || !hasPermission(roles, "DOCUMENTS_VIEW")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ดูเอกสาร" } }, { status: 403 });
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const pool = searchParams.get("pool") || "";

    const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) where.title = { contains: search };

    if (pool) {
      Object.assign(where, buildDocumentPoolWhere(scope, pool));
    } else if (!scope.canSeeAllDepartments) {
      where.OR = [
        { poolType: "central", deletedAt: null },
        ...(scope.departmentId !== null ? [{ departmentId: scope.departmentId, poolType: "department" as const, deletedAt: null }] : []),
        ...(scope.ownerUserId !== null ? [{ ownerUserId: scope.ownerUserId, poolType: "personal" as const, deletedAt: null }] : []),
      ];
    }

    const [data, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { storageFile: true, owner: { select: { firstNameTh: true, lastNameTh: true, email: true } }, department: true },
      }),
      prisma.document.count({ where }),
    ]);

    const mapped = data.map((doc) => ({
      id: doc.id,
      title: doc.title,
      pool: doc.poolType,
      department: doc.department?.name ?? "-",
      uploadedBy: doc.owner ? `${doc.owner.firstNameTh} ${doc.owner.lastNameTh}` : "-",
      ownerUserId: doc.ownerUserId,
      date: doc.updatedAt.toISOString(),
      size: doc.storageFile.fileSize ? `${(Number(doc.storageFile.fileSize) / (1024 * 1024)).toFixed(1)} MB` : "0 MB",
      type: doc.storageFile.mimeType?.split("/")[1]?.toUpperCase() ?? "FILE",
      fileSize: Number(doc.storageFile.fileSize),
    }));

    return apiSuccess(mapped, { total, page, limit });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงเอกสารได้");
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "DOCUMENTS_UPLOAD")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์อัปโหลดเอกสาร" } }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "เอกสารใหม่";
    const poolType = (formData.get("poolType") as string) || "personal";

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return apiError("USER_NOT_FOUND", "ไม่พบผู้ใช้");

    // Build file path and storage data
    const fileName = file?.name || title;
    const fileSize = file ? BigInt(file.size) : BigInt(0);
    const mimeType = file?.type || "application/octet-stream";
    const buffer = file ? Buffer.from(await file.arrayBuffer()) : Buffer.alloc(0);
    const path = `/uploads/documents/${Date.now()}-${fileName}`;
    const fullPath = join(process.cwd(), "public", path);
    const dir = join(process.cwd(), "public", "uploads", "documents");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, buffer);

    const storageFile = await prisma.storageFile.create({
      data: {
        fileName, fileSize, mimeType,
        storageProvider: "local",
        path,
        createdBy: user.id,
      },
    });

    const document = await prisma.document.create({
      data: {
        title,
        poolType,
        storageFileId: storageFile.id,
        departmentId: poolType === "department" ? user.departmentId ?? null : null,
        ownerUserId: user.id,
        createdBy: user.id,
      },
    });

    await auditAction(user.id, document.id, "create");
    await logAction(user.id, "documents", "DOC_UPLOAD", { entityType: "Document", entityId: document.id });

    return apiSuccess({
      id: document.id, title: document.title, pool: document.poolType,
      fileSize: Number(fileSize), type: mimeType.split("/")[1]?.toUpperCase() ?? "FILE",
    });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถอัปโหลดเอกสารได้");
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  if (!session?.user?.email) return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);

  try {
    const body = await req.json();
    const { id, title } = body;
    if (!id) return apiError("VALIDATION", "กรุณาระบุ ID");

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return apiError("NOT_FOUND", "ไม่พบเอกสาร");

    // Only editable by owner in personal pool, or admin (level >= 50)
    if (doc.poolType !== "personal" && maxLevel < 50) return apiError("FORBIDDEN", "แก้ไขได้เฉพาะเอกสารใน Personal Pool", 403);
    if (doc.poolType === "personal" && doc.ownerUserId !== userId && maxLevel < 50) return apiError("FORBIDDEN", "แก้ไขได้เฉพาะเอกสารของตนเอง", 403);

    const updated = await prisma.document.update({ where: { id }, data: { title: title || doc.title, updatedBy: userId } });
    await auditAction(userId, id, "update");
    await logAction(userId, "documents", "DOC_UPDATE", { entityType: "Document", entityId: id });
    return apiSuccess(updated);
  } catch (e) {
    console.error("[PUT /api/documents]", e);
    return apiError("DB_ERROR", "ไม่สามารถอัปเดตเอกสารได้");
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session?.user as { id?: string })?.id ?? "";
  const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
  if (!session?.user?.email || !hasPermission(roles, "DOCUMENTS_DELETE")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ลบเอกสาร" } }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiError("VALIDATION", "กรุณาระบุรหัสเอกสาร");

    const doc = await prisma.document.findUnique({ where: { id }, include: { storageFile: true } });
    if (!doc) return apiError("NOT_FOUND", "ไม่พบเอกสาร");

    // Non-admin can only delete from personal pool that they own
    if (maxLevel < 50 && (doc.poolType !== "personal" || doc.ownerUserId !== userId)) {
      return apiError("FORBIDDEN", "คุณสามารถลบได้เฉพาะเอกสารใน Personal Pool ของคุณเท่านั้น", 403);
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.document.update({ where: { id }, data: { deletedAt: now } }),
      prisma.storageFile.update({ where: { id: doc.storageFileId }, data: { deletedAt: now } }),
    ]);

    await auditAction(userId, id, "delete");
    await logAction(userId, "documents", "DOC_DELETE", { entityType: "Document", entityId: id });
    return apiSuccess({ id, deletedAt: now.toISOString() });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถลบเอกสารได้");
  }
}
