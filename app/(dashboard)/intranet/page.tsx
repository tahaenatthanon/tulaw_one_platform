"use client";

import { useState, useMemo, useRef, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useUrlState } from "@/hooks/use-url-state";
import useSWR from "swr";
import {
  Newspaper, Plus, Pencil, Calendar, ChevronRight, ChevronLeft,
  Building2, Phone, Mail, MapPin, X, BellRing, Trash2,
  Megaphone, Upload, Clock, Settings2,
  Pin, Search, Filter, CalendarDays, ArrowUpRight,
  Users, BookOpen, FlaskConical, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { swrFetcher } from "@/lib/fetcher";
import { fetchApi, ApiError } from "@/lib/fetcher";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

type TabId = "announcements" | "calendar" | "contacts";

interface Announcement {
  id: string; title: string; content: string; category: string; publisher: string; publisherUserId: string; date: string; status: string;
}

interface CalendarEvent {
  id: string; title: string; day: number; month?: number; year?: number; category: string; time: string;
}

interface Department {
  name: string; phone: string; email: string; location: string;
}

/* ==============================================================================
   Constants
   ============================================================================== */

const TABS: { id: TabId; label: string; icon: typeof Newspaper }[] = [
  { id: "announcements", label: "ประกาศ", icon: Newspaper },
  { id: "calendar", label: "ปฏิทิน", icon: Calendar },
  { id: "contacts", label: "ติดต่อหน่วยงาน", icon: Building2 },
];

const DEFAULT_ANN_CATS = [
  { id: "a1", name: "ประกาศด่วน", color: "#DC2626" },
  { id: "a2", name: "เชิญชวน", color: "#F59E0B" },
  { id: "a3", name: "ประกาศผล", color: "#2563EB" },
  { id: "a4", name: "นโยบาย", color: "#7C3AED" },
];

type CategoryDef = { key: string; label: string; hex: string; hexSoft: string; border: string; icon: typeof Newspaper };

/** Convert hex to rgba with given alpha */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const MOCK_DEPARTMENTS: Department[] = [
  { name: "สำนักงานคณะนิติศาสตร์", phone: "02-613-2101", email: "law@tu.ac.th", location: "อาคารคณะนิติศาสตร์ ชั้น 1" },
  { name: "ฝ่ายวิชาการ", phone: "02-613-2102", email: "academic.law@tu.ac.th", location: "อาคารคณะนิติศาสตร์ ชั้น 2" },
  { name: "ฝ่ายเทคโนโลยีสารสนเทศ", phone: "02-613-2103", email: "it.law@tu.ac.th", location: "อาคารคณะนิติศาสตร์ ชั้น 3" },
  { name: "ฝ่ายการเงิน", phone: "02-613-2104", email: "finance.law@tu.ac.th", location: "อาคารคณะนิติศาสตร์ ชั้น 1" },
  { name: "งานวิจัยและนวัตกรรม", phone: "02-613-2105", email: "research.law@tu.ac.th", location: "อาคารคณะนิติศาสตร์ ชั้น 4" },
  { name: "งานกิจการนักศึกษา", phone: "02-613-2106", email: "student.law@tu.ac.th", location: "อาคารคณะนิติศาสตร์ ชั้น 2" },
];

const CALENDAR_CATEGORIES: Record<string, { label: string; color: string; bg: string }> = {
  meeting: { label: "ประชุม", color: "bg-tu-primary", bg: "bg-tu-primary-soft" },
  seminar: { label: "สัมมนา", color: "bg-tu-info", bg: "bg-tu-info/10" },
  exam: { label: "สอบ", color: "bg-tu-error", bg: "bg-tu-error/10" },
  holiday: { label: "วันหยุด", color: "bg-tu-success", bg: "bg-tu-success/10" },
  deadline: { label: "กำหนดส่ง", color: "bg-tu-warning", bg: "bg-tu-warning/10" },
};

const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "e1", day: 10, month: 6, year: 2026, title: "ประชุมคณะกรรมการบริหาร", category: "meeting", time: "09:00 - 12:00" },
  { id: "e2", day: 11, month: 6, year: 2026, title: "สัมมนากฎหมายระหว่างประเทศ", category: "seminar", time: "13:00 - 16:30" },
  { id: "e3", day: 15, month: 6, year: 2026, title: "สอบกลางภาค 1/2568", category: "exam", time: "09:00 - 12:00" },
  { id: "e4", day: 15, month: 6, year: 2026, title: "ประชุมทีมกฎหมาย", category: "meeting", time: "10:00 - 11:00" },
  { id: "e5", day: 18, month: 6, year: 2026, title: "ประชุมสภาคณาจารย์", category: "meeting", time: "09:00 - 12:00" },
  { id: "e6", day: 22, month: 6, year: 2026, title: "อบรม PDPA บุคลากร", category: "seminar", time: "08:30 - 16:00" },
  { id: "e7", day: 24, month: 6, year: 2026, title: "กำหนดส่งงานวิจัย", category: "deadline", time: "ภายใน 17:00" },
  { id: "e8", day: 25, month: 6, year: 2026, title: "ประชุมฝ่ายวิชาการ", category: "meeting", time: "13:00 - 15:00" },
  { id: "e9", day: 28, month: 6, year: 2026, title: "วันหยุดชดเชย", category: "holiday", time: "ทั้งวัน" },
  { id: "e10", day: 30, month: 6, year: 2026, title: "กำหนดส่งเกรด", category: "deadline", time: "ภายใน 16:00" },
];

const now = new Date();
const THAI_MONTHS = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const YEAR = now.getFullYear() + 543;
const DAY_HEADERS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const TODAY = now.getDate();

/* ==============================================================================
   StatCard Component
   ============================================================================== */

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: typeof Newspaper; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-tu-text-muted">{label}</p>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
          <Icon size={20} className={color} />
        </div>
      </div>
      <p className="text-4xl font-bold text-tu-text-primary tabular-nums">{value.toLocaleString("th-TH")}</p>
    </div>
  );
}

