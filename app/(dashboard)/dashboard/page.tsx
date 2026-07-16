"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  Users, GraduationCap, UserCheck,
  Newspaper, BookOpen, ExternalLink, BarChart3, TrendingUp,
  PieChart, Activity, Building2, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, LabelList,
} from "recharts";
import { cn } from "@/lib/utils";
import { swrFetcher } from "@/lib/fetcher";
import { useHasMinRoleLevel } from "@/hooks/use-permission";
import { useChartPalette } from "@/hooks/use-chart-colors";
import { ChartTooltip, SimpleTooltip } from "@/components/charts/chart-tooltip";

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
  const colors = useChartPalette();
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
      {proportion.length === 0 ? <p className="text-xs text-tu-text-muted">ไม่มีข้อมูล</p> : (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={proportion} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--tu-border)" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--tu-text-secondary)" }} width={80} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip valueFormatter={(v) => v.toLocaleString("th-TH")} />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={400} animationEasing="ease">
              {proportion.map((_, i) => (<Cell key={i} fill={colors[i % colors.length]} />))}
              <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: "var(--tu-text-primary)" }} formatter={(v: unknown) => Number(v).toLocaleString("th-TH")} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
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
   Overview Chart --- Area Chart
   ============================================================================== */

function OverviewChart({ data }: { data: WeeklyPoint[] }) {
  const colors = useChartPalette();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity={0.25} />
            <stop offset="100%" stopColor={colors[0]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip content={<SimpleTooltip />} />
        <Area type="monotone" dataKey="value" stroke={colors[0]} fill="url(#areaGrad)" strokeWidth={2} animationDuration={400} animationEasing="ease" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ==============================================================================
   Weekly Chart --- Bar Chart by day
   ============================================================================== */

function WeeklyBarChart({ weekly }: { weekly: WeeklyPoint[] }) {
  const colors = useChartPalette();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={weekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip valueFormatter={(v) => v.toLocaleString("th-TH")} />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={400} animationEasing="ease">
          {weekly.map((_, i) => (<Cell key={i} fill={colors[i % colors.length]} />))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ==============================================================================
   Trend Chart --- Multi-series Line Chart
   ============================================================================== */

function TrendLineChart({ trend }: { trend: MonthlyTrend }) {
  const colors = useChartPalette();
  const data = trend.labels.map((label, i) => ({
    month: label,
    เอกสาร: trend.documents[i],
    จองห้อง: trend.bookings[i],
    โครงการ: trend.projects[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="เอกสาร" stroke={colors[0]} strokeWidth={2} dot={{ r: 3, fill: colors[0] }} activeDot={{ r: 5 }} animationDuration={400} animationEasing="ease" />
        <Line type="monotone" dataKey="จองห้อง" stroke={colors[1]} strokeWidth={2} dot={{ r: 3, fill: colors[1] }} activeDot={{ r: 5 }} animationDuration={400} animationEasing="ease" />
        <Line type="monotone" dataKey="โครงการ" stroke={colors[2]} strokeWidth={2} dot={{ r: 3, fill: colors[2] }} activeDot={{ r: 5 }} animationDuration={400} animationEasing="ease" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ==============================================================================
   Proportion Chart --- Donut
   ============================================================================== */

function ProportionDonut({ data }: { data: ProportDept[] }) {
  const colors = useChartPalette();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={105}
          dataKey="value"
          nameKey="name"
          animationDuration={400}
          animationEasing="ease"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={{ stroke: "var(--tu-text-muted)", strokeWidth: 1 }}
        >
          {data.map((_, i) => (<Cell key={i} fill={colors[i % colors.length]} />))}
        </Pie>
        <Tooltip content={<ChartTooltip valueFormatter={(v) => v.toLocaleString("th-TH")} />} />
      </RPieChart>
    </ResponsiveContainer>
  );
}

/* ==============================================================================
   Comparison Chart --- Grouped Bar + % change labels
   ============================================================================== */

function ComparisonChart({ data }: { data: ComparisonPoint[] }) {
  const colors = useChartPalette();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 20, right: 5, left: -20, bottom: 0 }} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
        <ReferenceLine y={0} stroke="var(--tu-border)" />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar name="เดือนนี้" dataKey="thisMonth" fill={colors[0]} radius={[4, 4, 0, 0]} animationDuration={400} animationEasing="ease" />
        <Bar name="เดือนก่อน" dataKey="lastMonth" fill={colors[4]} radius={[4, 4, 0, 0]} opacity={0.6} animationDuration={400} animationEasing="ease" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ==============================================================================
   Chart Panel --- renders correct chart per view
   ============================================================================== */

function DeptChartPanel({ view, analytics }: { view: ViewId; analytics: DashboardData["analytics"] | undefined }) {
  const a = analytics;
  if (!a) return <div className="h-64 flex items-center justify-center text-xs text-tu-text-muted">Loading...</div>;

  switch (view) {
    case "weekly":
      return <WeeklyBarChart weekly={a.weeklyByDay} />;
    case "trend":
      return <TrendLineChart trend={a.monthlyTrend} />;
    case "proportion":
      return <ProportionDonut data={a.userProportionByDept} />;
    case "comparison":
      return <ComparisonChart data={a.comparison} />;
    default:
      return <OverviewChart data={a.weeklyByDay} />;
  }
}

/* ==============================================================================
   Main Page Content
   ============================================================================== */

function DashboardPageContent() {
  const router = useRouter(); const searchParams = useSearchParams();
  const rawView = searchParams.get("view") as ViewId | null;

  const isDeanOrHigher = useHasMinRoleLevel(70);
  const visibleViews = isDeanOrHigher ? views : views.filter(v => v.id !== "comparison");
  const ALLOWED_VIEWS_FILTERED: ViewId[] = isDeanOrHigher ? ALLOWED_VIEWS : ALLOWED_VIEWS.filter(v => v !== "comparison");
  const view: ViewId = rawView && ALLOWED_VIEWS_FILTERED.includes(rawView) ? rawView : "overview";

  const { data, error: statsError, isLoading } = useSWR("/api/dashboard/stats", swrFetcher<DashboardData>, {
    refreshInterval: 300000,
    revalidateOnFocus: true,
  });
  const { data: deptStats } = useSWR("/api/dashboard/department-stats", swrFetcher<DeptStat[]>);
  const error = statsError ? "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้" : null;

  const setView = useCallback((v: ViewId) => { const params = new URLSearchParams(searchParams.toString()); params.set("view", v); router.push(`/dashboard?${params.toString()}`, { scroll: false }); }, [router, searchParams]);

  if (isLoading) return (<div className="p-6 space-y-6"><div className="h-8 w-48 bg-tu-surface rounded animate-pulse" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 h-[104px] animate-pulse" />))}</div></div>);
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

      {/* Main BI Chart Area */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div><h2 className="text-base font-semibold text-tu-text-primary flex items-center gap-2"><Building2 size={18} className="text-tu-primary" />Dashboard แยกรายฝ่าย</h2><p className="text-xs text-tu-text-muted mt-0.5">ข้อมูล BI แสดงผลตามมุมมองที่เลือก</p></div>
          <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5">{visibleViews.map((v) => (<button key={v.id} onClick={() => setView(v.id)} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", view === v.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary hover:text-tu-text-primary")}><v.icon size={14} />{v.label}</button>))}</div>
        </div>
        <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5">
          <DeptChartPanel view={view} analytics={a} />
        </div>
      </div>

      {/* Department Cards --- summary stats */}
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
                <div className="flex items-center justify-between mb-1"><span className="text-[11px] font-medium text-tu-text-secondary">ตัวชี้วัดสำคัญ</span></div>
                <div className="text-xs text-tu-text-muted">{d.documents + d.projects} รายการทั้งหมด · {d.todayBookings} จองวันนี้</div>
              </div>
            </div>
          );
        })}
      </div>

      <NewsCard />
    </div>
  );
}

export default function DashboardPage() {
  return (<Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading dashboard...</div>}><DashboardPageContent /></Suspense>);
}
