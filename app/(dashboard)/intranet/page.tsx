"use client";

import { useState, useMemo, useRef } from "react";
import {
  Newspaper, Plus, Calendar, ChevronRight, ChevronLeft, Users,
  BookOpen, FlaskConical, GraduationCap,
  Building2, Phone, Mail, MapPin, X, BellRing,
  Megaphone, ScrollText, Vote, AlertTriangle, Upload, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

type TabId = "announcements" | "calendar" | "contacts";

interface Announcement {
  id: string; title: string; content: string; category: string; publisher: string; date: string; status: string;
}

interface CalendarEvent {
  id: string; title: string; day: number; category: string; time: string;
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

const CATEGORIES = [
  { key: "ทั้งหมด", label: "ทั้งหมด", color: "bg-tu-primary", text: "text-tu-primary", border: "border-tu-primary", icon: Newspaper },
  { key: "ประกาศด่วน", label: "ด่วน", color: "bg-tu-error", text: "text-tu-error", border: "border-tu-error", icon: AlertTriangle },
  { key: "เชิญชวน", label: "เชิญชวน", color: "bg-tu-warning", text: "text-tu-warning", border: "border-tu-warning", icon: Megaphone },
  { key: "ประกาศผล", label: "ประกาศผล", color: "bg-tu-info", text: "text-tu-info", border: "border-tu-info", icon: ScrollText },
  { key: "นโยบาย", label: "นโยบาย", color: "bg-tu-secondary-active", text: "text-tu-secondary-active", border: "border-tu-secondary-active", icon: Vote },
];

const SUBSCRIBE_CATS = CATEGORIES.filter(c => c.key !== "ทั้งหมด");

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: "1", title: "ประกาศรายชื่อผู้มีสิทธิ์สอบข้อเขียน ประจำปีการศึกษา 2568", content: "ตามที่คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ได้ดำเนินการรับสมัครสอบข้อเขียนประจำปีการศึกษา 2568 บัดนี้การตรวจสอบคุณสมบัติเสร็จสิ้นแล้ว จึงขอประกาศรายชื่อผู้มีสิทธิ์สอบข้อเขียนดังรายละเอียดแนบท้ายประกาศนี้ ผู้มีรายชื่อสามารถเข้ารับการสอบได้ในวันที่ 31 กรกฎาคม 2568 ณ อาคารคณะนิติศาสตร์ ชั้น 5", category: "ประกาศผล", publisher: "ฝ่ายวิชาการ", date: "2025-07-09", status: "published" },
  { id: "2", title: "ขอเชิญร่วมงานสัมมนาวิชาการประจำปี 2568", content: "คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ขอเชิญคณาจารย์ นักศึกษา และผู้สนใจ เข้าร่วมงานสัมมนาวิชาการประจำปี 2568 ในหัวข้อ 'การปฏิรูปกฎหมายไทยในยุคดิจิทัล' วิทยากรรับเชิญ ศาสตราจารย์ ดร.สมชาย ใจดี วันศุกร์ที่ 15 สิงหาคม 2568 เวลา 09.00-16.30 น. ณ ห้องประชุมใหญ่ ชั้น 5 ลงทะเบียนฟรี ไม่มีค่าใช้จ่าย", category: "เชิญชวน", publisher: "งานวิจัยและนวัตกรรม", date: "2025-07-08", status: "published" },
  { id: "3", title: "แจ้งกำหนดการลงทะเบียนเรียน ภาค 1/2568", content: "กำหนดการลงทะเบียนเรียนภาคการศึกษาที่ 1 ปีการศึกษา 2568 นักศึกษาชั้นปีที่ 2-4: วันที่ 1-5 สิงหาคม 2568 นักศึกษาชั้นปีที่ 1: วันที่ 8-12 สิงหาคม 2568 ภาคการศึกษาที่ 1 เริ่มวันที่ 18 สิงหาคม 2568 กรุณาตรวจสอบตารางเรียนก่อนลงทะเบียน", category: "ประกาศด่วน", publisher: "ฝ่ายวิชาการ", date: "2025-07-07", status: "published" },
  { id: "4", title: "นโยบายการใช้อาคารเรียนคณะนิติศาสตร์ ประจำปี 2568", content: "คณะนิติศาสตร์กำหนดนโยบายการใช้อาคารเรียนดังนี้: 1. เปิดให้เข้าใช้อาคารทุกวันจันทร์-ศุกร์ 07.00-20.00 น. 2. วันเสาร์-อาทิตย์ 08.00-17.00 น. 3. ห้องสมุดเปิดบริการทุกวัน 09.00-18.00 น. 4. ห้ามสูบบุหรี่ในบริเวณอาคาร 5. จองห้องประชุมผ่านระบบ Book Meeting", category: "นโยบาย", publisher: "สำนักงานคณะ", date: "2025-07-05", status: "published" },
  { id: "5", title: "ขยายเวลารับสมัครทุนการศึกษาประจำปี 2568", content: "ตามที่งานกิจการนักศึกษาได้เปิดรับสมัครทุนการศึกษาประจำปี 2568 จำนวน 5 ทุน ได้แก่: ทุนเรียนดี ทุนช่วยเหลือนักศึกษาขาดแคลน ทุนพัฒนากิจกรรมนักศึกษา ทุนวิจัย ทุนเรียนดีด้านกฎหมายระหว่างประเทศ บัดนี้ขยายเวลารับสมัครถึงวันที่ 31 กรกฎาคม 2568", category: "เชิญชวน", publisher: "งานกิจการนักศึกษา", date: "2025-07-03", status: "published" },
  { id: "6", title: "ประกาศผลการคัดเลือกอาจารย์ประจำคณะ", content: "คณะนิติศาสตร์ มธ. ขอประกาศผลการคัดเลือกอาจารย์ประจำคณะ จำนวน 2 ตำแหน่ง ได้แก่ 1. นายธรรมนูญ วงศ์วิเศษ สาขากฎหมายอาญา 2. นางสาวพิมพ์ใจ รักนิติศาสตร์ สาขากฎหมายระหว่างประเทศ ให้มารายงานตัววันที่ 1 สิงหาคม 2568 ณ สำนักงานคณะ", category: "ประกาศผล", publisher: "ฝ่ายบุคคล", date: "2025-07-01", status: "published" },
  { id: "7", title: "เร่งด่วน: เปลี่ยนแปลงวันหยุดภาคการศึกษา", content: "คณะนิติศาสตร์ได้รับแจ้งจากมหาวิทยาลัยให้เปลี่ยนแปลงวันหยุดภาคการศึกษา เนื่องจากมีพิธีพระราชทานปริญญาบัตร ให้นักศึกษาหยุดเรียนวันที่ 20-22 กรกฎาคมนี้ และชดเชยวันที่ 5-7 สิงหาคมแทน", category: "ประกาศด่วน", publisher: "สำนักงานคณะ", date: "2025-06-28", status: "published" },
];

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
  { id: "e1", day: 10, title: "ประชุมคณะกรรมการบริหาร", category: "meeting", time: "09:00 - 12:00" },
  { id: "e2", day: 11, title: "สัมมนากฎหมายระหว่างประเทศ", category: "seminar", time: "13:00 - 16:30" },
  { id: "e3", day: 15, title: "สอบกลางภาค 1/2568", category: "exam", time: "09:00 - 12:00" },
  { id: "e4", day: 15, title: "ประชุมทีมกฎหมาย", category: "meeting", time: "10:00 - 11:00" },
  { id: "e5", day: 18, title: "ประชุมสภาคณาจารย์", category: "meeting", time: "09:00 - 12:00" },
  { id: "e6", day: 22, title: "อบรม PDPA บุคลากร", category: "seminar", time: "08:30 - 16:00" },
  { id: "e7", day: 24, title: "กำหนดส่งงานวิจัย", category: "deadline", time: "ภายใน 17:00" },
  { id: "e8", day: 25, title: "ประชุมฝ่ายวิชาการ", category: "meeting", time: "13:00 - 15:00" },
  { id: "e9", day: 28, title: "วันหยุดชดเชย", category: "holiday", time: "ทั้งวัน" },
  { id: "e10", day: 30, title: "กำหนดส่งเกรด", category: "deadline", time: "ภายใน 16:00" },
];

