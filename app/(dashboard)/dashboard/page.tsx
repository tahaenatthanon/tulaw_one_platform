"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  Users, GraduationCap, UserCheck,
  Newspaper, BookOpen, ExternalLink, BarChart3, TrendingUp,
  PieChart, Activity, Building2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { swrFetcher } from "@/lib/fetcher";
import { useHasMinRoleLevel } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

interface OrgStats { personnel: number; activeUsers: number; documents: number; projectsInProgress: number; todayBookings: number; }
interface AnnouncementItem { id: string; title: string; category: string; publishDate: string; status: string; }
interface ProportDept { name: string; value: number; }
interface WeeklyPoint { day: string; value: number; }
interface MonthlyTrend { labels: string[]; documents: number[]; bookings: number[]; projects: number[]; }
interface ComparisonPoint { label: string; thisMonth: number; lastMonth: number; }

interface DashboardData {
  orgStats: OrgStats; lastSync: string;
  latestAnnouncements: AnnouncementItem[];
  analytics: {
    weeklyByDay: WeeklyPoint[];
    userProportionByDept: ProportDept[];
    monthlyTrend: MonthlyTrend;
    comparison: ComparisonPoint[];
  };
}

interface DeptStat { key: string; name: string; users: number; documents: number; projects: number; todayBookings: number; }
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

const CHART_COLORS = ["var(--tu-primary)", "var(--tu-info)", "var(--tu-secondary-active)", "var(--tu-success)", "var(--tu-warning)", "var(--tu-text-muted)"];

const STAT_CARDS = [
  { key: "personnel", label: "จำนวนบุคลากร", icon: Users, color: "text-tu-primary", bg: "bg-tu-primary-soft", defaultValue: 247 },
  { key: "courses", label: "จำนวนหลักสูตร", icon: BookOpen, color: "text-tu-info", bg: "bg-tu-info/10", defaultValue: 38 },
  { key: "students", label: "จำนวนนักศึกษา", icon: GraduationCap, color: "text-tu-warning", bg: "bg-tu-warning/10", defaultValue: 2847 },
] as const;

const deptConfigs: Record<string, { label: string; color: string; bg: string }> = {
  it: { label: "IT", color: "text-tu-info", bg: "bg-tu-info/10" },
  academic: { label: "ACAD", color: "text-tu-success", bg: "bg-tu-success/10" },
  support: { label: "SUP", color: "text-tu-warning", bg: "bg-tu-warning/10" },
};

/* ==============================================================================
   Helpers
   ============================================================================== */

function formatThaiDate(iso: string): string { const d = new Date(iso); if (Number.isNaN(d.getTime())) return "-"; return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }); }
function formatThaiTime(iso: string): string { const d = new Date(iso); if (Number.isNaN(d.getTime())) return "-"; return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }); }

const CATEGORY_COLORS: Record<string, string> = {
  "ประกาศด่วน": "bg-tu-error/10 text-tu-error border-tu-error/20", "ด่วน": "bg-tu-error/10 text-tu-error border-tu-error/20",
  "เชิญชวน": "bg-tu-info/10 text-tu-info border-tu-info/20", "ประกาศผล": "bg-tu-success/10 text-tu-success border-tu-success/20",
  "นโยบาย": "bg-tu-warning/10 text-tu-warning border-tu-warning/20", "ทั่วไป": "bg-tu-bg text-tu-text-secondary border-tu-border",
};
const CATEGORY_DOTS: Record<string, string> = { "ประกาศด่วน": "bg-tu-error", "ด่วน": "bg-tu-error", "เชิญชวน": "bg-tu-info", "ประกาศผล": "bg-tu-success", "นโยบาย": "bg-tu-warning", "ทั่วไป": "bg-tu-text-muted" };

/* ==============================================================================
   Components
   ============================================================================== */

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-tu-text-muted">{label}</p>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}><Icon size={20} className={color} /></div>
      </div>
      <p className="text-3xl font-bold text-tu-text-primary tabular-nums">{value.toLocaleString("th-TH")}</p>
    </div>
  );
}

