"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  Users, GraduationCap, Cpu,
  Newspaper, ExternalLink, BarChart3, TrendingUp, ArrowUpRight,
  PieChart, Activity, RefreshCw, FlaskConical, TrendingDown, ChevronRight, X,
  ClipboardList,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { swrFetcher } from "@/lib/fetcher";
import { useHasMinRoleLevel } from "@/hooks/use-permission";
import { useChartPalette } from "@/hooks/use-chart-colors";
import { ChartTooltip, SimpleTooltip } from "@/components/charts/chart-tooltip";

/** Convert hex to rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

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
  { key: "onlineSystems", label: "ระบบออนไลน์", icon: Activity, color: "text-tu-info", bg: "bg-tu-info/10", defaultValue: 6 },
  { key: "projects", label: "โครงการ", icon: FlaskConical, color: "text-tu-success", bg: "bg-tu-success/10", defaultValue: 15 },
  { key: "students", label: "จำนวนนักศึกษา", icon: GraduationCap, color: "text-tu-warning", bg: "bg-tu-warning/10", defaultValue: 2847 },
] as const;

const deptTabs = [
  { key: "academic", label: "ฝ่ายวิชาการ", icon: GraduationCap, sub: "Academic Affairs" },
  { key: "it", label: "ฝ่ายเทคโนโลยีสารสนเทศ", icon: Cpu, sub: "IT Operations" },
  { key: "support", label: "ฝ่ายสนับสนุน", icon: Users, sub: "Support Services" },
] as const;
type DeptKey = (typeof deptTabs)[number]["key"];

/* ==============================================================================
   Per-Department Mock Data — charts change when dept changes
   ============================================================================== */

const DEPT_WEEKLY: Record<DeptKey, WeeklyPoint[]> = {
  academic: [
    { day: "จ.", value: 145 }, { day: "อ.", value: 178 }, { day: "พ.", value: 132 },
    { day: "พฤ.", value: 201 }, { day: "ศ.", value: 167 }, { day: "ส.", value: 89 }, { day: "อา.", value: 45 },
  ],
  it: [
    { day: "จ.", value: 320 }, { day: "อ.", value: 410 }, { day: "พ.", value: 380 },
    { day: "พฤ.", value: 450 }, { day: "ศ.", value: 390 }, { day: "ส.", value: 110 }, { day: "อา.", value: 55 },
  ],
  support: [
    { day: "จ.", value: 88 }, { day: "อ.", value: 102 }, { day: "พ.", value: 95 },
    { day: "พฤ.", value: 120 }, { day: "ศ.", value: 140 }, { day: "ส.", value: 35 }, { day: "อา.", value: 20 },
  ],
};

const DEPT_TREND: Record<DeptKey, MonthlyTrend> = {
  academic: {
    labels: ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],
    documents: [45,52,48,60,55,70,65,58,62,75,68,80],
    bookings: [12,15,10,18,14,20,16,13,17,22,19,25],
    projects: [5,8,6,9,7,11,9,8,10,14,12,15],
  },
  it: {
    labels: ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],
    documents: [80,95,88,110,102,125,118,105,115,135,130,150],
    bookings: [8,10,7,12,9,15,11,9,13,18,14,20],
    projects: [3,5,4,7,5,9,8,6,8,12,10,14],
  },
  support: {
    labels: ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],
    documents: [30,35,28,40,38,45,42,36,40,50,48,55],
    bookings: [20,25,18,30,22,35,28,24,32,40,35,45],
    projects: [2,3,2,4,3,5,4,3,4,6,5,7],
  },
};

const DEPT_PROPORTION: Record<DeptKey, ProportDept[]> = {
  academic: [
    { name: "อาจารย์", value: 85 }, { name: "เจ้าหน้าที่", value: 42 }, { name: "นักศึกษา", value: 1200 }, { name: "ผู้ดูแลระบบ", value: 6 },
  ],
  it: [
    { name: "วิศวกรระบบ", value: 18 }, { name: "นักพัฒนา", value: 12 }, { name: "เจ้าหน้าที่ IT", value: 8 }, { name: "ผู้ดูแลระบบ", value: 4 },
  ],
  support: [
    { name: "ธุรการ", value: 15 }, { name: "การเงิน", value: 8 }, { name: "บริการ", value: 22 }, { name: "ผู้ดูแลระบบ", value: 3 },
  ],
};

