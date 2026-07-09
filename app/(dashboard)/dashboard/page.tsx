"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users, FolderOpen, Briefcase, CalendarCheck,
  TrendingUp, Newspaper, BarChart3, PieChart, Activity,
  ArrowUp, ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Data
   ============================================================================== */

const stats = [
  { label: "บุคลากร", value: "48", icon: Users, color: "text-tu-primary", bg: "bg-tu-primary-soft" },
  { label: "เอกสารทั้งหมด", value: "1,284", icon: FolderOpen, color: "text-tu-info", bg: "bg-blue-50" },
  { label: "โครงการที่กำลังดำเนินการ", value: "12", icon: Briefcase, color: "text-tu-success", bg: "bg-green-50" },
  { label: "การจองห้องวันนี้", value: "5", icon: CalendarCheck, color: "text-tu-warning", bg: "bg-tu-secondary-soft" },
];

const announcements = [
  { title: "ประกาศรายชื่อผู้มีสิทธิ์สอบข้อเขียน", date: "9 ก.ค. 2568", category: "ประกาศผล" },
  { title: "ขอเชิญร่วมงานสัมมนาวิชาการประจำปี 2568", date: "8 ก.ค. 2568", category: "เชิญชวน" },
  { title: "แจ้งกำหนดการลงทะเบียนเรียนภาค 1/2568", date: "7 ก.ค. 2568", category: "ประกาศด่วน" },
];

const weeklyData = [
  { day: "จันทร์", value: 45, color: "bg-tu-primary" },
  { day: "อังคาร", value: 52, color: "bg-tu-primary" },
  { day: "พุธ", value: 38, color: "bg-tu-primary" },
  { day: "พฤหัส", value: 61, color: "bg-tu-primary" },
  { day: "ศุกร์", value: 48, color: "bg-tu-primary" },
  { day: "เสาร์", value: 12, color: "bg-tu-primary" },
  { day: "อาทิตย์", value: 8, color: "bg-tu-primary" },
];

const trendData = [
  { month: "ม.ค.", เอกสาร: 180, ผู้ใช้: 210, จอง: 45 },
  { month: "ก.พ.", เอกสาร: 195, ผู้ใช้: 220, จอง: 52 },
  { month: "มี.ค.", เอกสาร: 210, ผู้ใช้: 235, จอง: 48 },
  { month: "เม.ย.", เอกสาร: 230, ผู้ใช้: 240, จอง: 55 },
  { month: "พ.ค.", เอกสาร: 250, ผู้ใช้: 245, จอง: 60 },
  { month: "มิ.ย.", เอกสาร: 280, ผู้ใช้: 248, จอง: 58 },
  { month: "ก.ค.", เอกสาร: 300, ผู้ใช้: 250, จอง: 62 },
];

const proportionData = [
  { name: "สำนักงานคณะ", value: 35, color: "bg-tu-primary" },
  { name: "ฝ่ายวิชาการ", value: 25, color: "bg-tu-info" },
  { name: "ฝ่าย IT", value: 20, color: "bg-tu-secondary" },
  { name: "ฝ่ายการเงิน", value: 12, color: "bg-tu-success" },
  { name: "ฝ่ายวิจัย", value: 5, color: "bg-tu-warning" },
  { name: "อื่น ๆ", value: 3, color: "bg-tu-text-muted" },
];

const comparisonData = [
  { label: "เอกสาร", thisMonth: 320, lastMonth: 280, color: "bg-tu-info" },
  { label: "ผู้ใช้ Active", thisMonth: 48, lastMonth: 52, color: "bg-tu-success" },
  { label: "การจอง", thisMonth: 62, lastMonth: 58, color: "bg-tu-warning" },
  { label: "โครงการใหม่", thisMonth: 8, lastMonth: 5, color: "bg-tu-primary" },
  { label: "ประกาศ", thisMonth: 15, lastMonth: 20, color: "bg-tu-secondary-active" },
];

const views = [
  { id: "overview" as const, label: "Overview", icon: TrendingUp },
  { id: "weekly" as const, label: "Weekly", icon: BarChart3 },
  { id: "trend" as const, label: "Trend", icon: TrendingUp },
  { id: "proportion" as const, label: "Proportion", icon: PieChart },
  { id: "comparison" as const, label: "Comparison", icon: Activity },
];

type ViewId = typeof views[number]["id"];

/* ==============================================================================
   Components
   ============================================================================== */