const MONTH = "กรกฎาคม";
const YEAR = 2568;
const DAYS_IN_MONTH = 31;
const START_DAY = 2; // Tuesday
const DAY_HEADERS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const TODAY = 9;

const ORG_STATS = [
  { label: "บุคลากร", value: 48, icon: Users, color: "text-tu-primary", bg: "bg-tu-primary-soft" },
  { label: "หลักสูตร", value: 12, icon: BookOpen, color: "text-tu-info", bg: "bg-tu-info/10" },
  { label: "งานวิจัย", value: 85, icon: FlaskConical, color: "text-tu-success", bg: "bg-tu-success/10" },
  { label: "นักศึกษา", value: 2500, icon: GraduationCap, color: "text-tu-warning", bg: "bg-tu-warning/10" },
];

/* ==============================================================================
   Create Announcement Modal
   ============================================================================== */

function CreateModal({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (title: string, content: string, category: string) => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-tu-text-primary">สร้างประกาศ</h2>
          <button onClick={onClose} className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">ชื่อประกาศ <span className="text-tu-error">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ระบุชื่อประกาศ..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เนื้อหา</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="ระบุเนื้อหาประกาศ..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none resize-none" />
          </div>

          {/* Upload field */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">อัปโหลดไฟล์</label>
            <input ref={fileRef} type="file" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name ?? null)} />
            <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-2 rounded-[--radius-input] border border-dashed border-tu-border bg-tu-surface px-3 py-3 text-sm text-tu-text-muted hover:border-tu-primary hover:text-tu-primary transition-colors">
              <Upload size={16} />{fileName ?? "คลิกเพื่อเลือกไฟล์ (.pdf, .docx, .xlsx)"}
            </button>
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หมวดหมู่ <span className="text-tu-error">*</span></label>
            <button onClick={() => setDdOpen(!ddOpen)} className="w-full flex items-center justify-between rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors">
              <span className="flex items-center gap-2">
                {(() => { const c = CATEGORIES.find(x => x.key === cat) ?? CATEGORIES[1]; const I = c.icon; return <><I size={14} className={c.text} /><span className="text-tu-text-primary">{cat}</span></>; })()}
              </span>
              <span className="text-tu-text-muted text-xs">▾</span>
            </button>
            {ddOpen && (
              <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                {CATEGORIES.filter(c => c.key !== "ทั้งหมด").map(c => (
                  <button key={c.key} onClick={() => { setCat(c.key); setDdOpen(false); }} className={cn("w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors", cat === c.key && "bg-tu-primary-soft")}>
                    <c.icon size={14} className={c.text} /><span className="text-tu-text-primary">{c.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleCreate} disabled={!title.trim()} className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">สร้างประกาศ</button>
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
  const [pickedDay, setPickedDay] = useState<number | null>(null);
  const [calMonth, setCalMonth] = useState(6); // July

  const handleCreate = () => {
    if (!title.trim() || !pickedDay) return;
    onCreate(title.trim(), cat, `${startTime} - ${endTime}`, pickedDay);
    setTitle(""); setCat("meeting"); setStartTime("09:00"); setEndTime("12:00"); setPickedDay(null);
    onClose();
  };

  if (!open) return null;

  const monthName = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"][calMonth];
  const calDaysInMonth = calMonth === 6 ? 31 : 30;
  const calStartDay = calMonth === 6 ? 2 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-tu-text-primary">สร้างกิจกรรม</h2>
          <button onClick={onClose} className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หัวข้อ <span className="text-tu-error">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="ระบุหัวข้อกิจกรรม..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
          </div>

          {/* Category dropdown */}
          <div className="relative">
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หมวดหมู่</label>
            <button onClick={() => setDdOpen(!ddOpen)} className="w-full flex items-center justify-between rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors">
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
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="flex-1 rounded-[--radius-input] border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
              </div>
              <span className="text-tu-text-muted text-xs">—</span>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="flex-1 rounded-[--radius-input] border border-tu-border bg-tu-surface px-2 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none" />
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
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleCreate} disabled={!title.trim() || !pickedDay} className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">สร้างกิจกรรม</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Detail Modal
   ============================================================================== */

function DetailModal({ ann, open, onClose }: { ann: Announcement | null; open: boolean; onClose: () => void }) {
  if (!open || !ann) return null;
  const cat = CATEGORIES.find(c => c.key === ann.category) ?? CATEGORIES[0];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tu-primary-soft"><cat.icon size={16} className={cat.text} /></div>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border bg-tu-surface", cat.border, cat.text)}>{ann.category}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover"><X size={18} /></button>
        </div>
        <h2 className="text-base font-semibold text-tu-text-primary mb-3">{ann.title}</h2>
        <div className="text-xs text-tu-text-muted mb-4 flex items-center gap-3">
          <span>{ann.publisher}</span><span>·</span><span>{new Date(ann.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div className="border-t border-tu-border pt-4">
          <p className="text-sm text-tu-text-secondary leading-relaxed whitespace-pre-wrap">{ann.content}</p>
        </div>
        <div className="mt-6 pt-4 border-t border-tu-border flex justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors">ปิด</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Announcements Tab
   ============================================================================== */

function AnnouncementsTab({ announcements, canCreate }: { announcements: Announcement[]; canCreate: boolean }) {
  const [selectedFilter, setSelectedFilter] = useState("ทั้งหมด");
  const [subscribed, setSubscribed] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [detailAnn, setDetailAnn] = useState<Announcement | null>(null);
  const [anns, setAnns] = useState(announcements);

  const filtered = selectedFilter === "ทั้งหมด"
    ? anns
    : anns.filter(a => a.category === selectedFilter);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "ทั้งหมด": anns.length };
    anns.forEach(a => { counts[a.category] = (counts[a.category] ?? 0) + 1; });
    return counts;
  }, [anns]);

  const handleSubscribe = (cat: string) => {
    setSubscribed(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  };

  const handleCreate = (title: string, content: string, category: string) => {
    const newAnn: Announcement = {
      id: String(Date.now()), title, content, category,
      publisher: "ฉัน", date: new Date().toISOString().slice(0, 10), status: "published",
    };
    setAnns(prev => [newAnn, ...prev]);
  };

  return (
    <div className="space-y-4">
      {/* Subscribe bar */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <BellRing size={16} className="text-tu-primary" />
          <span className="text-sm font-semibold text-tu-text-primary">Subscribe:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUBSCRIBE_CATS.map(c => (
            <button key={c.key} onClick={() => handleSubscribe(c.key)}
              className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                subscribed.has(c.key) ? `${c.text} ${c.border} bg-tu-surface` : "border-tu-border text-tu-text-muted hover:border-tu-text-secondary")}>
              <c.icon size={12} /><span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar + Create button in one row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setSelectedFilter(c.key)}
              className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                selectedFilter === c.key ? `${c.text} ${c.border} bg-tu-surface` : "border-tu-border text-tu-text-muted hover:border-tu-text-secondary")}>
              <c.icon size={12} />
              <span>{c.label}</span>
              <span className={cn("rounded-full px-1.5 py-0 text-[10px] font-bold", selectedFilter === c.key ? c.color + " text-white" : "bg-tu-bg text-tu-text-muted")}>
                {categoryCounts[c.key] ?? 0}
              </span>
            </button>
          ))}
        </div>
        {canCreate && (
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors shrink-0">
            <Plus size={16} />สร้างประกาศ
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-tu-text-muted"><Newspaper size={40} className="mx-auto mb-3 opacity-20" /><p>ไม่พบประกาศ</p></div>
        ) : filtered.map(ann => {
          const cat = CATEGORIES.find(c => c.key === ann.category) ?? CATEGORIES[0];
          return (
            <div key={ann.id} onClick={() => setDetailAnn(ann)} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cat.key === "ทั้งหมด" ? "bg-tu-primary-soft" : cat.color.replace("bg-", "bg-") + "/10")}>
                  <cat.icon size={20} className={cat.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-tu-text-primary group-hover:text-tu-primary transition-colors">{ann.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border bg-tu-surface", cat.border, cat.text)}>{ann.category}</span>
                    <span className="text-xs text-tu-text-muted">{new Date(ann.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); setDetailAnn(ann); }} className="p-1 rounded-md text-tu-text-muted hover:text-tu-primary hover:bg-tu-primary-soft transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CreateModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreate} />
      <DetailModal ann={detailAnn} open={!!detailAnn} onClose={() => setDetailAnn(null)} />
    </div>
  );
}

