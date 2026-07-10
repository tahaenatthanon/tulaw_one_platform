"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Users, FolderOpen, Briefcase, CalendarCheck,
  Newspaper, BarChart3, PieChart, TrendingUp, Activity,
  ArrowUp, ArrowDown, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

interface OrgStats {
  personnel: number;
  activeUsers: number;
  documents: number;
  projectsInProgress: number;
  todayBookings: number;
}

interface AnnouncementItem {
  id: string;
  title: string;
  category: string;
  publishDate: string;
  status: string;
}

interface WeeklyPoint { day: string; value: number; }
interface ProportionPoint { name: string; value: number; }
interface MonthlyTrend { labels: string[]; documents: number[]; bookings: number[]; projects: number[]; }
interface ComparisonPoint { label: string; thisMonth: number; lastMonth: number; }

interface DashboardData {
  orgStats: OrgStats;
  lastSync: string;
  latestAnnouncements: AnnouncementItem[];
  announcementCategories: string[];
  analytics: {
    weeklyByDay: WeeklyPoint[];
    userProportionByDept: ProportionPoint[];
    monthlyTrend: MonthlyTrend;
    comparison: ComparisonPoint[];
  };
}

interface DeptStat {
  key: string;
  name: string;
  users: number;
  documents: number;
  projects: number;
  todayBookings: number;
}

type ViewId = "overview" | "weekly" | "trend" | "proportion" | "comparison";

/* ==============================================================================
   Constants
   ============================================================================== */

const ALLOWED_VIEWS: ViewId[] = ["overview", "weekly", "trend", "proportion", "comparison"];

const views: { id: ViewId; label: string; icon: typeof TrendingUp }[] = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "weekly", label: "Weekly", icon: BarChart3 },
  { id: "trend", label: "Trend", icon: TrendingUp },
  { id: "proportion", label: "Proportion", icon: PieChart },
  { id: "comparison", label: "Comparison", icon: Activity },
];

const CHART_COLORS = [
  "var(--tu-primary)", "var(--tu-info)", "var(--tu-secondary-active)",
  "var(--tu-success)", "var(--tu-warning)", "var(--tu-text-muted)",
];

function formatThaiDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function formatThaiTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ==============================================================================
   Small Components
   ============================================================================== */

function MiniStat({ label, value, icon, color, bg }: {
  label: string; value: number; icon: React.ReactNode; color: string; bg: string;
}) {
  return (
    <div className={cn("rounded-xl p-3 text-center", bg)}>
      <div className={cn("flex justify-center mb-1", color)}>{icon}</div>
      <p className="text-lg font-bold text-tu-text-primary">{value}</p>
      <p className="text-[10px] text-tu-text-muted">{label}</p>
    </div>
  );
}

function SkeletonCard() {
  return <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 h-[88px] animate-pulse" />;
}

