import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function deptNameFilter(view: string): { name?: { contains: string } } | undefined {
  if (!view || view === "all") return undefined;
  const map: Record<string, string> = {
    it: "IT",
    academic: "วิชาการ",
    support: "สนับสนุน",
  };
  const kw = map[view];
  return kw ? { name: { contains: kw } } : undefined;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Advanced Search — ค้นหาหลายมิติ (ประกาศ / ผู้ใช้ / เอกสาร / โครงการ)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const keyword = (searchParams.get("keyword") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const startDate = parseDate(searchParams.get("startDate") || "");
    const endDate = parseDate(searchParams.get("endDate") || "");
    const view = searchParams.get("view") || "all";

    const results: Record<string, unknown> = {};

    /* ── ประกาศ ── */
    const announcementWhere: Record<string, unknown> = { status: "published", deletedAt: null };
    if (keyword) (announcementWhere as Record<string, unknown>).title = { contains: keyword };
    if (category) {
      const cat = await prisma.announcementCategory.findFirst({ where: { name: category } });
      if (cat) (announcementWhere as Record<string, unknown>).categoryId = cat.id;
    }
    if (startDate) (announcementWhere as Record<string, unknown>).publishDate = { ...(announcementWhere.publishDate as object || {}), gte: startDate };
    if (endDate) (announcementWhere as Record<string, unknown>).publishDate = { ...(announcementWhere.publishDate as object || {}), lte: endDate };
    const deptFilter = deptNameFilter(view);
    if (deptFilter) (announcementWhere as Record<string, unknown>).department = deptFilter;

    results.announcements = await prisma.announcement.findMany({
      where: announcementWhere,
      take: 10,
      include: { category: true, publisher: true, department: true },
      orderBy: { publishDate: "desc" },
    });

    /* ── ผู้ใช้ ── */
    if (keyword) {
      results.users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { firstNameTh: { contains: keyword } },
            { lastNameTh: { contains: keyword } },
            { email: { contains: keyword } },
          ],
          ...(deptFilter ? { department: deptFilter } : {}),
        },
        take: 10,
        include: { department: true },
      });
    }

    /* ── เอกสาร ── */
    if (keyword) {
      results.documents = await prisma.document.findMany({
        where: {
          deletedAt: null,
          title: { contains: keyword },
          ...(deptFilter ? { department: deptFilter } : {}),
        },
        take: 10,
        include: { department: true },
      });
    }

    /* ── โครงการ ── */
    if (keyword) {
      results.projects = await prisma.project.findMany({
        where: {
          deletedAt: null,
          name: { contains: keyword },
          ...(deptFilter ? { owner: { department: deptFilter } } : {}),
        },
        take: 10,
        include: { owner: { include: { department: true } }, projectType: true },
      });
    }

    return apiSuccess(results);
  } catch {
    return apiError("SEARCH_ERROR", "เกิดข้อผิดพลาดในการค้นหา");
  }
}