/* ==============================================================================
   Calendar Tab
   ============================================================================== */

function CalendarTab() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [events, setEvents] = useState(CALENDAR_EVENTS);
  const [createOpen, setCreateOpen] = useState(false);

  const selectedEvents = selectedDay ? events.filter(e => e.day === selectedDay) : [];
  const allDaysEvents = (day: number) => events.filter(e => e.day === day);

  const handleCreate = (title: string, category: string, time: string, day: number) => {
    setEvents(prev => [{ id: String(Date.now()), title, category, time, day }, ...prev]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Calendar (left) */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 lg:basis-[70%] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronLeft size={16} /></button>
          <h3 className="text-base font-semibold text-tu-text-primary">{MONTH} {YEAR}</h3>
          <button className="p-1 rounded hover:bg-tu-surface-hover text-tu-text-muted"><ChevronRight size={16} /></button>
        </div>

        <div className="grid grid-cols-7 text-center mb-2">
          {DAY_HEADERS.map((d, i) => (
            <span key={d + i} className={cn("text-xs font-semibold py-1", (i === 0 || i === 6) ? "text-tu-error" : "text-tu-text-muted")}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center border-t border-l border-tu-border/50 rounded-lg overflow-hidden">
          {Array.from({ length: START_DAY }, (_, i) => <div key={`e${i}`} className="py-1 border-r border-b border-tu-border/50" />)}
          {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map(day => {
            const isToday = day === TODAY;
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
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 lg:basis-[30%]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-tu-text-primary">กิจกรรม</h4>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1 rounded-[--radius-btn] bg-tu-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors"><Plus size={14} />สร้างกิจกรรม</button>
        </div>
        {selectedDay ? (
          <>
            <h4 className="text-sm font-semibold text-tu-text-primary mb-3">วันที่ {selectedDay} {MONTH}</h4>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-tu-text-muted py-8 text-center">ไม่มีกิจกรรมในวันนี้</p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map(ev => {
                  const cat = CALENDAR_CATEGORIES[ev.category];
                  return (
                    <div key={ev.id} className="flex items-start gap-3 p-3 bg-tu-bg rounded-lg">
                      <span className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", cat?.color)} />
                      <div>
                        <p className="text-sm text-tu-text-primary font-medium">{ev.title}</p>
                        <p className="text-xs text-tu-text-muted mt-0.5">{ev.time}</p>
                        <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-1", cat?.bg, cat?.color.replace("bg-", "text-"))}>{cat?.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
    </div>
  );
}

/* ==============================================================================
   Contacts Tab
   ============================================================================== */

function ContactsTab({ departments }: { departments: Department[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {departments.map(dept => (
        <div key={dept.name} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tu-primary-soft"><Building2 size={16} className="text-tu-primary" /></div>
            <h3 className="text-sm font-semibold text-tu-text-primary">{dept.name}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-tu-text-secondary"><Phone size={14} className="text-tu-text-muted shrink-0" />{dept.phone}</p>
            <p className="flex items-center gap-2 text-tu-text-secondary"><Mail size={14} className="text-tu-text-muted shrink-0" />{dept.email}</p>
            <p className="flex items-center gap-2 text-tu-text-secondary"><MapPin size={14} className="text-tu-text-muted shrink-0" />{dept.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function IntranetPage() {
  const [activeTab, setActiveTab] = useState<TabId>("announcements");
  const canCreate = useHasPermission("INTRANET_CREATE");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-tu-text-primary">อินทราเน็ตคณะ</h1>
        <p className="text-tu-text-muted text-sm mt-1">ข่าวสาร ประกาศ และปฏิทินกิจกรรม — คณะนิติศาสตร์ มหาวิทยาลัยธรรมศาสตร์</p>
      </div>

      {/* Org Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ORG_STATS.map(s => (
          <div key={s.label} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", s.bg)}><s.icon size={20} className={s.color} /></div>
            <div><p className="text-lg font-bold text-tu-text-primary">{s.value.toLocaleString("th-TH")}</p><p className="text-xs text-tu-text-muted">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tab selector with icons */}
      <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5 w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary hover:text-tu-text-primary")}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "announcements" && <AnnouncementsTab announcements={MOCK_ANNOUNCEMENTS} canCreate={canCreate} />}
      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "contacts" && <ContactsTab departments={MOCK_DEPARTMENTS} />}
    </div>
  );
}