function ChartCard({ title, icon: Icon, children }: {
  title: string; icon: typeof BarChart3; children: React.ReactNode;
}) {
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon size={20} className="text-tu-primary" />
        <h2 className="text-lg font-semibold text-tu-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function WeeklyChart({ data }: { data: WeeklyPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ChartCard title="กิจกรรมรายวัน (สัปดาห์นี้)" icon={BarChart3}>
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs font-medium text-tu-text-muted">{d.value}</span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: `${(d.value / max) * 100}%`, minHeight: 4, backgroundColor: "var(--tu-primary)" }}
              title={`${d.day}: ${d.value} การจอง`}
            />
            <span className="text-xs text-tu-text-muted">{d.day}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function TrendChart({ trend }: { trend: MonthlyTrend }) {
  const all = [...trend.documents, ...trend.bookings, ...trend.projects];
  const max = Math.max(1, ...all);
  const series = [
    { key: "documents", label: "เอกสาร", color: "var(--tu-info)", data: trend.documents },
    { key: "users", label: "การจอง", color: "var(--tu-secondary-active)", data: trend.bookings },
    { key: "projects", label: "โครงการ", color: "var(--tu-primary)", data: trend.projects },
  ] as const;
  return (
    <ChartCard title="แนวโน้มรายเดือน (7 เดือน)" icon={TrendingUp}>
      <div className="flex items-end gap-3 h-56">
        {trend.labels.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
            <div className="flex flex-col items-center gap-0.5 w-full">
              {series.map((s) => (
                <div
                  key={s.key}
                  className="w-full rounded-t-sm"
                  style={{ height: `${(s.data[i] / max) * 100}%`, minHeight: 2, backgroundColor: s.color }}
                  title={`${label} ${s.label}: ${s.data[i]}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-tu-text-muted">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} /> {s.label}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}

function ProportionChart({ data }: { data: ProportionPoint[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const segments = data
    .map((d, i) => {
      const pct = total ? (d.value / total) * 100 : 0;
      const seg = `${CHART_COLORS[i % CHART_COLORS.length]} ${acc.toFixed(2)}% ${(acc + pct).toFixed(2)}%`;
      acc += pct;
      return seg;
    })
    .join(", ");
  return (
    <ChartCard title="สัดส่วนผู้ใช้แยกตามฝ่าย" icon={PieChart}>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div
          className="relative h-44 w-44 shrink-0 rounded-full overflow-hidden"
          style={{ background: total ? `conic-gradient(${segments})` : "var(--tu-border)" }}
          role="img"
          aria-label="สัดส่วนผู้ใช้แยกตามฝ่าย"
        >
          <div className="absolute inset-[30%] rounded-full bg-tu-surface flex items-center justify-center">
            <span className="text-2xl font-bold text-tu-text-primary">{total}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {data.length === 0 ? (
            <p className="text-sm text-tu-text-muted">ไม่พบข้อมูลผู้ใช้</p>
          ) : (
            data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-tu-text-secondary">{d.name}</span>
                <span className="font-medium text-tu-text-primary ml-auto">{d.value}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </ChartCard>
  );
}

function ComparisonChart({ data }: { data: ComparisonPoint[] }) {
  return (
    <ChartCard title="เปรียบเทียบ เดือนนี้ vs เดือนก่อน" icon={Activity}>
      <div className="space-y-4">
        {data.map((d) => {
          const max = Math.max(1, d.thisMonth, d.lastMonth);
          const diff = d.thisMonth - d.lastMonth;
          return (
            <div key={d.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-tu-text-secondary">{d.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-tu-text-primary">{d.thisMonth}</span>
                  <span className={cn("text-xs font-medium flex items-center gap-0.5", diff >= 0 ? "text-tu-success" : "text-tu-error")}>
                    {diff >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {Math.abs(diff)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 h-5">
                <div className="rounded-r-sm bg-tu-primary" style={{ width: `${(d.thisMonth / max) * 100}%` }} />
                <div className="flex-1 bg-tu-bg rounded-r-sm relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-tu-text-muted">เดือนนี้</span>
                </div>
              </div>
              <div className="flex gap-1 h-5 mt-0.5">
                <div className="bg-tu-text-muted/30 rounded-r-sm" style={{ width: `${(d.lastMonth / max) * 100}%` }} />
                <div className="flex-1 bg-tu-bg rounded-r-sm relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-tu-text-muted">เดือนก่อน</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

const CATEGORY_COLORS: Record<string, { badge: string; border: string; dot: string }> = {
  "ประกาศด่วน": { badge: "bg-tu-error/10 text-tu-error border-tu-error/20", border: "border-l-tu-error", dot: "bg-tu-error" },
  "ด่วน": { badge: "bg-tu-error/10 text-tu-error border-tu-error/20", border: "border-l-tu-error", dot: "bg-tu-error" },
  "เชิญชวน": { badge: "bg-tu-info/10 text-tu-info border-tu-info/20", border: "border-l-tu-info", dot: "bg-tu-info" },
  "ประกาศผล": { badge: "bg-tu-success/10 text-tu-success border-tu-success/20", border: "border-l-tu-success", dot: "bg-tu-success" },
  "นโยบาย": { badge: "bg-tu-warning/10 text-tu-warning border-tu-warning/20", border: "border-l-tu-warning", dot: "bg-tu-warning" },
};

function AnnouncementsInline({ items }: { items: AnnouncementItem[] }) {
  const top3 = items.slice(0, 3);
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4">
      {top3.length === 0 ? (
        <p className="text-sm text-tu-text-muted py-2 text-center">ไม่มีประกาศ</p>
      ) : (
        <div className="space-y-0 divide-y divide-tu-border">
          {top3.map((ann) => {
            const colors = CATEGORY_COLORS[ann.category] ?? { badge: "", border: "", dot: "bg-tu-text-muted" };
            return (
              <div key={ann.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 text-sm cursor-pointer hover:text-tu-primary transition-colors">
                <span className={cn("w-2 h-2 rounded-full shrink-0", colors.dot)} />
                <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0", colors.badge)}>
                  {ann.category}
                </span>
                <span className="text-tu-text-muted text-xs shrink-0">{formatThaiDate(ann.publishDate)}</span>
                <span className="text-tu-text-primary truncate font-medium">{ann.title}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canExport = useHasPermission("DASHBOARD_MANAGE");

  const rawView = searchParams.get("view") as ViewId | null;
  const view: ViewId = rawView && ALLOWED_VIEWS.includes(rawView) ? rawView : "overview";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deptStats, setDeptStats] = useState<DeptStat[] | null>(null);
  const [deptLoading, setDeptLoading] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStats = useCallback(async (full: boolean) => {
    if (full) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/stats", { headers: { "Content-Type": "application/json" } });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "เกิดข้อผิดพลาด");
      setData(json.data as DashboardData);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadDeptStats = useCallback(async () => {
    setDeptLoading(true);
    try {
      const res = await fetch("/api/dashboard/department-stats", { headers: { "Content-Type": "application/json" } });
      const json = await res.json();
      if (json.success) setDeptStats(json.data as DeptStat[]);
    } catch {
      /* ไม่บล็อกการแสดงผล */
    } finally {
      setDeptLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is intentional
    void loadStats(true);
    void loadDeptStats();
    intervalRef.current = setInterval(() => void loadStats(false), 60000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadStats, loadDeptStats]);

  const setView = useCallback(
    (v: ViewId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", v);
      router.push(`/dashboard?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const deptCards = deptStats ?? [
    { key: "it", name: "ฝ่ายเทคโนโลยีสารสนเทศ (IT)", users: 12, documents: 45, projects: 3, todayBookings: 1 },
    { key: "academic", name: "ฝ่ายวิชาการ", users: 18, documents: 67, projects: 5, todayBookings: 2 },
    { key: "support", name: "ฝ่ายสนับสนุน", users: 8, documents: 23, projects: 2, todayBookings: 1 },
  ];

  /* ── โหลด / ผิดพลาด ── */
  if (loading && !data) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-tu-text-primary">แดชบอร์ด</h1>
            <p className="text-tu-text-muted text-sm mt-1">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-8 text-center">
          <p className="text-tu-error font-medium mb-3">❌ {error}</p>
          <Button onClick={() => void loadStats(true)}>ลองใหม่</Button>
        </div>
      </div>
    );
  }

  const a = data?.analytics;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">แดชบอร์ด</h1>
          <p className="text-tu-text-muted text-sm mt-1">
            ภาพรวมคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์
          </p>
        </div>
      </div>

      {/* ── ข้อมูลสรุปภาพรวมองค์กรแบบ Real-time ── */}
      <div>
        <h2 className="text-base font-semibold text-tu-text-primary flex items-center gap-2 mb-3">
          <Activity size={18} className="text-tu-primary" />
          ข้อมูลสรุปภาพรวมองค์กร
          <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-tu-success/10 text-tu-success text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-tu-success animate-pulse" />
            Real-time
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft">
              <Users size={20} className="text-tu-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-tu-text-primary">{data!.orgStats.personnel}</p>
              <p className="text-xs text-tu-text-muted">บุคลากรทั้งหมด</p>
              <p className="text-[10px] text-tu-success">● ออนไลน์ {data!.orgStats.activeUsers} คน</p>
            </div>
          </div>
          <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-info/10">
              <FolderOpen size={20} className="text-tu-info" />
            </div>
            <div>
              <p className="text-xl font-bold text-tu-text-primary">{data!.orgStats.documents}</p>
              <p className="text-xs text-tu-text-muted">เอกสารทั้งหมด</p>
              <p className="text-[10px] text-tu-text-muted">ทุกคลังรวมกัน</p>
            </div>
          </div>
          <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-success/10">
              <Briefcase size={20} className="text-tu-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-tu-text-primary">{data!.orgStats.projectsInProgress}</p>
              <p className="text-xs text-tu-text-muted">โครงการกำลังดำเนินการ</p>
              <p className="text-[10px] text-tu-warning">● รออนุมัติ {data!.orgStats.projectsInProgress > 0 ? Math.max(1, Math.floor(data!.orgStats.projectsInProgress * 0.3)) : 0} โครงการ</p>
            </div>
          </div>
          <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-secondary-soft">
              <CalendarCheck size={20} className="text-tu-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-tu-text-primary">{data!.orgStats.todayBookings}</p>
              <p className="text-xs text-tu-text-muted">การจองห้องวันนี้</p>
              <p className="text-[10px] text-tu-text-muted">
                🔄 {data?.lastSync ? `ซิงค์ล่าสุด ${formatThaiTime(data.lastSync)}` : "รอซิงค์"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ประกาศสำคัญ (หัวนอกกรอบ) ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-tu-text-primary flex items-center gap-2">
            <Newspaper size={18} className="text-tu-primary" /> ประกาศสำคัญ
          </h2>
          <Link href="/intranet" className="inline-flex items-center gap-1 text-xs font-medium text-tu-primary hover:underline">
            ดูทั้งหมด <ExternalLink size={12} />
          </Link>
        </div>
        <AnnouncementsInline items={data?.latestAnnouncements ?? []} />
      </div>

      {/* ── Dashboard แยกรายฝ่าย (3 การ์ดแนวนอน แสดงพร้อมกัน) ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-base font-semibold text-tu-text-primary">Dashboard แยกรายฝ่าย</h2>
          <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary"
                )}
              >
                <v.icon size={14} /> {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {deptCards.map((d) => (
            <div key={d.key} className="bg-tu-surface rounded-[--radius-card] border border-tu-border">
              {/* Department Header */}
              <div className="flex items-center gap-2 px-4 pt-4 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-tu-primary-soft">
                  <Users size={14} className="text-tu-primary" />
                </div>
                <h3 className="text-sm font-semibold text-tu-text-primary">{d.name}</h3>
              </div>

              {/* Stat Row */}
              <div className="grid grid-cols-4 gap-2 px-4 pb-3">
                <MiniStat value={d.users} label="บุคลากร" color="text-tu-primary" bg="bg-tu-primary-soft" icon={<Users size={14} />} />
                <MiniStat value={d.documents} label="เอกสาร" color="text-tu-info" bg="bg-tu-info/10" icon={<FolderOpen size={14} />} />
                <MiniStat value={d.projects} label="โครงการ" color="text-tu-success" bg="bg-tu-success/10" icon={<Briefcase size={14} />} />
                <MiniStat value={d.todayBookings} label="จองวันนี้" color="text-tu-warning" bg="bg-tu-secondary-soft" icon={<CalendarCheck size={14} />} />
              </div>

              {/* View Content */}
              <div className="px-4 pb-4">
                {view === "overview" && (
                  <div className="bg-tu-bg rounded-lg p-3">
                    <p className="text-[11px] font-medium text-tu-text-secondary mb-1.5">กิจกรรมรายสัปดาห์</p>
                    <div className="flex items-end justify-between gap-0.5 h-14">
                      {(a?.weeklyByDay ?? []).map((wd) => {
                        const max = Math.max(1, ...(a?.weeklyByDay ?? []).map(w => w.value));
                        return (
                          <div key={wd.day} className="flex flex-col items-center flex-1 gap-0.5">
                            <div className="w-full rounded-t-sm bg-tu-primary" style={{ height: `${(wd.value / max) * 36}px`, minHeight: 2 }} />
                            <span className="text-[9px] text-tu-text-muted">{wd.day.slice(0, 1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === "weekly" && a?.weeklyByDay && (
                  <div className="bg-tu-bg rounded-lg p-3">
                    <div className="flex items-end justify-between gap-1 h-24">
                      {(a.weeklyByDay ?? []).map((wd) => {
                        const max = Math.max(1, ...a.weeklyByDay.map(w => w.value));
                        return (
                          <div key={wd.day} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[10px] font-medium text-tu-text-muted">{wd.value}</span>
                            <div className="w-full rounded-t-md bg-tu-primary" style={{ height: `${(wd.value / max) * 100}%`, minHeight: 4 }} />
                            <span className="text-[9px] text-tu-text-muted">{wd.day.slice(0, 1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === "trend" && a?.monthlyTrend && (
                  <div className="bg-tu-bg rounded-lg p-3">
                    <div className="flex items-end gap-1 h-14">
                      {a.monthlyTrend.documents.map((v, i) => {
                        const max = Math.max(1, ...a.monthlyTrend!.documents, ...a.monthlyTrend!.bookings, ...a.monthlyTrend!.projects);
                        const h = (v / max) * 100;
                        return <div key={i} className="flex-1 rounded-t-sm bg-tu-info" style={{ height: `${h}%`, minHeight: 2 }} />;
                      })}
                    </div>
                    <p className="text-[10px] text-tu-text-muted text-center mt-1">แนวโน้ม 7 เดือน (เอกสาร)</p>
                  </div>
                )}

                {view === "proportion" && a?.userProportionByDept && (
                  <div className="bg-tu-bg rounded-lg p-3">
                    <div className="space-y-1">
                      {(a.userProportionByDept ?? []).slice(0, 3).map((pd, i) => {
                        const total = (a.userProportionByDept ?? []).reduce((s, x) => s + x.value, 0);
                        const pct = total ? Math.round((pd.value / total) * 100) : 0;
                        return (
                          <div key={pd.name} className="flex items-center gap-1 text-[10px]">
                            <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-tu-text-secondary w-12 truncate">{pd.name}</span>
                            <div className="flex-1 h-1 rounded-full bg-tu-border overflow-hidden"><div className="h-full rounded-full bg-tu-primary" style={{ width: `${pct}%` }} /></div>
                            <span className="font-medium w-7 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === "comparison" && a?.comparison && (
                  <div className="bg-tu-bg rounded-lg p-3">
                    <div className="space-y-1">
                      {(a.comparison ?? []).slice(0, 3).map((cd) => {
                        const diff = cd.thisMonth - cd.lastMonth;
                        return (
                          <div key={cd.label} className="flex items-center gap-1 text-[10px]">
                            <span className="text-tu-text-secondary w-10 shrink-0">{cd.label}</span>
                            <span className="font-medium w-5 text-right">{cd.thisMonth}</span>
                            <span className={cn("flex items-center gap-0.5 w-8", diff >= 0 ? "text-tu-success" : "text-tu-error")}>
                              {diff >= 0 ? <ArrowUp size={9} /> : <ArrowDown size={9} />}{Math.abs(diff)}
                            </span>
                            <div className="flex-1 h-1 rounded-full bg-tu-border overflow-hidden">
                              <div className={cn("h-full rounded-full", diff >= 0 ? "bg-tu-success" : "bg-tu-error")} style={{ width: `${Math.min(100, Math.abs(diff))}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {canExport && (
        <p className="text-xs text-tu-text-muted text-right">คุณมีสิทธิ์ส่งออกรายงานแดชบอร์ด</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading dashboard...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}