function WeeklyChart() {
  const max = Math.max(...weeklyData.map((d) => d.value));
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={20} className="text-tu-primary" />
        <h2 className="text-lg font-semibold text-tu-text-primary">กิจกรรมรายวัน (สัปดาห์นี้)</h2>
      </div>
      <div className="flex items-end justify-between gap-2 h-48">
        {weeklyData.map((d) => (
          <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xs font-medium text-tu-text-muted">{d.value}</span>
            <div className="w-full rounded-t-md hover:opacity-80 transition-opacity cursor-pointer" style={{ height: `${(d.value / max) * 100}%`, minHeight: 20, backgroundColor: "var(--tu-primary)" }} />
            <span className="text-xs text-tu-text-muted">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart() {
  const months = trendData.map((d) => d.month);
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={20} className="text-tu-primary" />
        <h2 className="text-lg font-semibold text-tu-text-primary">แนวโน้มรายเดือน</h2>
      </div>
      {/* Line chart (CSS approximation) */}
      <div className="flex items-end gap-1 h-56 pb-8 relative">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between h-full text-[10px] text-tu-text-muted absolute left-0 top-0 -translate-y-1">
          <span>300</span><span>200</span><span>100</span><span>0</span>
        </div>
        <div className="ml-8 flex-1 flex items-end gap-4 h-full">
          {trendData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
              <div className="flex flex-col items-center gap-0.5 w-full">
                {/* Documents bar */}
                <div className="w-full rounded-t-sm bg-tu-info/80" style={{ height: `${(d.เอกสาร / 350) * 100}%`, minHeight: 4 }} />
                {/* Users bar */}
                <div className="w-full rounded-t-sm bg-tu-primary/80" style={{ height: `${(d.ผู้ใช้ / 350) * 100}%`, minHeight: 4 }} />
                {/* Bookings bar */}
                <div className="w-full rounded-t-sm bg-tu-secondary/80" style={{ height: `${(d.จอง / 350) * 100}%`, minHeight: 4 }} />
              </div>
              <span className="text-[10px] text-tu-text-muted">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-tu-info/80" /> เอกสาร</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-tu-primary/80" /> ผู้ใช้</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-tu-secondary/80" /> จอง</span>
      </div>
    </div>
  );
}

function ProportionChart() {
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChart size={20} className="text-tu-primary" />
        <h2 className="text-lg font-semibold text-tu-text-primary">สัดส่วนตามหน่วยงาน</h2>
      </div>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut */}
        <div className="relative h-44 w-44 shrink-0 rounded-full overflow-hidden" style={{ background: `conic-gradient(#A31D1D 0% 35%, #2F6D91 35% 60%, #FDB813 60% 80%, #2D8A4E 80% 92%, #E8A317 92% 97%, #868E96 97% 100%)` }}>
          <div className="absolute inset-[30%] rounded-full bg-tu-surface flex items-center justify-center">
            <span className="text-2xl font-bold text-tu-text-primary">100%</span>
          </div>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {proportionData.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <span className={`h-3 w-3 rounded-sm ${d.color}`} />
              <span className="text-tu-text-secondary">{d.name}</span>
              <span className="font-medium text-tu-text-primary">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonChart() {
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity size={20} className="text-tu-primary" />
        <h2 className="text-lg font-semibold text-tu-text-primary">เปรียบเทียบ เดือนนี้ vs เดือนที่แล้ว</h2>
      </div>
      <div className="space-y-4">
        {comparisonData.map((d) => {
          const max = Math.max(d.thisMonth, d.lastMonth);
          const diff = d.thisMonth - d.lastMonth;
          return (
            <div key={d.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-tu-text-secondary">{d.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-tu-text-primary">{d.thisMonth}</span>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${diff >= 0 ? "text-tu-success" : "text-tu-error"}`}>
                    {diff >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {Math.abs(diff)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 h-5">
                <div className={`rounded-r-sm ${d.color}`} style={{ width: `${(d.thisMonth / max) * 100}%` }} />
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
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as ViewId) || "overview";

  const setView = useCallback(
    (v: ViewId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", v);
      router.push(`/dashboard?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">แดชบอร์ด</h1>
          <p className="text-tu-text-muted text-sm mt-1">
            ภาพรวมคณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์
            <span className="ml-2 text-xs text-tu-text-muted/60">
              🔄 ซิงค์ล่าสุด: {new Date().toLocaleTimeString("th-TH")}
            </span>
          </p>
        </div>
        {/* View Tabs */}
        <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                view === v.id
                  ? "bg-tu-primary text-white shadow-sm"
                  : "text-tu-text-secondary hover:text-tu-text-primary"
              )}
            >
              <v.icon size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards — always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-tu-text-primary">{stat.value}</p>
              <p className="text-sm text-tu-text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* View Content */}
      <div key={view} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
      {view === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-tu-primary" />
              <h2 className="text-lg font-semibold text-tu-text-primary">กิจกรรมล่าสุด</h2>
            </div>
            <div className="flex items-center justify-center h-48 text-tu-text-muted text-sm">📊 แผนภูมิกิจกรรมจะแสดงที่นี่</div>
          </div>
          <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper size={20} className="text-tu-primary" />
              <h2 className="text-lg font-semibold text-tu-text-primary">ประกาศล่าสุด</h2>
            </div>
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <div key={i} className="pb-3 border-b border-tu-border last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-tu-text-primary leading-snug">{ann.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{ann.category}</Badge>
                    <span className="text-xs text-tu-text-muted">{ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "weekly" && <WeeklyChart />}
      {view === "trend" && <TrendChart />}
      {view === "proportion" && <ProportionChart />}
      {view === "comparison" && <ComparisonChart />}
      </div>
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
