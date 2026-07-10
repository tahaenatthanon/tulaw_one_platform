"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Search,
  X,
  Newspaper,
  User as UserIcon,
  FileText,
  Briefcase,
  RefreshCw,
  ChevronRight,
  SlidersHorizontal,
  CalendarDays,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/* ==============================================================================
   Types
   ============================================================================== */

interface SearchResults {
  announcements?: Array<{ id: string; title: string; category?: { name: string }; department?: { name: string } }>;
  users?: Array<{ id: string; firstNameTh: string; lastNameTh: string; email: string; department?: { name: string } }>;
  documents?: Array<{ id: string; title: string; department?: { name: string } }>;
  projects?: Array<{ id: string; name: string; owner?: { department?: { name: string } } }>;
}

/* ==============================================================================
   Component
   ============================================================================== */

export function AdvancedSearchPanel({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [activeFilters, setActiveFilters] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (category) count++;
    if (startDate) count++;
    if (endDate) count++;
    setActiveFilters(count);
  }, [category, startDate, endDate]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); e.preventDefault(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (keyword.trim()) params.set("keyword", keyword.trim());
      if (category) params.set("category", category);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/dashboard/advanced-search?${params.toString()}`, {
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "เกิดข้อผิดพลาด");
      setResults(json.data);
    } catch {
      setError("ไม่สามารถค้นหาได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [keyword, category, startDate, endDate]);

  const clearAll = () => {
    setKeyword("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setResults(null);
    setError(null);
  };

  const totalResults =
    (results?.announcements?.length ?? 0) +
    (results?.users?.length ?? 0) +
    (results?.documents?.length ?? 0) +
    (results?.projects?.length ?? 0);

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
          open
            ? "bg-tu-primary text-white shadow-md"
            : "text-tu-text-secondary hover:bg-tu-surface-hover hover:text-tu-text-primary border border-tu-border hover:border-tu-border-focus/40"
        )}
        title={open ? "ปิด" : "ค้นหาขั้นสูง"}
      >
        <SlidersHorizontal size={17} />
        <span className="hidden lg:inline">{open ? "ปิด" : "ค้นหาขั้นสูง"}</span>
        {!open && activeFilters > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-tu-error text-[10px] font-bold text-white leading-none">
            {activeFilters}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-[60] w-[90vw] sm:w-[520px] bg-tu-surface border border-tu-border rounded-[--radius-dialog] shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-tu-border bg-tu-bg/50">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tu-primary-soft">
                <Search size={16} className="text-tu-primary" />
              </div>
              <h2 className="text-sm font-semibold text-tu-text-primary">ค้นหาขั้นสูง</h2>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-tu-surface-hover text-tu-text-muted transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Keyword input with keyboard shortcut hint */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-tu-text-secondary">
                <Search size={13} /> ค้นหา
              </label>
              <div className="relative">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                  placeholder="พิมพ์คำค้นหา แล้วกด Enter..."
                  className="pr-16 h-10 text-sm"
                  autoFocus
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-tu-border text-tu-text-muted font-mono">
                  Enter
                </kbd>
              </div>
            </div>

            {/* Category + Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-tu-text-secondary">
                  <Tag size={13} /> หมวดหมู่
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 transition text-tu-text-primary"
                >
                  <option value="">ทั้งหมด</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-tu-text-secondary">
                  <CalendarDays size={13} /> วันที่เริ่ม
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-tu-text-secondary">
                  <CalendarDays size={13} /> วันที่สิ้นสุด
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs h-10"
                />
              </div>
            </div>

            {/* Active filter chips */}
            {(category || startDate || endDate) && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-tu-text-muted self-center mr-1">ตัวกรอง:</span>
                {category && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-tu-primary-soft text-tu-primary font-medium">
                    <Tag size={10} /> {category}
                    <button onClick={() => setCategory("")} className="hover:text-tu-primary-hover"><X size={10} /></button>
                  </span>
                )}
                {startDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-tu-info/10 text-tu-info font-medium">
                    <CalendarDays size={10} /> ตั้งแต่ {startDate}
                    <button onClick={() => setStartDate("")} className="hover:text-tu-info/80"><X size={10} /></button>
                  </span>
                )}
                {endDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-tu-info/10 text-tu-info font-medium">
                    <CalendarDays size={10} /> ถึง {endDate}
                    <button onClick={() => setEndDate("")} className="hover:text-tu-info/80"><X size={10} /></button>
                  </span>
                )}
                <button onClick={clearAll} className="text-[11px] text-tu-text-muted hover:text-tu-error ml-1">ล้างทั้งหมด</button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button onClick={runSearch} disabled={loading} size="sm" className="gap-2 px-5">
                {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                {loading ? "กำลังค้นหา..." : "ค้นหา"}
              </Button>
              <Button variant="secondary" size="sm" onClick={clearAll}>
                ล้าง
              </Button>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-tu-error bg-tu-error/5 border border-tu-error/20 rounded-lg px-3 py-2.5">
                ❌ {error}
              </div>
            )}

            {/* Results */}
            {!loading && results && (
              <div className="max-h-[360px] overflow-y-auto space-y-4 border-t border-tu-border pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-tu-text-primary">
                    พบทั้งหมด <span className="text-tu-primary font-bold">{totalResults}</span> รายการ
                  </p>
                  {totalResults > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setOpen(false)}>
                      ปิด <X size={12} />
                    </Button>
                  )}
                </div>

                <div className="divide-y divide-tu-border">
                  {results.announcements && results.announcements.length > 0 && (
                    <ResultSection icon={Newspaper} label="ประกาศ" count={results.announcements.length}>
                      {results.announcements.map((a) => (
                        <ResultItem key={a.id} primary={a.title} secondary={a.category?.name} />
                      ))}
                    </ResultSection>
                  )}

                  {results.users && results.users.length > 0 && (
                    <ResultSection icon={UserIcon} label="ผู้ใช้" count={results.users.length}>
                      {results.users.map((u) => (
                        <ResultItem key={u.id} primary={`${u.firstNameTh} ${u.lastNameTh}`} secondary={u.email} />
                      ))}
                    </ResultSection>
                  )}

                  {results.documents && results.documents.length > 0 && (
                    <ResultSection icon={FileText} label="เอกสาร" count={results.documents.length}>
                      {results.documents.map((d) => (
                        <ResultItem key={d.id} primary={d.title} />
                      ))}
                    </ResultSection>
                  )}

                  {results.projects && results.projects.length > 0 && (
                    <ResultSection icon={Briefcase} label="โครงการ" count={results.projects.length}>
                      {results.projects.map((p) => (
                        <ResultItem key={p.id} primary={p.name} />
                      ))}
                    </ResultSection>
                  )}
                </div>

                {totalResults === 0 && (
                  <div className="py-8 text-center">
                    <Search size={32} className="mx-auto text-tu-text-muted/50 mb-2" />
                    <p className="text-sm text-tu-text-muted">ไม่พบผลลัพธ์ที่ตรงกับคำค้นหา</p>
                    <p className="text-xs text-tu-text-muted/70 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function ResultSection({ icon: Icon, label, count, children }: {
  icon: React.ElementType; label: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-tu-primary-soft">
          <Icon size={13} className="text-tu-primary" />
        </div>
        <h3 className="text-xs font-semibold text-tu-text-primary">{label}</h3>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{count}</Badge>
      </div>
      <ul className="space-y-1.5 pl-8">{children}</ul>
    </div>
  );
}

function ResultItem({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <li className="group flex items-center gap-1.5 text-sm text-tu-text-primary cursor-pointer hover:text-tu-primary transition-colors">
      <ChevronRight size={12} className="text-tu-text-muted group-hover:text-tu-primary transition-colors shrink-0" />
      <span>{primary}</span>
      {secondary && <span className="text-xs text-tu-text-muted">{secondary}</span>}
    </li>
  );
}
