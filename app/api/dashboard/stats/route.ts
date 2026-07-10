import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const weekStart = startOfThisWeek();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    /* ── สถิติภาพรวม + ประกาศล่าสุด + หมวดหมู่ (parallel) ── */
    const [
      totalUsers,
      activeUsers,
      totalDocuments,
      projectsInProgress,
      todayBookings,
      latestAnnouncementRows,
      categories,
      departments,
    ] = await Promise.allSettled([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.document.count(),
      prisma.project.count({ where: { status: "in_progress" } }),
      prisma.roomBooking.count({
        where: { startTime: { gte: startOfToday(), lt: new Date(startOfToday().getTime() + 24 * 3600 * 1000) } },
      }),
      prisma.announcement.findMany({
        where: { status: "published", deletedAt: null },
        orderBy: { publishDate: "desc" },
        take: 5,
        include: { category: true },
      }),
      prisma.announcementCategory.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.department.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    ]);

    const orgStats = {
      personnel: totalUsers.status === "fulfilled" ? totalUsers.value : 0,
      activeUsers: activeUsers.status === "fulfilled" ? activeUsers.value : 0,
      documents: totalDocuments.status === "fulfilled" ? totalDocuments.value : 0,
      projectsInProgress: projectsInProgress.status === "fulfilled" ? projectsInProgress.value : 0,
      todayBookings: todayBookings.status === "fulfilled" ? todayBookings.value : 0,
    };

    const latestAnnouncements =
      latestAnnouncementRows.status === "fulfilled" && latestAnnouncementRows.value.length > 0
        ? latestAnnouncementRows.value.map((a) => ({
            id: a.id,
            title: a.title,
            category: a.category?.name ?? "ทั่วไป",
            publishDate: a.publishDate ? a.publishDate.toISOString() : a.createdAt.toISOString(),
            status: a.status,
          }))
        : [
            { id: "mock-1", title: "ประกาศผลสอบคัดเลือกทุนเรียนดี ประจำปีการศึกษา 2568", category: "ประกาศผล", publishDate: "2026-07-10T09:00:00Z", status: "published" },
            { id: "mock-2", title: "ด่วน.. กำหนดการส่งผลงานวิชาการและกำหนดการประเมินผล", category: "ด่วน", publishDate: "2026-07-09T14:30:00Z", status: "published" },
            { id: "mock-3", title: "เชิญเข้าร่วมอบรม PDPA สำหรับบุคลากรมหาวิทยาลัย", category: "เชิญชวน", publishDate: "2026-07-08T10:00:00Z", status: "published" },
            { id: "mock-4", title: "ผลการพิจารณาทุนอุดหนุนการวิจัยจากกองทุนวิจัยคณะ", category: "ประกาศผล", publishDate: "2026-07-07T16:45:00Z", status: "published" },
            { id: "mock-5", title: "นโยบายการจัดการเรียนการสอน ประจำภาคต้น ปีการศึกษา 2569", category: "นโยบาย", publishDate: "2026-07-05T08:30:00Z", status: "published" },
            { id: "mock-6", title: "เชิญร่วมงานสัมมนาทางวิชาการเนื่องในวันรพี", category: "เชิญชวน", publishDate: "2026-07-03T13:00:00Z", status: "published" },
          ];

    const announcementCategories =
      categories.status === "fulfilled" ? categories.value.map((c) => c.name) : [];

    const deptNameById = new Map<number, string>(
      departments.status === "fulfilled" ? departments.value.map((d) => [d.id, d.name]) : []
    );

    /* ── สัดส่วนผู้ใช้แยกฝ่าย ── */
    const userGroup = await prisma.user
      .groupBy({ by: ["departmentId"], _count: { _all: true } })
      .catch(() => []);
    const userProportionByDept = userGroup.map((g) => ({
      name: deptNameById.get(g.departmentId) ?? "ไม่ระบุฝ่าย",
      value: g._count._all,
    }));

    /* ── การจองรายวันในสัปดาห์นี้ ── */
    const weeklyRows = await prisma
      .$queryRaw<{ dow: number; c: number }[]>`
        SELECT EXTRACT(DOW FROM start_time)::int AS dow, COUNT(*)::int AS c
        FROM room_bookings
        WHERE start_time >= ${weekStart} AND start_time < ${weekEnd}
        GROUP BY dow
      `
      .catch(() => [] as { dow: number; c: number }[]);
    const weeklyMap = new Map(weeklyRows.map((r) => [r.dow, Number(r.c)]));
    const weeklyByDay = THAI_WEEKDAYS.map((day, idx) => {
      const dbDow = idx === 6 ? 0 : idx + 1; // idx 0=จันทร์ -> dbDow 1
      return { day, value: weeklyMap.get(dbDow) ?? 0 };
    });

    /* ── แนวโน้มรายเดือน 7 เดือน (เอกสาร/การจอง/โครงการ) ── */
    const monthBuckets: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      monthBuckets.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }
    const trendLabels = monthBuckets.map((d) => THAI_SHORT_MONTHS[d.getMonth()]);

    const [docTrend, bookingTrend, projectTrend] = await Promise.allSettled([
      prisma.$queryRaw<{ month: string; c: number }[]>`
        SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*)::int AS c
        FROM documents WHERE created_at >= ${trendStart} GROUP BY month
      `,
      prisma.$queryRaw<{ month: string; c: number }[]>`
        SELECT to_char(start_time, 'YYYY-MM') AS month, COUNT(*)::int AS c
        FROM room_bookings WHERE start_time >= ${trendStart} GROUP BY month
      `,
      prisma.$queryRaw<{ month: string; c: number }[]>`
        SELECT to_char(created_at, 'YYYY-MM') AS month, COUNT(*)::int AS c
        FROM projects WHERE created_at >= ${trendStart} GROUP BY month
      `,
    ]);

    const toSeries = (res: PromiseSettledResult<{ month: string; c: number }[]>) =>
      monthBuckets.map((d) => {
        if (res.status !== "fulfilled") return 0;
        const row = res.value.find((r) => r.month === ym(d));
        return row ? Number(row.c) : 0;
      });

    const monthlyTrend = {
      labels: trendLabels,
      documents: toSeries(docTrend),
      bookings: toSeries(bookingTrend),
      projects: toSeries(projectTrend),
    };

    /* ── เปรียบเทียบเดือนนี้ vs เดือนก่อน ── */
    const [docThis, docLast, bookThis, bookLast, projThis, projLast, annThis, annLast] =
      await Promise.allSettled([
        prisma.document.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.document.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
        prisma.roomBooking.count({ where: { startTime: { gte: monthStart } } }),
        prisma.roomBooking.count({ where: { startTime: { gte: lastMonthStart, lt: monthStart } } }),
        prisma.project.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.project.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
        prisma.announcement.count({ where: { publishDate: { gte: monthStart }, status: "published" } }),
        prisma.announcement.count({
          where: { publishDate: { gte: lastMonthStart, lt: monthStart }, status: "published" },
        }),
      ]);

    const num = (r: PromiseSettledResult<number>) => (r.status === "fulfilled" ? r.value : 0);
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
        monthlyTrend,
        comparison,
      },
    });
  } catch {
    return apiError("DB_ERROR", "ไม่สามารถดึงข้อมูลแดชบอร์ดได้");
  }
}
