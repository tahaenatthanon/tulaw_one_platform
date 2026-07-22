import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { type RoleCode, type PermissionCode } from "@/lib/permissions";
import { resolveDataScope } from "@/lib/data-scope";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/* ─── Helper constants ─── */
const THAI_SHORT_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const THAI_WEEKDAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

function ym(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfThisWeek(): Date {
  const now = new Date();
  const dow = now.getDay(); // 0 = Sunday
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

/**
 * ดึงสถิติ Dashboard แบบ Real-time รวมทุกส่วนที่หน้าเว็บต้องการ
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return apiError("UNAUTHORIZED", "กรุณาเข้าสู่ระบบ", 401);
  }

  const roles = (session.user as { roles?: string[] } | undefined)?.roles ?? [];
  const userId = (session.user as { id?: string })?.id ?? "";
  const departmentId = (session.user as { departmentId?: number | null })?.departmentId ?? null;
  const scope = resolveDataScope(roles as RoleCode[], departmentId, userId);

  // Build department filter for scoped queries
  const deptFilter = !scope.canSeeAllDepartments && scope.departmentId !== null
    ? { departmentId: scope.departmentId }
    : {};

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const weekStart = startOfThisWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const monthBuckets = Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 6 + i, 1));
    const trendLabels = monthBuckets.map((d) => THAI_SHORT_MONTHS[d.getMonth()]);

    /* ── ALL queries in ONE parallel block (fastest) ── */
    const [
      totalUsers, activeUsers, totalDocuments, projectsInProgress, todayBookings,
      latestAnnouncementRows, categories, departments,
      userGroup, weeklyRows,
      docTrend, bookingTrend, projectTrend,
      docThis, docLast, bookThis, bookLast, projThis, projLast, annThis, annLast,
    ] = await Promise.allSettled([
      // Stats
      prisma.user.count({ where: deptFilter }),
      prisma.user.count({ where: { status: "ACTIVE", ...deptFilter } }),
      prisma.document.count({ where: deptFilter }),
      prisma.project.count({ where: { status: "in_progress", ...deptFilter } }),
      prisma.roomBooking.count({ where: { startTime: { gte: startOfToday(), lt: new Date(startOfToday().getTime() + 86400000) } } }),
      // Announcements
      prisma.announcement.findMany({ where: { status: "published", deletedAt: null }, orderBy: { publishDate: "desc" }, take: 5, include: { category: true } }),
      prisma.announcementCategory.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.department.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
      // Proportion
      prisma.user.groupBy({ by: ["departmentId"], _count: { _all: true } }),
      // Weekly
      prisma.$queryRaw<{ dow: number; c: number }[]>`SELECT EXTRACT(DOW FROM start_time)::int AS dow, COUNT(*)::int AS c FROM room_bookings WHERE start_time >= ${weekStart} AND start_time < ${weekEnd} GROUP BY dow`,
      // Trends (3 raw queries)
      prisma.$queryRaw<{ month: string; c: number }[]>`SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*)::int AS c FROM documents WHERE created_at >= ${trendStart} GROUP BY month`,
      prisma.$queryRaw<{ month: string; c: number }[]>`SELECT to_char(start_time, 'YYYY-MM') AS month, COUNT(*)::int AS c FROM room_bookings WHERE start_time >= ${trendStart} GROUP BY month`,
      prisma.$queryRaw<{ month: string; c: number }[]>`SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*)::int AS c FROM projects WHERE created_at >= ${trendStart} GROUP BY month`,
      // Comparison (8 count queries)
      prisma.document.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.document.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
      prisma.roomBooking.count({ where: { startTime: { gte: monthStart } } }),
      prisma.roomBooking.count({ where: { startTime: { gte: lastMonthStart, lt: monthStart } } }),
      prisma.project.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.project.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
      prisma.announcement.count({ where: { publishDate: { gte: monthStart }, status: "published" } }),
      prisma.announcement.count({ where: { publishDate: { gte: lastMonthStart, lt: monthStart }, status: "published" } }),
    ]);

    const num = (r: PromiseSettledResult<number>) => (r.status === "fulfilled" ? r.value : 0);
    const numArr = <T>(r: PromiseSettledResult<T[]>) => (r.status === "fulfilled" ? r.value : []);

    const orgStats = {
      personnel: num(totalUsers),
      activeUsers: num(activeUsers),
      documents: num(totalDocuments),
      projectsInProgress: num(projectsInProgress),
      todayBookings: num(todayBookings),
    };

    const latestAnnouncements = numArr(latestAnnouncementRows).length > 0
      ? numArr(latestAnnouncementRows).map((a: { id: string; title: string; category?: { name: string }; publishDate?: Date | null; createdAt: Date; status: string }) => ({
          id: a.id, title: a.title,
          category: a.category?.name ?? "ทั่วไป",
          publishDate: a.publishDate ? a.publishDate.toISOString() : a.createdAt.toISOString(),
          status: a.status,
        }))
      : [] as { id: string; title: string; category: string; publishDate: string; status: string }[];

    // Map announcement categories with colors from ID-based palette
    // (AnnouncementCategory has no colorCode field — colors derived from category ID)
    const CAT_COLORS = ["#A31D1D", "#0D9488", "#2563EB", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#65A30D"];
    const announcementCategories = numArr(categories).map((c: { id: number; name: string }) => ({
      id: String(c.id), name: c.name, color: CAT_COLORS[(c.id - 1) % CAT_COLORS.length],
    }));
    const deptNameById = new Map(numArr(departments).map((d: { id: number; name: string }) => [d.id, d.name]));

    const userProportionByDept = numArr(userGroup).map((g: { departmentId: number; _count: { _all: number } }) => ({
      name: deptNameById.get(g.departmentId) ?? "ไม่ระบุฝ่าย",
      value: g._count._all,
    }));

    const weeklyMap = new Map(numArr(weeklyRows).map((r: { dow: number; c: number }) => [r.dow, Number(r.c)]));
    const weeklyByDay = THAI_WEEKDAYS.map((day, idx) => {
      const dbDow = idx === 6 ? 0 : idx + 1;
      return { day, value: weeklyMap.get(dbDow) ?? 0 };
    });

    const toTrend = (res: PromiseSettledResult<{ month: string; c: number }[]>) =>
      monthBuckets.map((d) => {
        if (res.status !== "fulfilled") return 0;
        const row = res.value.find((r) => r.month === ym(d));
        return row ? Number(row.c) : 0;
      });

    const comparison = [
      { label: "เอกสาร", thisMonth: num(docThis), lastMonth: num(docLast) },
      { label: "การจอง", thisMonth: num(bookThis), lastMonth: num(bookLast) },
      { label: "โครงการ", thisMonth: num(projThis), lastMonth: num(projLast) },
      { label: "ประกาศ", thisMonth: num(annThis), lastMonth: num(annLast) },
      { label: "ผู้ใช้ Active", thisMonth: orgStats.activeUsers, lastMonth: orgStats.activeUsers },
    ];

    return apiSuccess({
      orgStats,
      lastSync: now.toISOString(),
      latestAnnouncements,
      announcementCategories,
      analytics: {
        weeklyByDay,
        userProportionByDept,
        monthlyTrend: { labels: trendLabels, documents: toTrend(docTrend), bookings: toTrend(bookingTrend), projects: toTrend(projectTrend) },
        comparison,
      },
    });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลแดชบอร์ดได้");
  }
}
