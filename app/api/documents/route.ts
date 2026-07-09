import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess, parsePagination } from "@/lib/api-utils";
import { hasPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "DOCUMENTS_VIEW")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์ดูเอกสาร" } }, { status: 403 });
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const pool = searchParams.get("pool") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { contains: search };
    }
    if (pool) {
      where.poolType = pool;
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
      date: doc.updatedAt.toISOString(),
      size: doc.storageFile.fileSize ? `${(Number(doc.storageFile.fileSize) / (1024 * 1024)).toFixed(1)} MB` : "0 MB",
      type: doc.storageFile.mimeType?.split("/")[1]?.toUpperCase() ?? "FILE",
      storageFile: doc.storageFile,
    }));

    return apiSuccess(mapped, { total, page, limit });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงเอกสารได้");
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "DOCUMENTS_UPLOAD")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "ไม่มีสิทธิ์อัปโหลดเอกสาร" } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return apiError("USER_NOT_FOUND", "ไม่พบผู้ใช้");
    }

    const storageFile = await prisma.storageFile.create({
      data: {
        fileName: body.fileName ?? "uploaded-file",
        fileSize: BigInt(body.fileSize ?? 0),
        mimeType: body.mimeType ?? "application/octet-stream",
        storageProvider: "local",
        path: body.path ?? "/uploads",
        createdBy: user.id,
      },
    });

    const document = await prisma.document.create({
      data: {
        title: body.title ?? body.fileName ?? "เอกสารใหม่",
        poolType: body.poolType ?? "personal",
        storageFileId: storageFile.id,
        ownerUserId: user.id,
        createdBy: user.id,
      },
    });

    return apiSuccess({ id: document.id, title: document.title });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถอัปโหลดเอกสารได้");
  }
}
