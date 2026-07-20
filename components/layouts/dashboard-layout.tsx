"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/fetcher";
import {
  LayoutDashboard,
  Grid3X3,
  Newspaper,
  CalendarCheck,
  FolderOpen,
  FlaskConical,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
  import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdvancedSearchPanel } from "@/components/shared/advanced-search-panel";
import { useHasPermission } from "@/hooks/use-permission";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  permission?: string;
}

const platformNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/application-hub", label: "Application Hub", icon: Grid3X3 },
  { href: "/intranet", label: "Intranet", icon: Newspaper },
  { href: "/book-meeting", label: "Book Meeting", icon: CalendarCheck, permission: "BOOK_MEETING_VIEW" },
  { href: "/documents", label: "Document", icon: FolderOpen, permission: "DOCUMENTS_VIEW" },
  { href: "/projects", label: "Projects", icon: FlaskConical, permission: "PROJECTS_VIEW" },
];

const adminNav: NavItem[] = [
  { href: "/users", label: "Users & Roles", icon: Users, roles: ["super_admin", "system_admin"] },
  { href: "/audit-log", label: "Audit Log", icon: ShieldCheck, roles: ["super_admin", "system_admin", "dean", "dept_admin"] },
  { href: "/settings", label: "System Config", icon: Settings, roles: ["super_admin", "system_admin"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const roles = (session?.user as { roles?: string[] })?.roles ?? [];
  const hasBookMeetingView = useHasPermission("BOOK_MEETING_VIEW");
  const hasDocumentsView = useHasPermission("DOCUMENTS_VIEW");
  const hasProjectsView = useHasPermission("PROJECTS_VIEW");
  const hasMinRoleLevel = (minLevel: number) => {
    return Math.max(0, ...roles.map((r) => {
      const ROLE_LEVELS: Record<string, number> = { super_admin: 100, system_admin: 80, dean: 70, dept_admin: 50, user: 30, viewer: 10 };
      return ROLE_LEVELS[r] ?? 0;
    })) >= minLevel;
  };
  const showAdvancedSearch = hasMinRoleLevel(70); // Dean and above

  // Load collapsed preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  function hasAccess(item: NavItem): boolean {
    if (!item.roles) return true;
    return item.roles.some((r) => roles.includes(r));
  }

  function hasPermissionAccess(item: NavItem): boolean {
    if (!item.permission) return true;
    if (item.permission === "BOOK_MEETING_VIEW") return hasBookMeetingView;
    if (item.permission === "DOCUMENTS_VIEW") return hasDocumentsView;
    if (item.permission === "PROJECTS_VIEW") return hasProjectsView;
    return true;
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  // Fetch system branding (name) from settings API
  const { data: settingsData } = useSWR("/api/settings", swrFetcher);
  const branding = (settingsData as Record<string, Record<string, unknown>> | undefined)?.branding as Record<string, string> | undefined;
  const systemName = branding?.name || "TULAW ONE";

  // Update document title to reflect branding
  useEffect(() => {
    if (branding?.name) {
      document.title = `${branding.name} — คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์`;
    }
  }, [branding?.name]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ─── Left Sidebar ─── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-tu-primary-active text-white transition-all duration-200 lg:static",
          sidebarCollapsed ? "lg:w-[72px]" : "lg:w-[280px]",
          !sidebarCollapsed ? "w-[280px]" : "w-[72px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn("flex h-16 items-center border-b border-white/10", sidebarCollapsed ? "justify-center px-3" : "gap-3 px-5")}>
          <TooltipWrapper show={sidebarCollapsed} label={systemName}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tu-secondary">
              <span className="text-tu-text-primary font-bold text-sm">มธ</span>
            </div>
          </TooltipWrapper>
          {!sidebarCollapsed && (
            <>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight truncate">{systemName}</p>
                <p className="text-[10px] text-white/60 leading-tight">Faculty of Law, TU</p>
              </div>
              <button className="ml-auto lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {!sidebarCollapsed && (
            <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              เมนูหลัก
            </p>
          )}
          {platformNav.filter(hasPermissionAccess).map((item) => (
            <TooltipWrapper key={item.href} show={sidebarCollapsed} label={item.label}>
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-4 rounded-[--radius-btn] text-sm font-medium transition-colors duration-150",
                  sidebarCollapsed ? "justify-center mx-2 px-0 py-2.5" : "mx-3 px-4 py-2.5",
                  isActive(item.href)
                    ? "bg-tu-secondary text-tu-text-primary shadow-sm border-l-[3px] border-tu-secondary"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon size={20} />
                {!sidebarCollapsed && item.label}
              </Link>
            </TooltipWrapper>
          ))}

          {adminNav.filter(hasAccess).length > 0 && (
            <>
              {!sidebarCollapsed && (
                <>
                  <div className="mx-5 border-t border-white/10 my-2" />
                  <p className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                    ดูแลระบบ
                  </p>
                </>
              )}
              {adminNav.filter(hasAccess).map((item) => (
                <TooltipWrapper key={item.href} show={sidebarCollapsed} label={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-[--radius-btn] text-sm font-medium transition-colors duration-150",
                      sidebarCollapsed ? "justify-center mx-2 px-0 py-2.5" : "mx-3 px-4 py-2.5",
                      isActive(item.href)
                        ? "bg-tu-secondary text-tu-text-primary shadow-sm border-l-[3px] border-tu-secondary"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon size={20} />
                    {!sidebarCollapsed && item.label}
                  </Link>
                </TooltipWrapper>
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-white/10 p-2">
          <TooltipWrapper show={sidebarCollapsed} label="ออกจากระบบ">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn(
                "flex items-center gap-4 rounded-[--radius-btn] text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors duration-150",
                sidebarCollapsed ? "justify-center w-full p-2.5" : "w-full px-4 py-2.5"
              )}
            >
              <LogOut size={20} />
              {!sidebarCollapsed && "ออกจากระบบ"}
            </button>
          </TooltipWrapper>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main + Right Panel ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-tu-border bg-tu-surface px-4 lg:px-6">
          {/* Mobile menu toggle */}
          <button className="lg:hidden text-tu-text-secondary shrink-0" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          {/* Desktop sidebar collapse toggle */}
          <button
            className="hidden lg:flex shrink-0 rounded-lg p-2 text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>

          {/* Global Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
            <input
              type="text"
              placeholder="ค้นหา..."
              className="w-full rounded-[--radius-input] border border-tu-border bg-tu-bg pl-9 pr-4 py-2 text-sm text-tu-text-primary placeholder:text-tu-text-muted focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition"
            />
          </div>

          {/* Advanced Search Button (Dean and above only) */}
          {showAdvancedSearch && (
            <div className="hidden sm:block">
              <AdvancedSearchPanel categories={["ประกาศ", "ผู้ใช้", "เอกสาร", "โครงการ", "ทั้งหมด"]} />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="relative rounded-lg p-2 text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-tu-error" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-tu-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tu-primary text-xs font-medium text-white">
                {session?.user?.name?.charAt(0) ?? "?"}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-tu-text-primary leading-tight">{session?.user?.name ?? "ผู้ใช้งาน"}</p>
                <p className="text-xs text-tu-text-muted leading-tight">
                  {roles.includes("super_admin") ? "ผู้ดูแลระบบสูงสุด" : roles.includes("system_admin") ? "ผู้ดูแลระบบ" : roles.includes("dean") ? "คณบดี" : roles.includes("dept_admin") ? "ผู้ดูแลหน่วยงาน" : roles.includes("viewer") ? "ผู้ดูข้อมูล" : "ผู้ใช้งาน"}
                </p>
              </div>
              <ChevronDown size={16} className="text-tu-text-muted hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

/* ─── Tooltip wrapper for collapsed sidebar ─── */
function TooltipWrapper({ children, show, label }: { children: React.ReactNode; show: boolean; label: string }) {
  if (!show) return <>{children}</>;
  return (
    <div className="relative group/tip flex justify-center">
      {children}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[60] px-2.5 py-1.5 rounded-md bg-tu-text-primary text-white text-xs whitespace-nowrap opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-100 pointer-events-none shadow-lg">
        {label}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-tu-text-primary" />
      </div>
    </div>
  );
}