function PersonnelBreakdown({ stats, proportion }: { stats: OrgStats; proportion: ProportDept[] }) {
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tu-primary-soft"><UserCheck size={16} className="text-tu-primary" /></div>
        <h3 className="text-sm font-semibold text-tu-text-primary">สถิติองค์กร</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[{ label: "บุคลากรทั้งหมด", value: stats.personnel },{ label: "ออนไลน์วันนี้", value: stats.activeUsers },{ label: "เอกสารทั้งหมด", value: stats.documents },{ label: "โครงการกำลังทำ", value: stats.projectsInProgress },{ label: "จองห้องวันนี้", value: stats.todayBookings },{ label: "หลักสูตร", value: 38 }].map((s) => (
          <div key={s.label} className="bg-tu-bg rounded-lg p-3 text-center"><p className="text-lg font-bold text-tu-text-primary tabular-nums">{s.value.toLocaleString("th-TH")}</p><p className="text-[10px] text-tu-text-muted mt-0.5">{s.label}</p></div>
        ))}
      </div>
      <h4 className="text-xs font-semibold text-tu-text-secondary mb-2 flex items-center gap-1.5"><BarChart3 size={12} />สัดส่วนบุคลากรแยกตามหน่วยงาน</h4>
      <div className="space-y-2">
        {proportion.length === 0 ? <p className="text-xs text-tu-text-muted">ไม่มีข้อมูล</p> : proportion.map((d, i) => {
          const total = proportion.reduce((s, x) => s + x.value, 0); const pct = total ? Math.round((d.value / total) * 100) : 0;
          const colors = ["bg-tu-primary", "bg-tu-info", "bg-tu-success", "bg-tu-warning", "bg-tu-secondary-active"];
          return (<div key={d.name} className="space-y-1"><div className="flex justify-between text-xs"><span className="text-tu-text-secondary">{d.name}</span><span className="font-medium text-tu-text-primary tabular-nums">{d.value} ({pct}%)</span></div><div className="h-2 rounded-full bg-tu-bg overflow-hidden"><div className={cn("h-full rounded-full transition-all", colors[i % colors.length])} style={{ width: `${pct}%` }} /></div></div>);
        })}
      </div>
    </div>
  );
}

function AnnouncementsCard({ items }: { items: AnnouncementItem[] }) {
  const display = items.slice(0, 4);
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border">
      <div className="px-5 py-4 border-b border-tu-border flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tu-primary-soft"><Newspaper size={16} className="text-tu-primary" /></div><h3 className="text-sm font-semibold text-tu-text-primary">ประกาศล่าสุด</h3></div>
        <Link href="/intranet" className="inline-flex items-center gap-1 text-xs font-medium text-tu-primary hover:text-tu-primary-hover transition-colors">ดูทั้งหมด <ExternalLink size={12} /></Link>
      </div>
      {display.length === 0 ? <div className="p-5 text-center text-sm text-tu-text-muted">ไม่มีประกาศ</div> : (
        <div className="divide-y divide-tu-border">{display.map((ann) => (
          <div key={ann.id} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-tu-bg/50 transition-colors cursor-pointer group">
            <span className={cn("w-2 h-2 rounded-full shrink-0", CATEGORY_DOTS[ann.category] ?? "bg-tu-text-muted")} />
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border shrink-0", CATEGORY_COLORS[ann.category] ?? "bg-tu-bg text-tu-text-secondary border-tu-border")}>{ann.category}</span>
            <span className="text-tu-text-primary truncate flex-1 group-hover:text-tu-primary transition-colors text-sm">{ann.title}</span>
            <span className="text-tu-text-muted text-xs shrink-0">{formatThaiDate(ann.publishDate)}</span>
          </div>
        ))}</div>
      )}
    </div>
  );
}