const DEPT_COMPARISON: Record<DeptKey, ComparisonPoint[]> = {
  academic: [
    { label: "เอกสาร", thisMonth: 180, lastMonth: 165 },
    { label: "หลักสูตร", thisMonth: 45, lastMonth: 40 },
    { label: "งานวิจัย", thisMonth: 22, lastMonth: 28 },
    { label: "สอบ", thisMonth: 12, lastMonth: 10 },
  ],
  it: [
    { label: "SSO Logins", thisMonth: 2450, lastMonth: 2100 },
    { label: "Incidents", thisMonth: 85, lastMonth: 92 },
    { label: "Deployments", thisMonth: 34, lastMonth: 28 },
    { label: "Audits", thisMonth: 120, lastMonth: 110 },
  ],
  support: [
    { label: "คำร้อง", thisMonth: 320, lastMonth: 290 },
    { label: "อนุมัติ", thisMonth: 245, lastMonth: 220 },
    { label: "จองห้อง", thisMonth: 68, lastMonth: 75 },
    { label: "คลินิกกฎหมาย", thisMonth: 42, lastMonth: 38 },
  ],
};

/* ==============================================================================
   Helpers
   ============================================================================== */

function formatThaiDate(iso: string): string { const d = new Date(iso); if (Number.isNaN(d.getTime())) return "-"; return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }); }
function formatThaiTime(iso: string): string { const d = new Date(iso); if (Number.isNaN(d.getTime())) return "-"; return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }); }



/* ==============================================================================
   Components
   ============================================================================== */

function StatCard({ label, value, icon: Icon, color, bg, trend }: { label: string; value: number; icon: React.ElementType; color: string; bg: string; trend?: { value: number; isPositive: boolean } | null }) {
  return (
    <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-tu-text-muted">{label}</p>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}><Icon size={20} className={color} /></div>
      </div>
      <p className="text-4xl font-bold text-tu-text-primary tabular-nums">{value.toLocaleString("th-TH")}</p>
      {trend && (
        <p className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.isPositive ? "text-tu-success" : "text-tu-error")}>
          {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend.isPositive ? "+" : ""}{trend.value}% จากเดือนก่อน
        </p>
      )}
    </div>
  );
}

