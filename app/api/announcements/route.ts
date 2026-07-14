import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, parsePagination } from "@/lib/api-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, ROLE_LEVELS, type RoleCode } from "@/lib/permissions";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  }

  try {
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.title = { contains: search };
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { category: true, department: true, publisher: { select: { firstNameTh: true, lastNameTh: true } } },
      }),
      prisma.announcement.count({ where }),
    ]);

    const mapped = data.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category?.name ?? "",
      publisher: `${a.publisher.firstNameTh} ${a.publisher.lastNameTh}`,
      publisherUserId: a.publisherUserId,
      date: a.publishDate?.toISOString() ?? a.createdAt.toISOString(),
      status: a.status,
    }));

    return apiSuccess(mapped, { total, page, limit });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลได้");
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "INTRANET_CREATE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์สร้างประกาศ", 403);
  }

  try {
    const body = await req.json();
    const { title, content, category } = body;
    if (!title?.trim()) return apiError("VALIDATION", "กรุณาระบุชื่อประกาศ");

    // Find or create category by name
    let categoryId: number | undefined;
    if (category) {
      let cat = await prisma.announcementCategory.findFirst({ where: { name: category } });
      if (!cat) {
        cat = await prisma.announcementCategory.create({ data: { name: category, isActive: true } });
      }
      categoryId = cat.id;
    }

    const ann = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content ?? "",
        categoryId: categoryId ?? 1,
        publisherUserId: session.user.id,
        status: "published",
        publishDate: new Date(),
        createdBy: session.user.id,
      },
      include: { category: true, department: true },
    });

    // Create notifications for subscribers
    if (categoryId) {
      const subscribers = await prisma.announcementSubscription.findMany({
        where: { categoryId, isSubscribed: true, deletedAt: null },
        select: { userId: true },
      });

      if (subscribers.length > 0) {
        const notif = await prisma.notification.create({
          data: {
            title: `ประกาศใหม่: ${title.trim()}`,
            message: `มีประกาศใหม่ในหมวด "${category}"`,
            actionUrl: `/intranet?tab=announcements`,
            createdBy: session.user.id,
          },
        });

        await prisma.notificationRead.createMany({
          data: subscribers.map((s) => ({
            notificationId: notif.id,
            userId: s.userId,
            isRead: false,
          })),
        });
      }
    }

    return apiSuccess(ann);
  } catch (e: unknown) {
    console.error("[POST /api/announcements]", e);
    return apiError("DB_ERROR", "ไม่สามารถสร้างประกาศได้");
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "INTRANET_EDIT")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์แก้ไขประกาศ", 403);
  }

  try {
    const body = await req.json();
    const { id, title, content, category } = body;
    if (!id || !title?.trim()) {
      return apiError("VALIDATION", "กรุณาระบุรหัสประกาศและชื่อประกาศ");
    }

    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) {
      return apiError("NOT_FOUND", "ไม่พบประกาศ");
    }

    // Ownership check: User role (level < 50) can only edit own announcements
    const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
    if (maxLevel < 50 && ann.publisherUserId !== session.user.id) {
      return apiError("FORBIDDEN", "คุณสามารถแก้ไขได้เฉพาะประกาศของตนเอง", 403);
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content ?? ann.content,
        categoryId: category ? Number(category) : ann.categoryId,
      },
      include: { category: true, department: true },
    });

    return apiSuccess(updated);
  } catch (e: unknown) {
    console.error("[PUT /api/announcements]", e);
    return apiError("DB_ERROR", "ไม่สามารถแก้ไขประกาศได้");
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const roles = (session?.user as { roles?: string[] } | undefined)?.roles ?? [];
  if (!session?.user?.email || !hasPermission(roles, "INTRANET_DELETE")) {
    return apiError("FORBIDDEN", "ไม่มีสิทธิ์ลบประกาศ", 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return apiError("VALIDATION", "กรุณาระบุรหัสประกาศ");

    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) return apiError("NOT_FOUND", "ไม่พบประกาศ");

    // Ownership check: User role (level < 50) can only delete own announcements
    const maxLevel = Math.max(0, ...roles.map((r) => ROLE_LEVELS[r as RoleCode] ?? 0));
    if (maxLevel < 50 && ann.publisherUserId !== session.user.id) {
      return apiError("FORBIDDEN", "คุณสามารถลบได้เฉพาะประกาศของตนเอง", 403);
    }

    await prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: session.user.id },
    });

    return apiSuccess({ deleted: true });
  } catch (e: unknown) {
    console.error("[DELETE /api/announcements]", e);
    return apiError("DB_ERROR", "ไม่สามารถลบประกาศได้");
  }
}