function NewsCard() {
  const news = [
    { title: "คณะนิติศาสตร์จัดโครงการอบรมกฎหมายใหม่ สำหรับนักศึกษาชั้นปีที่ 1", date: "10 ก.ค. 2568" },
    { title: "ขอเชิญร่วมงานสัมมนาทางวิชาการ เรื่อง กฎหมายกับสังคมสูงวัย", date: "8 ก.ค. 2568" },
    { title: "แจ้งกำหนดการสอบกลางภาค ประจำภาคการศึกษา 1/2568", date: "5 ก.ค. 2568" },
    { title: "เปิดรับสมัครทุนวิจัย ประจำปีงบประมาณ 2568", date: "2 ก.ค. 2568" },
    { title: "ตารางอบรมเชิงปฏิบัติการ เรื่อง การเขียนบทความทางกฎหมาย", date: "28 มิ.ย. 2568" },
  ];
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border">
      <div className="px-5 py-4 border-b border-tu-border flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tu-info/10"><GraduationCap size={16} className="text-tu-info" /></div><h3 className="text-sm font-semibold text-tu-text-primary">ข่าวสารและกิจกรรม</h3></div>
      <div className="divide-y divide-tu-border">{news.map((n, i) => (<div key={i} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-tu-bg/50 transition-colors cursor-pointer"><div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-tu-primary-soft text-[10px] font-bold text-tu-primary">{i + 1}</div><span className="text-tu-text-primary text-sm flex-1 truncate">{n.title}</span><span className="text-tu-text-muted text-xs shrink-0">{n.date}</span></div>))}</div>
    </div>
  );
}

/* ==============================================================================
   DeptMiniChart — 5 view modes
   ============================================================================== */