function AnnouncementsCard({ items, annCats }: { items: AnnouncementItem[]; annCats: Array<{ id: string; name: string; color: string }> }) {
  const display = items.slice(0, 3);
  const [detail, setDetail] = useState<AnnouncementItem | null>(null);

  const catMeta = (cat: string): { hex: string; soft: string } => {
    const found = annCats.find(c => c.name === cat);
    const hex = found?.color ?? "#6b7280";
    return { hex, soft: hexToRgba(hex, 0.10) };
  };

  return (
    <>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-tu-text-primary flex items-center gap-2">
          <Newspaper size={18} className="text-tu-primary" />ประกาศสำคัญ
        </h2>
        <Link href="/intranet" className="inline-flex items-center gap-1 text-xs font-medium text-tu-primary hover:text-tu-primary-hover transition-colors">
          ดูทั้งหมด <ExternalLink size={12} />
        </Link>
      </div>

      {/* Items */}
      {display.length === 0 ? (
        <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-8 text-center text-sm text-tu-text-muted">ไม่มีประกาศ</div>
      ) : (
        <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm divide-y divide-tu-border">
          {display.map((ann) => {
            const cm = catMeta(ann.category);
            return (
              <button
                key={ann.id}
                onClick={() => setDetail(ann)}
                className="w-full flex items-center gap-4 px-5 py-3 hover:bg-tu-surface-hover transition-colors duration-150 group text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: cm.soft }}>
                  <Newspaper size={18} style={{ color: cm.hex }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-tu-text-primary group-hover:text-tu-primary transition-colors truncate">{ann.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-white" style={{ borderColor: cm.hex, color: cm.hex }}>{ann.category}</span>
                    <span className="text-xs text-tu-text-muted">{formatThaiDate(ann.publishDate)}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-tu-text-muted group-hover:text-tu-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal detail={detail} onClose={() => setDetail(null)} annCats={annCats} />
    </>
  );
}

function DetailModal({ detail, onClose, annCats }: { detail: AnnouncementItem | null; onClose: () => void; annCats: Array<{ id: string; name: string; color: string }> }) {
  if (!detail) return null;
  const hex = annCats.find(c => c.name === detail.category)?.color ?? "#6b7280";
  const soft = hexToRgba(hex, 0.10);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: soft }}>
              <Newspaper size={16} style={{ color: hex }} />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-white" style={{ borderColor: hex, color: hex }}>{detail.category}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-surface-hover transition-colors"><X size={18} /></button>
        </div>
        <h2 className="text-base font-semibold text-tu-text-primary mb-3">{detail.title}</h2>
        <div className="text-xs text-tu-text-muted mb-4">
          <span>{new Date(detail.publishDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div className="border-t border-tu-border pt-4">
          <p className="text-sm text-tu-text-secondary leading-relaxed whitespace-pre-wrap">{detail.title}</p>
        </div>
        <div className="mt-6 pt-4 border-t border-tu-border flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors">ปิด</button>
        </div>
      </div>
    </div>
  );
}

function OverviewChart({ data, dept }: { data: WeeklyPoint[]; dept: DeptKey }) {
  const colors = useChartPalette();
  const chartColor = dept === "it" ? colors[1] : dept === "academic" ? colors[2] : colors[3];
  const deptName = deptTabs.find(d => d.key === dept)?.label ?? "";
  return (
    <div className="space-y-5">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<SimpleTooltip />} />
          <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2.5} fill="url(#ovGrad)" animationDuration={400} animationEasing="ease" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="border-t border-tu-border pt-4">
        <p className="text-xs font-medium text-tu-text-muted mb-3">กิจกรรมล่าสุด — {deptName}</p>
        <ul className="space-y-2">
          {(dept === "it"
            ? [{ t: "SSO Login เพิ่มขึ้น 15%", d: "10 นาทีที่แล้ว" },{ t: "ตรวจสอบความปลอดภัยเสร็จสิ้น", d: "42 นาทีที่แล้ว" },{ t: "อัปเดต Firewall Rules", d: "2 ชั่วโมงที่แล้ว" }]
            : dept === "academic"
              ? [{ t: "อนุมัติหลักสูตรใหม่ LW-421", d: "10 นาทีที่แล้ว" },{ t: "ยื่นข้อเสนอวิจัย 3 โครงการ", d: "42 นาทีที่แล้ว" },{ t: "เผยแพร่บทความวารสาร", d: "2 ชั่วโมงที่แล้ว" }]
              : [{ t: "อนุมัติคำขอจัดซื้อ 12 รายการ", d: "8 นาทีที่แล้ว" },{ t: "จองห้องประชุมจิตติฯ", d: "35 นาทีที่แล้ว" },{ t: "รับเรื่องคลินิกกฎหมาย 4 เคส", d: "1 ชั่วโมงที่แล้ว" }]
          ).map((x, i) => (
            <li key={i} className="flex items-start gap-3 p-3 rounded-xl border border-tu-border/70 hover:bg-tu-surface-hover transition-colors">
              <div className="h-8 w-8 rounded-lg bg-tu-primary-soft flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardList size={14} className="text-tu-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-tu-text-primary leading-snug">{x.t}</div>
                <div className="text-[11px] text-tu-text-muted mt-0.5">{x.d}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ==============================================================================
   Weekly Chart --- Bar Chart by day
   ============================================================================== */

function WeeklyBarChart({ weekly, dept }: { weekly: WeeklyPoint[]; dept: DeptKey }) {
  const colors = useChartPalette();
  const labels = dept === "it" ? ["SSO Logins", "Sessions", "Failed"] : dept === "academic" ? ["เอกสารส่ง", "อนุมัติ", "กิจกรรม"] : ["คำร้อง", "อนุมัติ", "รอดำเนินการ"];
  const data = weekly.map(w => ({ ...w, second: Math.round(w.value * 0.7), third: Math.round(w.value * 0.3) }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Line Chart */}
      <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Weekly Performance</p>
        <p className="text-xs text-tu-text-muted mb-4">แนวโน้มรายวันตลอดสัปดาห์</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" vertical={false} />
            <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="value" name="รวม" stroke={colors[0]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="second" name={labels[1]} stroke={colors[2]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="third" name={labels[2]} stroke={colors[3]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Weekly Distribution</p>
        <p className="text-xs text-tu-text-muted mb-4">เปรียบเทียบแต่ละหมวดรายวัน</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" vertical={false} />
            <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" name="รวม" fill={colors[0]} radius={[6, 6, 0, 0]} />
            <Bar dataKey="second" name={labels[1]} fill={colors[2]} radius={[6, 6, 0, 0]} />
            <Bar dataKey="third" name={labels[2]} fill={colors[3]} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Summary Table */}
      <div className="lg:col-span-2 bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Weekly Summary Table</p>
        <p className="text-xs text-tu-text-muted mb-4">สรุปตัวเลขรายวัน</p>
        <div className="overflow-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-tu-text-muted border-b border-tu-border">
                <th className="py-2 px-2 font-medium">วัน</th>
                <th className="py-2 px-2 font-medium">รวม</th>
                <th className="py-2 px-2 font-medium">{labels[1]}</th>
                <th className="py-2 px-2 font-medium">{labels[2]}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.day} className="border-t border-tu-border/70 hover:bg-tu-surface-hover transition-colors">
                  <td className="py-2.5 px-2 font-semibold text-tu-text-primary">{row.day}</td>
                  <td className="py-2.5 px-2 tabular-nums text-tu-text-primary">{row.value}</td>
                  <td className="py-2.5 px-2 tabular-nums text-tu-text-muted">{row.second}</td>
                  <td className="py-2.5 px-2 tabular-nums text-tu-text-muted">{row.third}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
  const heat = Array.from({ length: 12 }, (_, m) =>
    Array.from({ length: 4 }, (_, w) => Math.round(20 + Math.abs(Math.sin(m + w)) * 60 + w * 6)),
  );
  const heatMax = 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Line Chart */}
      <div className="lg:col-span-2 bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Monthly Trend</p>
        <p className="text-xs text-tu-text-muted mb-4">แนวโน้มรายเดือน 12 เดือน</p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" vertical={false} />
            <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="เอกสาร" stroke={colors[0]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="จองห้อง" stroke={colors[1]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="โครงการ" stroke={colors[2]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Indicators */}
      <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Growth Indicators</p>
        <p className="text-xs text-tu-text-muted mb-4">ตัวชี้วัดการเติบโต</p>
        <div className="space-y-3">
          {[{ k: "เอกสาร", c: colors[0], g: 12.4 },{ k: "จองห้อง", c: colors[1], g: 8.7 },{ k: "โครงการ", c: colors[2], g: 5.2 }].map((item) => {
            const lastVal = trend.documents.length > 0 ? (item.k === "เอกสาร" ? trend.documents[trend.documents.length - 1] : item.k === "จองห้อง" ? trend.bookings[trend.bookings.length - 1] : trend.projects[trend.projects.length - 1]) : 0;
            return (
              <div key={item.k} className="p-4 rounded-xl border border-tu-border/70">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-medium text-tu-text-muted">{item.k}</span>
                  <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-tu-success">
                    <ArrowUpRight size={12} /> {item.g}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-[22px] font-semibold tabular-nums text-tu-text-primary">{lastVal}</span>
                  <span className="text-[11px] text-tu-text-muted">เดือนล่าสุด</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-tu-bg overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${60 + (item.k === "โครงการ" ? 0 : item.k === "จองห้อง" ? 1 : 2) * 12}%`, backgroundColor: item.c }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap */}
      <div className="lg:col-span-3 bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Activity Heatmap</p>
        <p className="text-xs text-tu-text-muted mb-4">ความหนาแน่นกิจกรรมรายเดือน × สัปดาห์</p>
        <div className="grid grid-cols-[60px_1fr] gap-2">
          <div className="flex flex-col justify-around text-[11px] text-tu-text-muted pr-2 text-right">
            {["W1","W2","W3","W4"].map(w => <div key={w}>{w}</div>)}
          </div>
          <div className="grid grid-rows-4 gap-1.5">
            {[0,1,2,3].map(w => (
              <div key={w} className="grid grid-cols-12 gap-1.5">
                {heat.map((col, m) => {
                  const v = col[w];
                  const alpha = 0.12 + (v / heatMax) * 0.85;
                  return (
                    <div key={m} className="rounded-md transition-transform hover:scale-110 cursor-pointer" style={{ backgroundColor: `color-mix(in oklab, ${colors[0]} ${alpha * 100}%, transparent)` }} title={`${v}`} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[60px_1fr] gap-2">
          <div />
          <div className="grid grid-cols-12 gap-1.5 text-center text-[10.5px] text-tu-text-muted">
            {["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."].map(m => <div key={m}>{m}</div>)}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-tu-text-muted justify-end">
          น้อย
          {[0.15, 0.35, 0.55, 0.75, 0.95].map(a => (
            <div key={a} className="h-3 w-5 rounded" style={{ backgroundColor: `color-mix(in oklab, ${colors[0]} ${a * 100}%, transparent)` }} />
          ))}
          มาก
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Proportion Chart --- Donut
   ============================================================================== */

function ProportionDonut({ data }: { data: ProportDept[] }) {
  const colors = useChartPalette();
  const total = data.reduce((s, d) => s + d.value, 0);
  const stacked = ["Q1","Q2","Q3","Q4"].map((q, i) => {
    const row: Record<string, string | number> = { quarter: q };
    data.forEach((d, idx) => { row[d.name] = Math.round((d.value / total) * (80 + i * 6) + idx * 2); });
    return row;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Donut + Total */}
      <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Donut Distribution</p>
        <p className="text-xs text-tu-text-muted mb-4">สัดส่วนภาพรวม</p>
        <div className="relative">
          <ResponsiveContainer width="100%" height={320}>
            <RPieChart>
              <Tooltip content={<ChartTooltip valueFormatter={(v) => v.toLocaleString("th-TH")} />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2} stroke="var(--tu-surface)" strokeWidth={2}>
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </RPieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: 45 }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-tu-text-primary tabular-nums">{total.toLocaleString("th-TH")}</p>
              <p className="text-[11px] text-tu-text-muted">ทั้งหมด</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Distribution Breakdown</p>
        <p className="text-xs text-tu-text-muted mb-4">แจกแจงตามสัดส่วน</p>
        <ul className="space-y-3">
          {data.map((d, i) => {
            const pct = (d.value / total) * 100;
            return (
              <li key={d.name} className="p-3 rounded-xl border border-tu-border/70">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                    <span className="text-[13px] font-medium text-tu-text-primary">{d.name}</span>
                  </div>
                  <div className="text-[12.5px] tabular-nums">
                    <span className="font-semibold text-tu-text-primary">{d.value.toLocaleString()}</span>
                    <span className="ml-2 text-tu-text-muted">{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-tu-bg overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Stacked Bar */}
      <div className="lg:col-span-2 bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
        <p className="text-sm font-semibold text-tu-text-primary mb-1">Stacked Composition</p>
        <p className="text-xs text-tu-text-muted mb-4">องค์ประกอบรายไตรมาส</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stacked} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" vertical={false} />
            <XAxis dataKey="quarter" fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="var(--tu-text-muted)" />
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {data.map((d, i) => (
              <Bar key={d.name} dataKey={d.name} stackId="a" fill={colors[i % colors.length]} radius={i === data.length - 1 ? [6, 6, 0, 0] : 0} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ==============================================================================
   Comparison Chart --- Grouped Bar + Stat Cards + Data Table
   ============================================================================== */

function ComparisonChart({ data }: { data: ComparisonPoint[] }) {
  const colors = useChartPalette();
  const latest = data[data.length - 1] as ComparisonPoint | undefined;
  const diff = latest ? latest.thisMonth - latest.lastMonth : 0;
  const pct = latest && latest.lastMonth ? Math.round((diff / latest.lastMonth) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
          <p className="text-xs font-medium text-tu-text-muted">เดือนนี้</p>
          <p className="mt-2 text-[26px] font-semibold tabular-nums text-tu-text-primary">
            {latest ? latest.thisMonth.toLocaleString("th-TH") : "-"}
          </p>
          <p className="text-[11px] text-tu-text-muted mt-1">ค่าล่าสุด</p>
        </div>
        <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
          <p className="text-xs font-medium text-tu-text-muted">เดือนก่อน</p>
          <p className="mt-2 text-[26px] font-semibold tabular-nums" style={{ color: colors[4] }}>
            {latest ? latest.lastMonth.toLocaleString("th-TH") : "-"}
          </p>
          <p className="text-[11px] text-tu-text-muted mt-1">
            ผลต่าง{" "}
            <span className={diff >= 0 ? "text-tu-success font-semibold" : "text-tu-error font-semibold"}>
              {diff >= 0 ? "+" : ""}{diff.toLocaleString("th-TH")} ({pct >= 0 ? "+" : ""}{pct}%)
            </span>
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--tu-border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--tu-text-muted)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar name="เดือนนี้" dataKey="thisMonth" fill={colors[0]} radius={[6, 6, 0, 0]} animationDuration={400} animationEasing="ease" />
          <Bar name="เดือนก่อน" dataKey="lastMonth" fill={colors[4]} radius={[6, 6, 0, 0]} opacity={0.6} animationDuration={400} animationEasing="ease" />
        </BarChart>
      </ResponsiveContainer>

      {/* Data Table */}
      <div className="overflow-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-tu-text-muted border-b border-tu-border">
              <th className="py-2 px-2 font-medium">หมวดหมู่</th>
              <th className="py-2 px-2 font-medium">เดือนนี้</th>
              <th className="py-2 px-2 font-medium">เดือนก่อน</th>
              <th className="py-2 px-2 font-medium">ผลต่าง</th>
              <th className="py-2 px-2 font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const d = row.thisMonth - row.lastMonth;
              const p = row.lastMonth ? Math.round((d / row.lastMonth) * 100) : 0;
              return (
                <tr key={row.label} className="border-t border-tu-border/70 hover:bg-tu-surface-hover transition-colors">
                  <td className="py-2.5 px-2 font-semibold text-tu-text-primary">{row.label}</td>
                  <td className="py-2.5 px-2 tabular-nums text-tu-text-primary">{row.thisMonth.toLocaleString("th-TH")}</td>
                  <td className="py-2.5 px-2 tabular-nums text-tu-text-muted">{row.lastMonth.toLocaleString("th-TH")}</td>
                  <td className={cn("py-2.5 px-2 tabular-nums font-semibold", d >= 0 ? "text-tu-success" : "text-tu-error")}>
                    {d >= 0 ? "+" : ""}{d.toLocaleString("th-TH")}
                  </td>
                  <td className={cn("py-2.5 px-2 tabular-nums font-semibold", p >= 0 ? "text-tu-success" : "text-tu-error")}>
                    {p >= 0 ? "+" : ""}{p}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==============================================================================
   Chart Panel --- renders correct chart per view
   ============================================================================== */

function DeptChartPanel({ view, dept }: { view: ViewId; dept: DeptKey }) {
  const weekly = DEPT_WEEKLY[dept];
  const trend = DEPT_TREND[dept];
  const proportion = DEPT_PROPORTION[dept];
  const comparison = DEPT_COMPARISON[dept];

  switch (view) {
    case "weekly":
      return <WeeklyBarChart weekly={weekly} dept={dept} />;
    case "trend":
      return <TrendLineChart trend={trend} />;
    case "proportion":
      return <ProportionDonut data={proportion} />;
    case "comparison":
      return <ComparisonChart data={comparison} />;
    default:
      return <OverviewChart data={weekly} dept={dept} />;
  }
}

/* ==============================================================================
   Main Page Content
   ============================================================================== */

function DashboardPageContent() {
  const router = useRouter(); const searchParams = useSearchParams();
  const rawView = searchParams.get("view") as ViewId | null;
  const rawDept = searchParams.get("dept") as DeptKey | null;
  const dept: DeptKey = rawDept && deptTabs.some(d => d.key === rawDept) ? rawDept : "academic";

  const isDeanOrHigher = useHasMinRoleLevel(70);
  const visibleViews = isDeanOrHigher ? views : views.filter(v => v.id !== "comparison");
  const ALLOWED_VIEWS_FILTERED: ViewId[] = isDeanOrHigher ? ALLOWED_VIEWS : ALLOWED_VIEWS.filter(v => v !== "comparison");
  const view: ViewId = rawView && ALLOWED_VIEWS_FILTERED.includes(rawView) ? rawView : "overview";

  const { data, error: statsError, isLoading, mutate } = useSWR("/api/dashboard/stats", swrFetcher<DashboardData>, {
    refreshInterval: 300000,
    revalidateOnFocus: true,
  });

  // Fetch announcement categories from settings for dynamic colors
  const { data: settingsData } = useSWR("/api/settings", swrFetcher);
  const settings = (settingsData || {}) as Record<string, Record<string, unknown>>;
  const storageSection = (settings.storage || {}) as Record<string, unknown>;
  const annCats: Array<{ id: string; name: string; color: string }> =
    (Array.isArray(storageSection.annCats) ? storageSection.annCats : []) as Array<{ id: string; name: string; color: string }>;

  const error = statsError ? "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้" : null;
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => { setRefreshing(true); await mutate(); setRefreshing(false); }, [mutate]);

  const setView = useCallback((v: ViewId) => { const params = new URLSearchParams(searchParams.toString()); params.set("view", v); router.push(`/dashboard?${params.toString()}`, { scroll: false }); }, [router, searchParams]);
  const setDept = useCallback((d: DeptKey) => { const params = new URLSearchParams(searchParams.toString()); params.set("dept", d); router.push(`/dashboard?${params.toString()}`, { scroll: false }); }, [router, searchParams]);

  if (isLoading) return (<div className="p-6 space-y-6"><div className="h-8 w-48 bg-tu-surface rounded animate-pulse" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="bg-tu-surface rounded-2xl border border-tu-border p-5 h-[120px] animate-pulse" />))}</div></div>);
  if (error) return (<div className="p-6"><div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-10 text-center"><p className="text-tu-error font-semibold mb-2">ไม่สามารถโหลดข้อมูลได้</p><p className="text-sm text-tu-text-muted mb-4">{error}</p><button onClick={() => window.location.reload()} className="rounded-[--radius-btn] bg-tu-primary text-white px-4 py-2 text-sm font-medium hover:bg-tu-primary-hover transition-colors">ลองใหม่</button></div></div>);

  const statValues: Record<string, number> = { personnel: data?.orgStats.personnel ?? 247, onlineSystems: 6, projects: data?.orgStats.projectsInProgress ?? 15, students: 2847 };
  const statTrends: Record<string, { value: number; isPositive: boolean } | null> = { personnel: { value: 8, isPositive: true }, onlineSystems: { value: 2, isPositive: true }, projects: { value: 5, isPositive: true }, students: { value: 3, isPositive: false } };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-tu-text-primary leading-tight">Dashboard</h1>
          <p className="text-tu-text-muted text-sm mt-1">ภาพรวมคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์</p>
        </div>
        <div className="flex items-center gap-3">
          {data?.lastSync && (<span className="text-xs text-tu-text-muted flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-tu-success opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-tu-success" /></span>อัปเดตล่าสุด {formatThaiTime(data.lastSync)}</span>)}
          <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1.5 rounded-xl bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-60 shrink-0">
            <RefreshCw size={16} className={cn(refreshing && "animate-spin")} />รีเฟรช
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{STAT_CARDS.map((card) => (<StatCard key={card.key} label={card.label} value={statValues[card.key] ?? card.defaultValue} icon={card.icon} color={card.color} bg={card.bg} trend={statTrends[card.key]} />))}</div>
      <AnnouncementsCard items={data?.latestAnnouncements ?? []} annCats={annCats} />

      {/* Main BI Chart Area */}
      <div>
        {/* Section Header */}
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-tu-text-primary">Dashboard รายฝ่าย</h2>
          <p className="text-[13px] text-tu-text-muted mt-1">เลือกฝ่ายที่ต้องการเพื่อดูตัวชี้วัด กราฟ และรายงานเชิงลึก</p>
        </div>

        {/* Department Tabs — card style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {deptTabs.map((d) => {
            const Icon = d.icon;
            const active = dept === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setDept(d.key)}
                className={cn(
                  "group text-left rounded-2xl border p-4 flex items-center gap-4 transition-all duration-200",
                  active
                    ? "border-tu-primary/40 bg-tu-primary/[0.04] shadow-sm"
                    : "border-tu-border bg-tu-surface hover:border-tu-border/80 hover:bg-tu-surface-hover",
                )}
              >
                <div
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                    active ? "bg-tu-primary text-white" : "bg-tu-bg text-tu-text-secondary/70",
                  )}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold tracking-tight text-tu-text-primary truncate">{d.label}</div>
                  <div className="text-[11.5px] text-tu-text-muted truncate">{d.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* View selector + date range */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div className="inline-flex p-1 rounded-xl bg-tu-bg/70 border border-tu-border">
            {visibleViews.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "px-4 h-9 rounded-lg text-[12.5px] font-medium transition-all",
                  view === v.id
                    ? "bg-tu-primary text-white shadow-sm"
                    : "text-tu-text-muted hover:text-tu-text-primary",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5">
          <DeptChartPanel view={view} dept={dept} />
        </div>
      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (<Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading dashboard...</div>}><DashboardPageContent /></Suspense>);
}
