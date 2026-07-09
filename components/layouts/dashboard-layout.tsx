"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Grid3X3,
  Newspaper,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const platformNav: NavItem[] = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  {
    href: "/application-hub",
    label: "ศูนย์กลางแอปพลิเคชัน",
    icon: Grid3X3,
  },
  { href: "/intranet", label: "อินทราเน็ต", icon: Newspaper },
];

const adminNav: NavItem[] = [
  {
    href: "/users",
    label: "ผู้ใช้งานและสิทธิ์",
    icon: Users,
    roles: ["super_admin", "system_admin"],
  },
  {
    href: "/audit-log",
    label: "บันทึกความปลอดภัย",
    icon: ShieldCheck,
    roles: ["super_admin", "system_admin"],
  },
  {
    href: "/settings",
    label: "ตั้งค่าระบบ",
    icon: Settings,
    roles: ["super_admin", "system_admin"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const roles = (session?.user as { roles?: string[] })?.roles ?? [];

  function hasAccess(item: NavItem): boolean {
    if (!item.roles) return true;
    return item.roles.some((r) => roles.includes(r));
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ─── Left Sidebar ─── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-tu-primary-active text-white transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tu-secondary">
            <span className="text-tu-text-primary font-bold text-sm">มธ</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">TULAW ONE</p>
            <p className="text-[10px] text-white/60 leading-tight">
              Faculty of Law, TU
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">
            เมนูหลัก
          </p>
          {platformNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[--radius-btn] text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-tu-secondary text-tu-text-primary"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}

          {adminNav.filter(hasAccess).length > 0 && (
            <>
              <p className="px-3 pt-4 text-[11px] font-medium uppercase tracking-wider text-white/40 mb-2">
                ดูแลระบบ
              </p>
              {adminNav
                .filter(hasAccess)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-[--radius-btn] text-sm font-medium transition-colors",
                      pathname === item.href ||
                        pathname.startsWith(item.href + "/")
                        ? "bg-tu-secondary text-tu-text-primary"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}
            </>
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-[--radius-btn] text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Main + Right Panel ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-tu-border bg-tu-surface px-4 lg:px-6">
          <button
            className="lg:hidden text-tu-text-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Global Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted"
            />
            <input
              type="text"
              placeholder="ค้นหา..."
              className="w-full rounded-[--radius-input] border border-tu-border bg-tu-bg pl-9 pr-4 py-2 text-sm text-tu-text-primary placeholder:text-tu-text-muted focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Right Panel Toggle */}
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="hidden xl:flex rounded-lg p-2 text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
              title={rightPanelOpen ? "ปิดพาเนล" : "เปิดพาเนล"}
            >
              {rightPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </button>

            <button className="relative rounded-lg p-2 text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-tu-error" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-tu-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tu-primary text-xs font-medium text-white">
                {session?.user?.name?.charAt(0) ?? "?"}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-tu-text-primary leading-tight">
                  {session?.user?.name ?? "ผู้ใช้งาน"}
                </p>
                <p className="text-xs text-tu-text-muted leading-tight">
                  {roles.includes("super_admin")
                    ? "ผู้ดูแลระบบสูงสุด"
                    : roles.includes("system_admin")
                      ? "ผู้ดูแลระบบ"
                      : roles.includes("dean")
                        ? "คณบดี"
                        : roles.includes("dept_admin")
                          ? "ผู้ดูแลหน่วยงาน"
                          : roles.includes("viewer")
                            ? "ผู้ดูข้อมูล"
                            : "ผู้ใช้งาน"}
                </p>
              </div>
              <ChevronDown size={16} className="text-tu-text-muted hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Body: Main Content + Right Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* ─── Right Sidebar (Context Panel) ─── */}
          {rightPanelOpen && (
            <RightSidebar />
          )}
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Right Sidebar — isolated component with its own state
   ============================================================================== */

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const dayHeaders = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

interface CalendarEvent {
  title: string;
  time: string;
  room: string;
  dot: string;
}

// Events keyed by day of month (July 2025)
const eventsData: Record<number, CalendarEvent[]> = {
  10: [
    { title: "ประชุมคณะกรรมการบริหาร", time: "09:00 - 12:00", room: "ห้องประชุม 201", dot: "bg-tu-primary" },
  ],
  11: [
    { title: "พบนักศึกษา", time: "14:00 - 15:00", room: "ห้องประชุมย่อย 101", dot: "bg-tu-info" },
  ],
  15: [
    { title: "สัมมนาวิชาการกฎหมาย", time: "13:00 - 16:30", room: "ห้องประชุมใหญ่ ชั้น 5", dot: "bg-tu-secondary-active" },
    { title: "ประชุมทีมกฎหมาย", time: "10:00 - 11:00", room: "ห้องประชุม 302", dot: "bg-tu-info" },
  ],
  18: [
    { title: "ประชุมสภาคณาจารย์", time: "09:00 - 12:00", room: "ห้องประชุมสภา", dot: "bg-tu-primary" },
  ],
  22: [
    { title: "อบรม PDPA บุคลากร", time: "08:30 - 16:00", room: "ห้องประชุม 302", dot: "bg-tu-info" },
  ],
  25: [
    { title: "ประชุมฝ่ายวิชาการ", time: "13:00 - 15:00", room: "ห้องประชุม 201", dot: "bg-tu-primary" },
  ],
  28: [
    { title: "นำเสนองานวิจัย", time: "09:00 - 12:00", room: "ห้องประชุมสภา", dot: "bg-tu-primary" },
  ],
};

// All events sorted by day, for "all events" view
const allEvents = Object.entries(eventsData)
  .flatMap(([day, evs]) => evs.map((ev) => ({ ...ev, day: Number(day) })))
  .sort((a, b) => a.day - b.day);

const monthIndex = 6; // July = index 6
const year = 2568;
const daysInMonth = 31;
const startDay = 2; // Tuesday (0=Sun, 1=Mon, 2=Tue)

function RightSidebar() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const displayEvents: Array<{ title: string; time: string; room: string; dot: string; dayLabel?: string }> = selectedDay
    ? (eventsData[selectedDay] ?? []).map((e) => ({
        title: e.title,
        time: e.time,
        room: e.room,
        dot: e.dot,
      }))
    : allEvents.map((e) => ({
        title: e.title,
        time: e.time,
        room: e.room,
        dot: e.dot,
        dayLabel: `${e.day} ${thaiMonths[monthIndex]} ${year}`,
      }));

  return (
    <aside className="hidden xl:flex w-72 shrink-0 flex-col border-l border-tu-border bg-tu-surface">
      {/* Mini Calendar — locked at top */}
      <div className="shrink-0 p-4 border-b border-tu-border">
        <div className="flex items-center justify-between mb-3">
          <button className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <h3 className="text-sm font-semibold text-tu-text-primary">
            {thaiMonths[monthIndex]} {year}
          </h3>
          <button className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center mb-1">
          {dayHeaders.map((d, i) => (
            <span
              key={d + i}
              className={cn(
                "text-[10px] font-semibold py-1",
                (i === 0 || i === 6) ? "text-tu-error" : "text-tu-text-muted"
              )}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 text-center gap-y-1">
          {Array.from({ length: startDay }, (_, i) => (
            <div key={`empty-${i}`} className="py-1" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const isToday = day === 9;
            const hasEvent = day in eventsData;
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className="flex flex-col items-center py-1 rounded transition-colors"
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs",
                    isToday && !isSelected && "ring-2 ring-tu-primary font-semibold text-tu-primary",
                    isSelected && "bg-tu-primary text-white font-semibold",
                    !isToday && !isSelected && "text-tu-text-primary hover:bg-tu-bg"
                  )}
                >
                  {day}
                </span>
                {hasEvent && (
                  <span className="mt-0.5 flex items-center justify-center gap-0.5">
                    {eventsData[day]
                      .map((e) => e.dot)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .slice(0, 3)
                      .map((dot, i) => (
                        <span key={i} className={`h-1 w-1 rounded-full ${dot}`} />
                      ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events — scrollable */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="flex items-center gap-2 mb-3">
          {selectedDay ? (
            <>
              <Calendar size={16} className="text-tu-primary" />
              <h3 className="text-sm font-semibold text-tu-text-primary">
                กิจกรรม {selectedDay} {thaiMonths[monthIndex]}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="ml-auto text-xs text-tu-primary hover:underline shrink-0"
              >
                แสดงทั้งหมด
              </button>
            </>
          ) : (
            <>
              <Clock size={16} className="text-tu-primary" />
              <h3 className="text-sm font-semibold text-tu-text-primary">
                กิจกรรมที่กำลังจะถึง
              </h3>
            </>
          )}
        </div>

        {displayEvents.length === 0 ? (
          <p className="text-xs text-tu-text-muted py-4 text-center">
            ไม่มีกิจกรรมในวันนี้
          </p>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((ev, i) => (
              <div key={ev.title + i} className="flex items-start gap-2.5">
                <span className={`mt-1 h-2 w-2 rounded-full ${ev.dot} shrink-0`} />
                <div className="text-xs min-w-0">
                  <p className="font-medium text-tu-text-primary leading-snug">
                    {ev.title}
                  </p>
                  {"dayLabel" in ev && (
                    <p className="text-tu-text-muted mt-0.5">{ev.dayLabel}</p>
                  )}
                  <p className="text-tu-text-muted">
                    {ev.time}{" "}
                    {"room" in ev && `· ${ev.room}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