function DeptMiniChart({ view, analytics }: { view: ViewId; analytics: DashboardData["analytics"] | undefined }) {
  const a = analytics; if (!a) return <div className="h-20 flex items-center justify-center text-xs text-tu-text-muted">Loading...</div>;

  if (view === "weekly" && a.weeklyByDay) {
    const max = Math.max(1, ...a.weeklyByDay.map(w => w.value));
    return (<div className="flex items-end justify-between gap-1 h-20">{a.weeklyByDay.map((wd, i) => (<div key={wd.day} className="flex flex-col items-center gap-1 flex-1 h-full justify-end"><div className="w-full rounded-t-sm" style={{ height: `${Math.max(3, (wd.value / max) * 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} /><span className="text-[9px] text-tu-text-muted">{wd.day.slice(0, 1)}</span></div>))}</div>);
  }
  if (view === "trend" && a.monthlyTrend) {
    const allVals = [...a.monthlyTrend.documents, ...a.monthlyTrend.bookings, ...a.monthlyTrend.projects]; const max = Math.max(1, ...allVals);
    const series = [{ data: a.monthlyTrend.projects, color: "var(--tu-primary)" },{ data: a.monthlyTrend.documents, color: "var(--tu-info)" },{ data: a.monthlyTrend.bookings, color: "var(--tu-secondary-active)" }];
    return (<div className="flex items-end gap-1 h-20">{a.monthlyTrend.labels.map((_, i) => (<div key={i} className="flex-1 flex items-end gap-[2px] h-full">{series.map((s, si) => (<div key={si} className="flex-1 rounded-t-[2px]" style={{ height: `${Math.max(2, (s.data[i] / max) * 100)}%`, backgroundColor: s.color }} />))}</div>))}</div>);
  }
  if (view === "proportion" && a.userProportionByDept) {
    const total = a.userProportionByDept.reduce((s, x) => s + x.value, 0);
    return (<div className="space-y-1.5 py-1">{a.userProportionByDept.slice(0, 4).map((pd, i) => { const pct = total ? Math.round((pd.value / total) * 100) : 0; return (<div key={pd.name} className="flex items-center gap-1 text-[10px]"><span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} /><span className="text-tu-text-muted w-14 truncate">{pd.name}</span><div className="flex-1 h-1 rounded-full bg-tu-border overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} /></div><span className="font-medium tabular-nums">{pct}%</span></div>); })}</div>);
  }
  if (view === "comparison" && a.comparison) {
    return (<div className="flex items-center gap-3 h-20">{a.comparison.slice(0, 2).map((cd) => { const max = Math.max(1, cd.thisMonth, cd.lastMonth); return (<div key={cd.label} className="flex-1 space-y-1"><span className="text-[9px] text-tu-text-muted">{cd.label}</span><div className="flex items-end gap-1 h-12"><div className="flex-1 rounded-t-sm bg-tu-primary" style={{ height: `${Math.max(2, (cd.thisMonth / max) * 100)}%` }} /><div className="flex-1 rounded-t-sm bg-tu-text-muted/30" style={{ height: `${Math.max(2, (cd.lastMonth / max) * 100)}%` }} /></div><div className="flex gap-2 text-[9px]"><span className="text-tu-primary font-medium">{cd.thisMonth}</span><span className="text-tu-text-muted">{cd.lastMonth}</span></div></div>); })}</div>);
  }
  if (a.weeklyByDay) {
    const max = Math.max(1, ...a.weeklyByDay.map(w => w.value));
    return (<div className="flex items-end justify-between gap-0.5 h-20">{a.weeklyByDay.map((wd, i) => (<div key={wd.day} className="flex flex-col items-center flex-1 gap-0.5 h-full justify-end"><div className="w-full rounded-t-sm" style={{ height: `${Math.max(3, (wd.value / max) * 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} /><span className="text-[9px] text-tu-text-muted">{wd.day.slice(0, 1)}</span></div>))}</div>);
  }
  return <div className="h-20 flex items-center justify-center text-xs text-tu-text-muted">—</div>;
}

/* ==============================================================================
   Main Page Content
   ============================================================================== */

function DashboardPageContent() {
  const router = useRouter(); const searchParams = useSearchParams();
  const rawView = searchParams.get("view") as ViewId | null;

  // Filter views based on role: Comparison view only for Dean+ (level >= 70)
  const isDeanOrHigher = useHasMinRoleLevel(70);
  const visibleViews = isDeanOrHigher ? views : views.filter(v => v.id !== "comparison");
  const ALLOWED_VIEWS_FILTERED: ViewId[] = isDeanOrHigher ? ALLOWED_VIEWS : ALLOWED_VIEWS.filter(v => v !== "comparison");
  const view: ViewId = rawView && ALLOWED_VIEWS_FILTERED.includes(rawView) ? rawView : "overview";

  // SWR: auto-cached, revalidates on focus every 5 min
  const { data, error: statsError, isLoading } = useSWR("/api/dashboard/stats", swrFetcher<DashboardData>, {
    refreshInterval: 300000, // revalidate every 5 min (not 60s)
    revalidateOnFocus: true,
  });
  const { data: deptStats } = useSWR("/api/dashboard/department-stats", swrFetcher<DeptStat[]>);
  const error = statsError ? "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้" : null;

  const setView = useCallback((v: ViewId) => { const params = new URLSearchParams(searchParams.toString()); params.set("view", v); router.push(`/dashboard?${params.toString()}`, { scroll: false }); }, [router, searchParams]);

  if (isLoading) return (<div className="p-6 space-y-6 animate-pulse"><div className="h-8 w-48 bg-tu-surface rounded" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 h-[104px]" />))}</div></div>);
  if (error) return (<div className="p-6"><div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-10 text-center"><p className="text-tu-error font-semibold mb-2">ไม่สามารถโหลดข้อมูลได้</p><p className="text-sm text-tu-text-muted mb-4">{error}</p><button onClick={() => window.location.reload()} className="rounded-[--radius-btn] bg-tu-primary text-white px-4 py-2 text-sm font-medium hover:bg-tu-primary-hover transition-colors">ลองใหม่</button></div></div>);

  const statValues: Record<string, number> = { personnel: data?.orgStats.personnel ?? 247, courses: 38, students: 2847 };
  const a = data?.analytics;
  const deptCards = deptStats ?? [{ key: "it", name: "ฝ่ายเทคโนโลยีสารสนเทศ (IT)", users: 12, documents: 45, projects: 3, todayBookings: 1 },{ key: "academic", name: "ฝ่ายวิชาการ", users: 18, documents: 67, projects: 5, todayBookings: 2 },{ key: "support", name: "ฝ่ายสนับสนุน", users: 8, documents: 23, projects: 2, todayBookings: 1 }];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-tu-text-primary">Dashboard</h1><p className="text-tu-text-muted text-sm mt-1">ภาพรวมคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์</p></div>
        {data?.lastSync && (<span className="text-xs text-tu-text-muted flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-tu-success opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-tu-success" /></span><RefreshCw size={12} />อัปเดตล่าสุด {formatThaiTime(data.lastSync)}</span>)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{STAT_CARDS.map((card) => (<StatCard key={card.key} label={card.label} value={statValues[card.key] ?? card.defaultValue} icon={card.icon} color={card.color} bg={card.bg} />))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><PersonnelBreakdown stats={data!.orgStats} proportion={a?.userProportionByDept ?? []} /><AnnouncementsCard items={data?.latestAnnouncements ?? []} /></div>

      {/* Department Breakdown + 5 View Modes */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div><h2 className="text-base font-semibold text-tu-text-primary flex items-center gap-2"><Building2 size={18} className="text-tu-primary" />Dashboard แยกรายฝ่าย</h2><p className="text-xs text-tu-text-muted mt-0.5">ข้อมูล 3 ฝ่าย</p></div>
          <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5">{visibleViews.map((v) => (<button key={v.id} onClick={() => setView(v.id)} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", view === v.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary hover:text-tu-text-primary")}><v.icon size={14} />{v.label}</button>))}</div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {deptCards.map((d) => {
            const cfg = deptConfigs[d.key] ?? { label: d.key, color: "text-tu-primary", bg: "bg-tu-primary-soft" };
            return (
              <div key={d.key} className="bg-tu-surface rounded-[--radius-card] border border-tu-border hover:shadow-md transition-shadow overflow-hidden">
                <div className="px-5 pt-5 pb-3 border-b border-tu-border">
                  <div className="flex items-center gap-3"><div className={cn("flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm", cfg.bg, cfg.color)}>{cfg.label}</div><div><h3 className="text-sm font-semibold text-tu-text-primary leading-tight">{d.name}</h3><p className="text-[10px] text-tu-text-muted">{d.users} บุคลากร · {d.documents} เอกสาร</p></div></div>
                </div>
                <div className="grid grid-cols-4 gap-1 px-3 py-3 border-b border-tu-border bg-tu-bg/30">{[{ v: d.users, l: "บุคลากร" },{ v: d.documents, l: "เอกสาร" },{ v: d.projects, l: "โครงการ" },{ v: d.todayBookings, l: "จองวันนี้" }].map((s, si) => (<div key={si} className="text-center py-1.5"><p className="text-sm font-bold text-tu-text-primary tabular-nums">{s.v}</p><p className="text-[9px] text-tu-text-muted">{s.l}</p></div>))}</div>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2"><span className="text-[11px] font-medium text-tu-text-secondary">{view === "overview" ? "ภาพรวมรายสัปดาห์" : view === "weekly" ? "กิจกรรมรายวัน" : view === "trend" ? "แนวโน้มรายเดือน" : view === "proportion" ? "สัดส่วน" : "เปรียบเทียบ"}</span><span className="text-[9px] text-tu-text-muted">{views.find(v => v.id === view)?.label}</span></div>
                  <DeptMiniChart view={view} analytics={a} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <NewsCard />
    </div>
  );
}

export default function DashboardPage() {
  return (<Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading dashboard...</div>}><DashboardPageContent /></Suspense>);
}