/* ==============================================================================
   Edit Announcement Modal
   ============================================================================== */

function EditModal({ open, onClose, onSave, ann, categories }: {
  open: boolean; onClose: () => void;
  onSave: (id: string, title: string, content: string, category: string) => void;
  ann: Announcement | null; categories: CategoryDef[];
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cat, setCat] = useState("ประกาศด่วน");
  const [ddOpen, setDdOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ann) {
      setTitle(ann.title);
      setContent(ann.content);
      setCat(ann.category);
      setFileName(null);
    }
  }, [ann]);

  const handleSave = async () => {
    if (!title.trim() || !ann) return;
    try {
      await onSave(ann.id, title.trim(), content.trim(), cat);
      setTitle(""); setContent(""); setCat("ประกาศด่วน"); setFileName(null);
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "ไม่สามารถแก้ไขประกาศได้");
    }
  };

  if (!open || !ann) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tu-primary-soft">
            <Pencil size={18} className="text-tu-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tu-text-primary">แก้ไขประกาศ</h2>
            <p className="text-xs text-tu-text-muted">แก้ไขข้อมูลประกาศที่มีอยู่</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-surface-hover transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">ชื่อประกาศ <span className="text-tu-error">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ระบุชื่อประกาศ..." className="w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เนื้อหา</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="ระบุเนื้อหาประกาศ..." className="w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">อัปโหลดไฟล์</label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
            <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-2 rounded-xl border border-dashed border-tu-border bg-tu-surface px-3 py-3 text-sm text-tu-text-muted hover:border-tu-primary hover:text-tu-primary transition-colors">
              <Upload size={16} />{fileName ?? "คลิกเพื่อเลือกไฟล์ใหม่ (ตัวเลือก)"}
            </button>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หมวดหมู่ <span className="text-tu-error">*</span></label>
            <button onClick={() => setDdOpen(!ddOpen)} className="w-full flex items-center justify-between rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors">
              <span className="flex items-center gap-2">
                {(() => { const c = categories.find(x => x.key === cat) ?? categories[1]; const I = c.icon; return <><I size={14} style={{ color: c.hex }} /><span className="text-tu-text-primary">{cat}</span></>; })()}
              </span>
              <span className="text-tu-text-muted text-xs">▾</span>
            </button>
            {ddOpen && (
              <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                {categories.filter(c => c.key !== "ทั้งหมด").map(c => (
                  <button key={c.key} onClick={() => { setCat(c.key); setDdOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors" style={cat === c.key ? { backgroundColor: c.hexSoft } : undefined}>
                    <c.icon size={14} style={{ color: c.hex }} /><span className="text-tu-text-primary">{c.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-xl border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleSave} disabled={!title.trim()} className="rounded-xl bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">บันทึก</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Create Announcement Modal
   ============================================================================== */

function CreateModal({ open, onClose, onCreate, categories }: {
  open: boolean; onClose: () => void;
  onCreate: (title: string, content: string, category: string) => void;
  categories: CategoryDef[];
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cat, setCat] = useState("ประกาศด่วน");
  const [ddOpen, setDdOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreate(title.trim(), content.trim(), cat);
    setTitle(""); setContent(""); setCat("ประกาศด่วน"); setFileName(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tu-primary-soft">
            <Plus size={18} className="text-tu-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tu-text-primary">สร้างประกาศ</h2>
            <p className="text-xs text-tu-text-muted">เพิ่มประกาศใหม่เข้าสู่ระบบ</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-surface-hover transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">ชื่อประกาศ <span className="text-tu-error">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ระบุชื่อประกาศ..." className="w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เนื้อหา</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="ระบุเนื้อหาประกาศ..." className="w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none resize-none" />
          </div>

          {/* Upload field */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">อัปโหลดไฟล์</label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
            <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-2 rounded-xl border border-dashed border-tu-border bg-tu-surface px-3 py-3 text-sm text-tu-text-muted hover:border-tu-primary hover:text-tu-primary transition-colors">
              <Upload size={16} />{fileName ?? "คลิกเพื่อเลือกไฟล์ (.pdf, .docx, .xlsx)"}
            </button>
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หมวดหมู่ <span className="text-tu-error">*</span></label>
            <button onClick={() => setDdOpen(!ddOpen)} className="w-full flex items-center justify-between rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors">
              <span className="flex items-center gap-2">
                {(() => { const c = categories.find(x => x.key === cat) ?? categories[1]; const I = c.icon; return <><I size={14} style={{ color: c.hex }} /><span className="text-tu-text-primary">{cat}</span></>; })()}
              </span>
              <span className="text-tu-text-muted text-xs">▾</span>
            </button>
            {ddOpen && (
              <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                {categories.filter(c => c.key !== "ทั้งหมด").map(c => (
                  <button key={c.key} onClick={() => { setCat(c.key); setDdOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors" style={cat === c.key ? { backgroundColor: c.hexSoft } : undefined}>
                    <c.icon size={14} style={{ color: c.hex }} /><span className="text-tu-text-primary">{c.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-xl border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleCreate} disabled={!title.trim()} className="rounded-xl bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">สร้างประกาศ</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Event Create Modal
   ============================================================================== */

function EventCreateModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (title: string, category: string, time: string, day: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("meeting");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [ddOpen, setDdOpen] = useState(false);
  const [pickedDay, setPickedDay] = useState<number | null>(TODAY);
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const handleCreate = () => {
    if (!title.trim() || !pickedDay) return;
    onCreate(title.trim(), cat, `${startTime} - ${endTime}`, pickedDay);
    setTitle(""); setCat("meeting"); setStartTime("09:00"); setEndTime("12:00"); setPickedDay(null);
    onClose();
  };

  if (!open) return null;

  const monthName = THAI_MONTHS[calMonth];
  const calDaysInMonth = new Date(now.getFullYear(), calMonth + 1, 0).getDate();
  const calStartDay = new Date(now.getFullYear(), calMonth, 1).getDay();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-tu-border shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: "rgba(37,99,235,0.10)" }}>
            <CalendarDays size={18} style={{ color: "#2563eb" }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tu-text-primary">สร้างกิจกรรม</h2>
            <p className="text-xs text-tu-text-muted">เพิ่มกิจกรรมใหม่ลงในปฏิทิน</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-surface-hover transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หัวข้อ <span className="text-tu-error">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ระบุหัวข้อกิจกรรม..." className="w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หมวดหมู่</label>
            <button onClick={() => setDdOpen(!ddOpen)} className="w-full flex items-center justify-between rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors">
              <span className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", CALENDAR_CATEGORIES[cat]?.color)} />
                <span className="text-tu-text-primary">{CALENDAR_CATEGORIES[cat]?.label}</span>
              </span>
              <span className="text-tu-text-muted text-xs">▾</span>
            </button>
            {ddOpen && (
              <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                {Object.entries(CALENDAR_CATEGORIES).map(([key, val]) => (
                  <button key={key} onClick={() => { setCat(key); setDdOpen(false); }} className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors", cat === key && "bg-tu-primary-soft")}>
                    <span className={cn("h-2.5 w-2.5 rounded-full", val.color)} /><span className="text-tu-text-primary">{val.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time range */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เวลา</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <Clock size={14} className="text-tu-text-muted shrink-0" />
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="flex-1 rounded-xl border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
              </div>
              <span className="text-tu-text-muted text-xs">—</span>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="flex-1 rounded-xl border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
            </div>
          </div>

          {/* Mini Calendar day picker */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เลือกวัน <span className="text-tu-error">*</span></label>
            <div className="border border-tu-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setCalMonth(Math.max(0, calMonth - 1))} className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronLeft size={14} /></button>
                <span className="text-xs font-semibold text-tu-text-primary">{monthName} {YEAR}</span>
                <button onClick={() => setCalMonth(Math.min(11, calMonth + 1))} className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronRight size={14} /></button>
              </div>
              <div className="grid grid-cols-7 text-center">
                {DAY_HEADERS.map((d, i) => (<span key={d+i} className={cn("text-[10px] font-semibold py-0.5", (i===0||i===6) ? "text-tu-error" : "text-tu-text-muted")}>{d}</span>))}
              </div>
              <div className="grid grid-cols-7 text-center">
                {Array.from({ length: calStartDay }, (_, i) => <div key={`xe${i}`} className="py-1" />)}
                {Array.from({ length: calDaysInMonth }, (_, i) => i + 1).map(day => (
                  <button key={day} onClick={() => setPickedDay(day)}
                    className={cn("py-1 text-xs rounded transition-colors hover:bg-tu-bg",
                      pickedDay === day ? "bg-tu-primary text-white font-semibold" : "text-tu-text-primary")}>{day}</button>
                ))}
              </div>
              {pickedDay && <p className="text-xs text-tu-primary mt-2 text-center">เลือกวันที่ {pickedDay} {monthName}</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-xl border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleCreate} disabled={!title.trim() || !pickedDay} className="rounded-xl bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">สร้างกิจกรรม</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Event Edit Modal
   ============================================================================== */

function EventEditModal({ open, onClose, onSave, event }: {
  open: boolean; onClose: () => void;
  onSave: (title: string, category: string, time: string) => void;
  event: CalendarEvent | null;
}) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [cat, setCat] = useState(event?.category ?? "meeting");
  const [startTime, setStartTime] = useState(event?.time?.split(" - ")[0] ?? "09:00");
  const [endTime, setEndTime] = useState(event?.time?.split(" - ")[1] ?? "12:00");
  const [ddOpen, setDdOpen] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setCat(event.category);
      setStartTime(event.time?.split(" - ")[0] ?? "09:00");
      setEndTime(event.time?.split(" - ")[1] ?? "12:00");
    }
  }, [event]);

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      await onSave(title.trim(), cat, `${startTime} - ${endTime}`);
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "ไม่สามารถแก้ไขกิจกรรมได้");
    }
  };

  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-tu-border shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: "rgba(37,99,235,0.10)" }}>
            <Pencil size={18} style={{ color: "#2563eb" }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-tu-text-primary">แก้ไขกิจกรรม</h2>
            <p className="text-xs text-tu-text-muted">แก้ไขข้อมูลกิจกรรม</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-surface-hover transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หัวข้อ <span className="text-tu-error">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หมวดหมู่</label>
            <button onClick={() => setDdOpen(!ddOpen)} className="w-full flex items-center justify-between rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors">
              <span className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", CALENDAR_CATEGORIES[cat]?.color)} />
                <span className="text-tu-text-primary">{CALENDAR_CATEGORIES[cat]?.label}</span>
              </span>
              <span className="text-tu-text-muted text-xs">▾</span>
            </button>
            {ddOpen && (
              <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                {Object.entries(CALENDAR_CATEGORIES).map(([key, val]) => (
                  <button key={key} onClick={() => { setCat(key); setDdOpen(false); }} className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors", cat === key && "bg-tu-primary-soft")}>
                    <span className={cn("h-2.5 w-2.5 rounded-full", val.color)} /><span className="text-tu-text-primary">{val.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เวลา</label>
            <div className="flex items-center gap-2">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="flex-1 rounded-xl border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
              <span className="text-tu-text-muted text-xs">—</span>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="flex-1 rounded-xl border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-xl border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleSave} disabled={!title.trim()} className="rounded-xl bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">บันทึก</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Empty State Component
   ============================================================================== */

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="py-14 flex flex-col items-center text-center">
      <div className="relative mb-4">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-tu-primary-soft">
          <Newspaper size={30} className="text-tu-primary" />
        </div>
        <div className="absolute -right-2 -bottom-2 grid h-8 w-8 place-items-center rounded-xl border border-tu-border bg-white">
          <Search size={14} className="text-tu-text-muted" />
        </div>
      </div>
      <div className="text-sm font-semibold text-tu-text-primary">{title}</div>
      <div className="text-xs mt-1 text-tu-text-muted">{desc}</div>
    </div>
  );
}

/* ==============================================================================
   Detail Modal
   ============================================================================== */

function DetailModal({ ann, open, onClose, categories }: { ann: Announcement | null; open: boolean; onClose: () => void; categories: CategoryDef[] }) {
  if (!open || !ann) return null;
  const cat = categories.find(c => c.key === ann.category) ?? categories[0];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: cat.hexSoft }}><cat.icon size={16} style={{ color: cat.hex }} /></div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-white" style={{ borderColor: cat.hex, color: cat.hex }}>{ann.category}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-surface-hover transition-colors"><X size={18} /></button>
        </div>
        <h2 className="text-base font-semibold text-tu-text-primary mb-3">{ann.title}</h2>
        <div className="text-xs text-tu-text-muted mb-4 flex items-center gap-3">
          <span>{ann.publisher}</span><span>·</span><span>{new Date(ann.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div className="border-t border-tu-border pt-4">
          <p className="text-sm text-tu-text-secondary leading-relaxed whitespace-pre-wrap">{ann.content}</p>
        </div>
        <div className="mt-6 pt-4 border-t border-tu-border flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors">ปิด</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Announcements Tab
   ============================================================================== */

function AnnouncementsTab({ announcements, canCreate, canEdit, canDelete, currentUserId, onMutate, categories, subscribeCats, rawAnnCats, mutateSettings }: {
  announcements: Announcement[]; canCreate: boolean; canEdit: boolean; canDelete: boolean;
  currentUserId: string; onMutate: () => void; categories: CategoryDef[]; subscribeCats: CategoryDef[];
  rawAnnCats: Array<{ id: string; name: string; color: string }>;
  mutateSettings: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useUrlState<string>("filter", "ทั้งหมด");
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());
  const [subLoading, setSubLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailAnn, setDetailAnn] = useState<Announcement | null>(null);
  const [editAnn, setEditAnn] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load subscriptions from API
  useSWR("/api/intranet/subscriptions", swrFetcher, {
    onSuccess(data) {
      const subs = (data as unknown as Array<{ category?: { name: string }; isSubscribed: boolean }>) ?? [];
      setSubscribed(new Set(subs.filter((s) => s.isSubscribed).map((s) => s.category?.name).filter(Boolean) as string[]));
    },
  });

  // Lookup category style from the categories prop (no duplicate color map)
  const getCatStyle = useCallback((catName: string): { dot: string; text: string; soft: string } => {
    const cat = categories.find(c => c.key === catName);
    if (cat) return { dot: cat.hex, text: cat.hex, soft: cat.hexSoft };
    return { dot: "#6b7280", text: "#4b5563", soft: "rgba(107,114,128,0.10)" };
  }, [categories]);

  // Resolve announcement category to current name
  const DEFAULT_CAT_ID_MAP = useMemo(() => {
    const map: Record<string, string> = {};
    DEFAULT_ANN_CATS.forEach(c => { map[c.name] = c.id; });
    return map;
  }, []);
  const idToCurrentName = useMemo(() => {
    const map: Record<string, string> = {};
    rawAnnCats.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [rawAnnCats]);

  const resolveName = useCallback((annCategory: string): string => {
    for (const c of rawAnnCats) { if (c.name === annCategory) return annCategory; }
    const id = DEFAULT_CAT_ID_MAP[annCategory];
    if (id && idToCurrentName[id]) return idToCurrentName[id];
    return annCategory;
  }, [rawAnnCats, idToCurrentName, DEFAULT_CAT_ID_MAP]);

  const filtered = useMemo(() => {
    let result = announcements;
    if (selectedFilter !== "ทั้งหมด") {
      result = result.filter(a => resolveName(a.category) === selectedFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(a => `${a.title} ${a.content} ${a.publisher}`.toLowerCase().includes(q));
    }
    return result;
  }, [announcements, selectedFilter, query, resolveName]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "ทั้งหมด": announcements.length };
    announcements.forEach(a => { const name = resolveName(a.category); counts[name] = (counts[name] ?? 0) + 1; });
    return counts;
  }, [announcements, resolveName]);

  const pinned = useMemo(() => announcements.filter(a => a.status === "pinned"), [announcements]);
  const regular = useMemo(() => filtered.filter(a => a.status !== "pinned"), [filtered]);
  const filteredPinned = useMemo(() =>
    selectedFilter === "ทั้งหมด" ? pinned : pinned.filter(a => resolveName(a.category) === selectedFilter),
  [pinned, selectedFilter, resolveName]);

  const handleSubscribe = async (cat: string) => {
    setSubLoading(true);
    const isSubscribed = !subscribed.has(cat);
    setSubscribed(prev => { const n = new Set(prev); if (isSubscribed) n.add(cat); else n.delete(cat); return n; });
    try {
      await fetchApi("/api/intranet/subscriptions", { method: "POST", body: JSON.stringify({ categoryName: cat, isSubscribed }) });
    } catch {
      setSubscribed(prev => { const n = new Set(prev); if (isSubscribed) n.delete(cat); else n.add(cat); return n; });
    }
    setSubLoading(false);
  };

  const handleCreate = async (title: string, content: string, category: string) => {
    try { await fetchApi("/api/announcements", { method: "POST", body: JSON.stringify({ title, content, category }) }); } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถสร้างประกาศได้"); }
    await onMutate();
  };

  const handleEdit = (ann: Announcement) => {
    setEditAnn({ ...ann });
    setEditModalOpen(true);
  };

  const handleEditSave = async (id: string, title: string, content: string, category: string) => {
    await fetchApi("/api/announcements", { method: "PUT", body: JSON.stringify({ id, title, content, category }) });
    toast.success("แก้ไขประกาศสำเร็จ");
    await onMutate();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try { await fetchApi(`/api/announcements?id=${id}`, { method: "DELETE" }); } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถลบประกาศได้"); }
    setDeleting(null);
    setDeleteTarget(null);
    await onMutate();
  };

  return (
    <section className="rounded-2xl border border-tu-border bg-white shadow-sm">
      {/* Header */}
      <header className="p-5 sm:p-6 border-b border-tu-border">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tu-primary-soft">
              <Newspaper size={18} className="text-tu-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate text-tu-text-primary">ประกาศทั้งหมด</h2>
              <p className="text-xs mt-0.5 text-tu-text-muted">{categoryCounts["ทั้งหมด"]} รายการ</p>
            </div>
          </div>
          {canCreate && (
            <div className="flex items-center gap-2 shrink-0">
              {canEdit && (
                <button onClick={() => setCatModalOpen(true)} className="inline-flex items-center gap-1.5 h-9 rounded-lg px-3 text-xs font-medium text-tu-text-secondary border border-tu-border bg-tu-surface hover:bg-tu-surface-hover transition-colors">
                  <Settings2 size={14} />จัดการประเภท
                </button>
              )}
              <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 h-9 rounded-lg px-3 text-xs font-medium text-white bg-tu-primary hover:bg-tu-primary-hover transition-colors">
                <Plus size={14} /><span className="hidden sm:inline">สร้างประกาศ</span>
              </button>
            </div>
          )}
        </div>

        {/* Search + Filter Chips */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tu-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาประกาศ ชื่อเรื่อง หรือหน่วยงาน..."
              className="w-full h-11 rounded-xl border border-tu-border bg-white pl-10 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-tu-border-focus/20 focus:border-tu-border-focus"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1" role="radiogroup" aria-label="กรองตามหมวดหมู่">
            <Filter size={14} className="shrink-0 text-tu-text-muted" />
            {categories.map((c) => {
              const active = selectedFilter === c.key;
              const meta = c.key !== "ทั้งหมด" ? getCatStyle(c.key) : null;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedFilter(c.key)}
                  role="radio"
                  aria-checked={active}
                  className={cn(
                    "inline-flex items-center gap-1.5 shrink-0 rounded-full px-3 h-8 text-xs font-medium transition-colors border",
                    active ? "bg-tu-primary text-white border-tu-primary" : "bg-white text-tu-text-secondary border-tu-border"
                  )}
                >
                  {meta && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? "#fff" : meta.dot }} />}
                  {c.label}
                  {categoryCounts[c.key] !== undefined && (
                    <span className={cn("rounded-full px-1.5 py-0 text-[10px] font-bold", active ? "bg-white/20 text-white" : "bg-tu-bg text-tu-text-muted")}>
                      {categoryCounts[c.key]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subscribe Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <BellRing size={14} className="text-tu-primary shrink-0" />
            <span className="text-xs font-medium text-tu-text-secondary">ติดตามหมวดหมู่</span>
            <div className="flex flex-wrap gap-1.5">
              {subscribeCats.map(c => {
                const isSubbed = subscribed.has(c.key);
                const meta = getCatStyle(c.key);
                return (
                  <button
                    key={c.key}
                    onClick={() => handleSubscribe(c.key)}
                    disabled={subLoading}
                    role="checkbox"
                    aria-checked={isSubbed}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border",
                      isSubbed ? "text-white" : "text-tu-text-secondary border-tu-border hover:border-tu-text-secondary"
                    )}
                    style={isSubbed ? { backgroundColor: meta.dot, borderColor: meta.dot } : undefined}
                  >
                    {isSubbed && <span className="h-1.5 w-1.5 rounded-full bg-white/70" />}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="p-3 sm:p-4">
        {filtered.length === 0 ? (
          <EmptyState title="ไม่พบประกาศ" desc="ลองปรับคำค้นหาหรือเลือกหมวดหมู่อื่น" />
        ) : (
          <>
            {/* Pinned Highlight Cards */}
            {filteredPinned.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {filteredPinned.map(ann => {
                  const catName = resolveName(ann.category);
                  const cs = getCatStyle(catName);
                  return (
                    <article
                      key={ann.id}
                      onClick={() => setDetailAnn(ann)}
                      className="relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-1 cursor-pointer"
                      style={{
                        borderColor: "var(--tu-border)",
                        background: `linear-gradient(135deg,${cs.soft} 0%,#ffffff 60%)`,
                        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ backgroundColor: cs.soft, color: cs.text }}>
                            {catName}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] border-tu-border text-tu-text-secondary">
                            <Pin size={10} /> ปักหมุด
                          </span>
                        </div>
                        <ArrowUpRight size={18} className="text-tu-text-muted" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold leading-snug line-clamp-2 text-tu-text-primary">{ann.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed line-clamp-2 text-tu-text-secondary">{ann.content}</p>
                      <div className="mt-4 flex items-center gap-3 text-[11px] text-tu-text-muted">
                        <span>{ann.publisher}</span><span>·</span>
                        <span>{new Date(ann.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Regular Announcement Cards */}
            <ul className="divide-y divide-tu-border">
              {regular.map((ann) => {
                const catName = resolveName(ann.category);
                const cs = getCatStyle(catName);
                return (
                  <li key={ann.id}>
                    <div onClick={() => setDetailAnn(ann)} className="group w-full text-left rounded-xl p-4 sm:p-5 transition-all hover:bg-tu-surface-hover hover:-translate-y-0.5 cursor-pointer">
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: cs.soft }}>
                          <Newspaper size={18} style={{ color: cs.text }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: cs.soft, color: cs.text }}>
                              {catName}
                            </span>
                            {ann.status === "pinned" && (
                              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] border-tu-border text-tu-text-secondary">
                                <Pin size={10} /> ปักหมุด
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 text-sm sm:text-base font-semibold leading-snug line-clamp-2 text-tu-text-primary">{ann.title}</h3>
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed line-clamp-2 text-tu-text-secondary">{ann.content}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-tu-text-muted">
                            <span className="inline-flex items-center gap-1"><Building2 size={11} /> {ann.publisher}</span>
                            <span>·</span>
                            <span>{new Date(ann.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {canEdit && ann.publisherUserId === currentUserId && (
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(ann); }} className="p-1.5 rounded-md text-tu-text-muted hover:text-tu-info hover:bg-tu-info/10 transition-colors opacity-0 group-hover:opacity-100" title="แก้ไข">
                              <Pencil size={14} />
                            </button>
                          )}
                          {canDelete && ann.publisherUserId === currentUserId && (
                            <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(ann); }} disabled={deleting === ann.id} className="p-1.5 rounded-md text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50" title="ลบ">
                              <Trash2 size={14} />
                            </button>
                          )}
                          <ArrowUpRight size={16} className="shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-tu-text-muted" />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <CreateModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} categories={categories} />
      <EditModal open={editModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleEditSave} ann={editAnn} categories={categories} />
      <DetailModal ann={detailAnn} open={!!detailAnn} onClose={() => setDetailAnn(null)} categories={categories} />
      {catModalOpen && <AnnCategoryModal cats={rawAnnCats} onClose={() => setCatModalOpen(false)} mutateSettings={mutateSettings} />}
      <ConfirmDialog
        open={!!deleteTarget}
        title="ยืนยันลบประกาศ"
        message={`คุณต้องการลบ "${deleteTarget?.title ?? ""}" ใช่หรือไม่?`}
        confirmLabel="ลบ"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}

/* ==============================================================================
   Calendar Tab
   ============================================================================== */

function CalendarTab({ canEdit, canDelete }: { canEdit: boolean; canDelete: boolean }) {
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(TODAY);
  const [events, setEvents] = useState(CALENDAR_EVENTS);

  const monthName = THAI_MONTHS[calMonth];
  const calYearThai = calYear + 543;
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calStartDay = new Date(calYear, calMonth, 1).getDay();
  const calToday = now.getMonth() === calMonth && now.getFullYear() === calYear ? now.getDate() : -1;

  const goPrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else { setCalMonth(calMonth - 1); }
  };
  const goNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else { setCalMonth(calMonth + 1); }
  };
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [calDeleteTarget, setCalDeleteTarget] = useState<CalendarEvent | null>(null);

  // Fetch from API
  useEffect(() => {
    fetch("/api/intranet/calendar").then(r => r.json()).then(j => {
      if (j.success && j.data?.length) setEvents(j.data);
    }).catch(() => {});
  }, []);

  // Filter events by actual date (day + month + year), not just day number
  // Events without month/year fallback to the real current month/year, NOT the viewed month
  const realMonth = now.getMonth();
  const realYear = now.getFullYear();
  const selectedEvents = selectedDay ? events.filter(e => {
    const eMonth = e.month ?? realMonth;
    const eYear = e.year ?? realYear;
    return e.day === selectedDay && eMonth === calMonth && eYear === calYear;
  }) : [];
  const allDaysEvents = (day: number) => events.filter(e => {
    const eMonth = e.month ?? realMonth;
    const eYear = e.year ?? realYear;
    return e.day === day && eMonth === calMonth && eYear === calYear;
  });

  const handleCreate = async (title: string, category: string, time: string, day: number) => {
    try {
      const res = await fetchApi("/api/intranet/calendar", { method: "POST", body: JSON.stringify({ title, category, time, day, month: calMonth, year: calYear }) });
      setEvents(prev => [{ ...(res as unknown as CalendarEvent), day, month: calMonth, year: calYear }, ...prev]);
    } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถเพิ่มกิจกรรมได้"); }
  };

  const handleEdit = (ev: CalendarEvent) => {
    setEditEvent({ ...ev });
  };

  const handleEditSave = async (id: string, title: string, category: string, time: string) => {
    try {
      await fetchApi("/api/intranet/calendar", { method: "PUT", body: JSON.stringify({ id, title, category, time }) });
      setEvents(prev => prev.map(e => e.id === id ? { ...e, title, category, time } : e));
      setEditEvent(null);
    } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถแก้ไขกิจกรรมได้"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchApi(`/api/intranet/calendar?id=${id}`, { method: "DELETE" });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (e) { toast.error(e instanceof ApiError ? e.message : "ไม่สามารถลบกิจกรรมได้"); }
    setCalDeleteTarget(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Calendar (left) */}
      <div className="bg-white rounded-2xl border border-tu-border p-5 lg:basis-[70%] shrink-0" style={{ boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={goPrevMonth} className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronLeft size={16} /></button>
          <h3 className="text-base font-semibold text-tu-text-primary">{monthName} {calYearThai}</h3>
          <button onClick={goNextMonth} className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronRight size={16} /></button>
        </div>

        <div className="grid grid-cols-7 text-center mb-2">
          {DAY_HEADERS.map((d, i) => (
            <span key={d + i} className={cn("text-xs font-semibold py-1", (i === 0 || i === 6) ? "text-tu-error" : "text-tu-text-muted")}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center border-t border-l border-tu-border/50 rounded-lg overflow-hidden">
          {Array.from({ length: calStartDay }, (_, i) => <div key={`e${i}`} className="py-1 border-r border-b border-tu-border/50" />)}
          {Array.from({ length: calDaysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = day === calToday;
            const isSelected = day === selectedDay;
            const dayEvents = allDaysEvents(day);
            const uniqueCats = [...new Set(dayEvents.map(e => e.category))];
            return (
              <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                className="flex flex-col items-center py-1.5 border-r border-b border-tu-border/50 rounded transition-colors hover:bg-tu-bg">
                <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                  isToday && !isSelected && "ring-2 ring-tu-primary text-tu-primary",
                  isSelected && "bg-tu-primary text-white",
                  !isToday && !isSelected && "text-tu-text-primary")}>{day}</span>
                {uniqueCats.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 justify-center flex-wrap">
                    {uniqueCats.slice(0, 3).map(cat => (
                      <span key={cat} className={cn("h-1.5 w-1.5 rounded-full", CALENDAR_CATEGORIES[cat]?.color ?? "bg-tu-border")} title={CALENDAR_CATEGORIES[cat]?.label} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-tu-border">
          {Object.entries(CALENDAR_CATEGORIES).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-tu-text-secondary">
              <span className={cn("h-2 w-2 rounded-full", val.color)} />{val.label}
            </div>
          ))}
        </div>
      </div>

      {/* Events sidebar (right) */}
      <div className="bg-white rounded-2xl border border-tu-border p-5 lg:basis-[30%]" style={{ boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: "rgba(37,99,235,0.10)" }}>
              <CalendarDays size={15} style={{ color: "#2563eb" }} />
            </div>
            <h4 className="text-sm font-semibold text-tu-text-primary">กิจกรรมที่จะถึง</h4>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1 rounded-lg bg-tu-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors">
            <Plus size={14} />สร้างกิจกรรม
          </button>
        </div>
        {selectedDay ? (
          <>
            <h4 className="text-sm font-semibold text-tu-text-primary mb-3">วันที่ {selectedDay} {monthName} {calYearThai}</h4>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-tu-text-muted py-8 text-center">ไม่มีกิจกรรมในวันนี้</p>
            ) : (
              <ul className="space-y-2.5">
                {selectedEvents.map(ev => {
                  const cat = CALENDAR_CATEGORIES[ev.category];
                  const isToday = selectedDay === calToday;
                  return (
                    <li
                      key={ev.id}
                      className="rounded-xl border p-3 transition-colors hover:bg-tu-surface-hover group"
                      style={{
                        borderColor: isToday ? (cat?.color?.replace("bg-", "") ?? "var(--tu-border)") : "var(--tu-border)",
                        backgroundColor: isToday ? (cat?.bg ?? "#fff") : "#fff",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 rounded-lg text-center px-2 py-1.5 min-w-[46px]" style={{ backgroundColor: cat?.bg ?? "var(--tu-bg)" }}>
                          <div className="text-[9px] font-medium uppercase tracking-wider text-tu-text-secondary">{monthName.slice(0, 3)}</div>
                          <div className="text-base font-semibold leading-none mt-0.5 text-tu-text-primary">{selectedDay}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("h-1.5 w-1.5 rounded-full", cat?.color ?? "bg-tu-border")} />
                            <span className="text-[10px] font-medium text-tu-text-secondary">{cat?.label}</span>
                            {isToday && <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 bg-tu-primary text-white">วันนี้</span>}
                          </div>
                          <div className="mt-0.5 text-sm font-medium truncate text-tu-text-primary">{ev.title}</div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-tu-text-muted">
                            <span className="inline-flex items-center gap-1"><Clock size={10} /> {ev.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit && (
                            <button onClick={() => handleEdit(ev)} className="p-1 rounded text-tu-text-muted hover:text-tu-info hover:bg-tu-info/10" title="แก้ไข"><Pencil size={12} /></button>
                          )}
                          {canDelete && (
                            <button onClick={() => setCalDeleteTarget(ev)} className="p-1 rounded text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10" title="ลบ"><Trash2 size={12} /></button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-tu-text-muted">
            <Calendar size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">คลิกวันที่เพื่อดูกิจกรรม</p>
          </div>
        )}
      </div>
      <EventCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <EventEditModal open={!!editEvent} onClose={() => setEditEvent(null)} onSave={(title, category, time) => editEvent && handleEditSave(editEvent.id, title, category, time)} event={editEvent} />
      <ConfirmDialog
        open={!!calDeleteTarget}
        title="ยืนยันลบกิจกรรม"
        message={`คุณต้องการลบ "${calDeleteTarget?.title ?? ""}" ใช่หรือไม่?`}
        confirmLabel="ลบ"
        variant="danger"
        onConfirm={() => calDeleteTarget && handleDelete(calDeleteTarget.id)}
        onCancel={() => setCalDeleteTarget(null)}
      />
    </div>
  );
}

/* ==============================================================================
   Contacts Tab
   ============================================================================== */

function ContactsTab({ departments }: { departments: Department[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {departments.map(dept => (
        <div
          key={dept.name}
          className="group rounded-2xl border border-tu-border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-md hover:border-tu-primary/40 cursor-pointer"
          style={{ boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tu-primary-soft">
              <Building2 size={18} className="text-tu-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate text-tu-text-primary">{dept.name}</h3>
              <div className="mt-2 grid grid-cols-1 gap-1.5 text-[11px] text-tu-text-secondary">
                <a href={`tel:${dept.phone}`} className="inline-flex items-center gap-1.5 hover:text-tu-primary transition-colors">
                  <Phone size={11} className="text-tu-text-muted shrink-0" />{dept.phone}
                </a>
                <a href={`mailto:${dept.email}`} className="inline-flex items-center gap-1.5 truncate hover:text-tu-primary transition-colors">
                  <Mail size={11} className="text-tu-text-muted shrink-0" />
                  <span className="truncate">{dept.email}</span>
                </a>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={11} className="text-tu-text-muted shrink-0" />
                  <span className="truncate">{dept.location}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==============================================================================
   Announcement Category Management Modal
   ============================================================================== */
function AnnCategoryModal({ cats, onClose, mutateSettings }: { cats: Array<{ id: string; name: string; color: string }>; onClose: () => void; mutateSettings: () => void }) {
  const [items, setItems] = useState([...cats]);
  const [newName, setNewName] = useState(""); const [newColor, setNewColor] = useState("#6B7280");
  const [saving, setSaving] = useState(false);

  const add = () => { if (newName.trim()) { setItems([...items, { id: String(Date.now()), name: newName.trim(), color: newColor }]); setNewName(""); } };
  const edit = (id: string, field: "name"|"color", val: string) => setItems(items.map(x => x.id === id ? { ...x, [field]: val } : x));
  const remove = (id: string) => setItems(items.filter(x => x.id !== id));

  const handleSave = async () => {
    setSaving(true);
    const body = { section: "storage", key: "annCats", value: items };
    await fetchApi("/api/settings", { method: "PATCH", body: JSON.stringify(body) });
    await mutateSettings();
    setSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-tu-surface w-full max-w-md rounded-[20px] border border-tu-border shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-tu-border">
          <div><h2 className="text-base font-semibold text-tu-text-primary">จัดการประเภทประกาศ</h2><p className="text-xs text-tu-text-muted mt-0.5">เพิ่ม แก้ไข ลบหมวดหมู่ประกาศ</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-bg"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[55vh] overflow-y-auto">
          {items.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-tu-bg">
              <input type="color" value={c.color} onChange={e => edit(c.id, "color", e.target.value)} className="h-8 w-8 rounded border border-tu-border cursor-pointer shrink-0" />
              <input type="text" value={c.name} onChange={e => edit(c.id, "name", e.target.value)} className="bg-transparent text-sm flex-1 outline-none text-tu-text-primary" />
              <button onClick={() => remove(c.id)} className="p-1 rounded-md text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10"><Trash2 size={14} /></button>
            </div>
          ))}
          <div className="flex gap-2 pt-2 border-t border-tu-border">
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-9 w-10 rounded border border-tu-border cursor-pointer shrink-0" />
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="ชื่อหมวดหมู่..." className="rounded-[10px] border border-tu-border bg-tu-surface px-3 py-2 text-sm flex-1 outline-none" />
            <button onClick={add} className="rounded-[10px] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover"><Plus size={14} /></button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-tu-border bg-tu-bg/30">
          <button onClick={onClose} className="h-9 rounded-[10px] border border-tu-border bg-tu-surface px-4 text-sm font-medium text-tu-text-secondary">ยกเลิก</button>
          <button onClick={handleSave} disabled={saving} className="h-9 rounded-[10px] bg-tu-primary text-white px-4 text-sm font-medium hover:bg-tu-primary-hover disabled:opacity-50">{saving ? "กำลังบันทึก..." : "บันทึก"}</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function IntranetPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading...</div>}>
      <IntranetContent />
    </Suspense>
  );
}

function IntranetContent() {
  const [activeTab, setActiveTab] = useUrlState<TabId>("tab", "announcements");
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const canCreate = useHasPermission("INTRANET_CREATE");
  const canEdit = useHasPermission("INTRANET_EDIT");
  const canDelete = useHasPermission("INTRANET_DELETE");

  // Fetch announcements from API
  const { data: apiAnnouncements, mutate: mutateAnns } = useSWR("/api/announcements", swrFetcher);
  const announcements: Announcement[] = Array.isArray(apiAnnouncements) ? apiAnnouncements : [];

  // Fetch announcement categories from System Settings API
  const { data: settingsData, mutate: mutateSettings } = useSWR("/api/settings", swrFetcher);
  const settings = (settingsData || {}) as Record<string, Record<string, unknown>>;
  const storageSection = (settings.storage || {}) as Record<string, unknown>;
  const rawAnnCats: Array<{ id: string; name: string; color: string }> =
    (Array.isArray(storageSection.annCats) ? storageSection.annCats : DEFAULT_ANN_CATS) as Array<{ id: string; name: string; color: string }>;

  // Update module-level categories from API data — use actual hex colors from system
  const categories: CategoryDef[] = useMemo(() => {
    const allHex = "#A31D1D";
    return [
      { key: "ทั้งหมด", label: "ทั้งหมด", hex: allHex, hexSoft: hexToRgba(allHex, 0.08), border: "border-tu-primary", icon: Newspaper },
      ...rawAnnCats.map(c => ({
        key: c.name,
        label: c.name,
        hex: c.color,
        hexSoft: hexToRgba(c.color, 0.10),
        border: "border-tu-border",
        icon: Megaphone,
      })),
    ];
  }, [rawAnnCats]);
  const SUBSCRIBE_CATS = categories.filter(c => c.key !== "ทั้งหมด");

  // Fetch departments from API
  const { data: apiDepts } = useSWR("/api/intranet/departments", swrFetcher<Department[]>);
  const departments: Department[] = (apiDepts as unknown as Department[])?.length
    ? (apiDepts as unknown as Department[])
    : MOCK_DEPARTMENTS;

  // Fetch org stats from API (Real-time)
  const { data: apiStats } = useSWR("/api/intranet/stats", swrFetcher);
  const stats = (apiStats || {}) as Record<string, number>;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-tu-text-primary leading-tight">Intranet</h1>
        <p className="text-tu-text-muted text-sm mt-1">ศูนย์กลางข่าวสาร การสื่อสาร และข้อมูลภายในคณะนิติศาสตร์</p>
      </div>

      {/* Tab selector */}
      <div className="inline-flex p-1 rounded-xl bg-tu-bg/70 border border-tu-border w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("px-4 h-9 rounded-lg text-[12.5px] font-medium transition-all flex items-center gap-1.5",
              activeTab === tab.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-muted hover:text-tu-text-primary")}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* Org Statistics (Real-time) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="จำนวนบุคลากร" value={stats.personnel ?? 48} color="text-tu-primary" bg="bg-tu-primary-soft" />
        <StatCard icon={BookOpen} label="จำนวนหลักสูตร" value={stats.curriculum ?? 12} color="text-tu-info" bg="bg-tu-info/10" />
        <StatCard icon={FlaskConical} label="จำนวนงานวิจัย" value={stats.research ?? 85} color="text-tu-success" bg="bg-tu-success/10" />
        <StatCard icon={GraduationCap} label="จำนวนนักศึกษา" value={stats.students ?? 2500} color="text-tu-warning" bg="bg-tu-warning/10" />
      </div>

      {/* Tab content */}
      {activeTab === "announcements" && <AnnouncementsTab announcements={announcements} canCreate={canCreate} canEdit={canEdit} canDelete={canDelete} currentUserId={currentUserId} onMutate={mutateAnns} categories={categories} subscribeCats={SUBSCRIBE_CATS} rawAnnCats={rawAnnCats} mutateSettings={mutateSettings} />}
      {activeTab === "calendar" && <CalendarTab canEdit={canEdit} canDelete={canDelete} />}
      {activeTab === "contacts" && <ContactsTab departments={departments} />}
    </div>
  );
}

