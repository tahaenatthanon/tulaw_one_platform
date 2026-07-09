"use client";

import { useState } from "react";
import { Newspaper, Plus, Calendar, Search, ChevronRight, Users, BookOpen, FlaskConical, GraduationCap, Building2, Phone, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const mockAnnouncements = [
  {
    id: "1",
    title: "ประกาศรายชื่อผู้มีสิทธิ์สอบข้อเขียน",
    category: "ประกาศผล",
    publisher: "ฝ่ายวิชาการ",
    date: "2025-07-09",
    status: "published",
  },
  {
    id: "2",
    title: "ขอเชิญร่วมงานสัมมนาวิชาการประจำปี 2568",
    category: "เชิญชวน",
    publisher: "งานวิจัยและนวัตกรรม",
    date: "2025-07-08",
    status: "published",
  },
  {
    id: "3",
    title: "แจ้งกำหนดการลงทะเบียนเรียนภาค 1/2568",
    category: "ประกาศด่วน",
    publisher: "ฝ่ายวิชาการ",
    date: "2025-07-07",
    status: "published",
  },
  {
    id: "4",
    title: "นโยบายการใช้อาคารเรียนคณะนิติศาสตร์",
    category: "นโยบาย",
    publisher: "สำนักงานคณะ",
    date: "2025-07-05",
    status: "draft",
  },
  {
    id: "5",
    title: "ขยายเวลารับสมัครทุนการศึกษาประจำปี 2568",
    category: "เชิญชวน",
    publisher: "ฝ่ายกิจการนักศึกษา",
    date: "2025-07-03",
    status: "published",
  },
];

const statusLabel: Record<string, string> = {
  published: "เผยแพร่แล้ว",
  draft: "ฉบับร่าง",
  archived: "เก็บถาวร",
};

const statusColor: Record<string, string> = {
  published: "bg-tu-success/10 text-tu-success border-tu-success/20",
  draft: "bg-tu-warning/10 text-tu-warning border-tu-warning/20",
  archived: "bg-tu-text-muted/10 text-tu-text-muted border-tu-text-muted/20",
};

export default function IntranetPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"news" | "calendar" | "contacts">("news");

  const filtered = mockAnnouncements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">
            อินทราเน็ตคณะ
          </h1>
          <p className="text-tu-text-muted text-sm mt-1">
            ข่าวสาร ประกาศ และปฏิทินกิจกรรม
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-tu-text-inverse hover:bg-tu-primary-hover active:bg-tu-primary-active transition-colors">
          <Plus size={18} />
          สร้างประกาศ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-[--radius-btn] p-1 w-fit">
        <button
          onClick={() => setActiveTab("news")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "news"
              ? "bg-tu-primary text-white shadow-sm"
              : "text-tu-text-secondary hover:text-tu-text-primary"
          )}
        >
          <Newspaper size={16} />
          ข่าวสาร
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "calendar"
              ? "bg-tu-primary text-white shadow-sm"
              : "text-tu-text-secondary hover:text-tu-text-primary"
          )}
        >
          <Calendar size={16} />
          ปฏิทิน
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            activeTab === "contacts"
              ? "bg-tu-primary text-white shadow-sm"
              : "text-tu-text-secondary hover:text-tu-text-primary"
          )}
        >
          <Building2 size={16} />
          ติดต่อหน่วยงาน
        </button>
      </div>

      {/* Org Stats — visible on all tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "บุคลากร", value: "48", icon: Users, color: "text-tu-primary", bg: "bg-tu-primary-soft" },
          { label: "หลักสูตร", value: "12", icon: BookOpen, color: "text-tu-info", bg: "bg-tu-info/10" },
          { label: "ผลงานวิจัย", value: "85", icon: FlaskConical, color: "text-tu-success", bg: "bg-tu-success/10" },
          { label: "นักศึกษาปัจจุบัน", value: "2,500", icon: GraduationCap, color: "text-tu-secondary-active", bg: "bg-tu-secondary-soft" },
        ].map((s) => (
          <div key={s.label} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className="text-lg font-bold text-tu-text-primary">{s.value}</p>
              <p className="text-xs text-tu-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {activeTab === "news" ? (
        <>
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาประกาศ..."
                className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2.5 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition"
              />
            </div>
          </div>

          {/* Announcements Table */}
          <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-tu-bg border-b border-tu-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase tracking-wider">
                    ชื่อประกาศ
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase tracking-wider hidden sm:table-cell">
                    หมวดหมู่
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase tracking-wider hidden md:table-cell">
                    ผู้ประกาศ
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase tracking-wider hidden lg:table-cell">
                    วันที่
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tu-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-tu-text-muted">
                      <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
                      <p>ไม่พบประกาศที่ค้นหา</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((ann) => (
                    <tr
                      key={ann.id}
                      className="hover:bg-tu-surface-hover transition-colors"
                    >
                      <td className="px-4 py-3">
                        <a
                          href="#"
                          className="text-sm font-medium text-tu-text-primary hover:text-tu-primary transition-colors"
                        >
                          {ann.title}
                        </a>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs px-2 py-1 rounded-full bg-tu-primary-soft text-tu-primary font-medium">
                          {ann.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-tu-text-secondary hidden md:table-cell">
                        {ann.publisher}
                      </td>
                      <td className="px-4 py-3 text-sm text-tu-text-muted hidden lg:table-cell">
                        {new Date(ann.date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full border font-medium",
                            statusColor[ann.status]
                          )}
                        >
                          {statusLabel[ann.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-tu-border">
              <p className="text-sm text-tu-text-muted">
                แสดง 1-{filtered.length} จาก {filtered.length} รายการ
              </p>
              <div className="flex gap-1">
                <button className="px-3 py-1.5 text-sm rounded-md border border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover disabled:opacity-50 transition-colors">
                  ก่อนหน้า
                </button>
                <button className="px-3 py-1.5 text-sm rounded-md bg-tu-primary text-white">
                  1
                </button>
                <button className="px-3 py-1.5 text-sm rounded-md border border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover disabled:opacity-50 transition-colors">
                  ถัดไป
                </button>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === "calendar" ? (
        /* ─── Calendar Tab ─── */
        <CalendarTab />
      ) : (
        /* ─── Contacts Tab ─── */
        <ContactsTab />
      )}
    </div>
  );
}

/* ==============================================================================
   Calendar Tab — shared constants & component
   ============================================================================== */

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const dayHeaders = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const calendarEvents: Record<number, { title: string; time: string; room: string; dot: string }[]> = {
  10: [{ title: "ประชุมคณะกรรมการบริหาร", time: "09:00 - 12:00", room: "ห้องประชุม 201", dot: "bg-tu-primary" }],
  11: [{ title: "พบนักศึกษา", time: "14:00 - 15:00", room: "ห้องประชุมย่อย 101", dot: "bg-tu-info" }],
  15: [
    { title: "สัมมนาวิชาการกฎหมาย", time: "13:00 - 16:30", room: "ห้องประชุมใหญ่ ชั้น 5", dot: "bg-tu-secondary-active" },
    { title: "ประชุมทีมกฎหมาย", time: "10:00 - 11:00", room: "ห้องประชุม 302", dot: "bg-tu-info" },
  ],
  18: [{ title: "ประชุมสภาคณาจารย์", time: "09:00 - 12:00", room: "ห้องประชุมสภา", dot: "bg-tu-primary" }],
  22: [{ title: "อบรม PDPA สำหรับบุคลากร", time: "08:30 - 16:00", room: "ห้องประชุมสภา", dot: "bg-tu-info" }],
  25: [{ title: "ประชุมฝ่ายวิชาการ", time: "13:00 - 15:00", room: "ห้องประชุม 201", dot: "bg-tu-primary" }],
  28: [{ title: "นำเสนองานวิจัย", time: "09:00 - 12:00", room: "ห้องประชุมสภา", dot: "bg-tu-primary" }],
};

const allCalEvents = Object.entries(calendarEvents)
  .flatMap(([day, evs]) => evs.map((ev) => ({ ...ev, day: Number(day) })))
  .sort((a, b) => a.day - b.day);

const monthIdx = 6;
const buddhistYear = 2568;
const totalDays = 31;
const firstDayOffset = 2;

function CalendarTab() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const displayEvents = selectedDay
    ? calendarEvents[selectedDay] ?? []
    : allCalEvents.map((e) => ({
        title: e.title,
        time: e.time,
        room: e.room,
        dot: e.dot,
        dayLabel: `${e.day} ${thaiMonths[monthIdx]} ${buddhistYear}`,
      }));

  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-6">
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center gap-1 text-sm font-medium text-tu-text-secondary hover:text-tu-primary transition-colors">
          <ChevronRight size={16} className="rotate-180" />
          {thaiMonths[monthIdx - 1]} {buddhistYear}
        </button>
        <h2 className="text-lg font-semibold text-tu-text-primary">{thaiMonths[monthIdx]} {buddhistYear}</h2>
        <button className="flex items-center gap-1 text-sm font-medium text-tu-text-secondary hover:text-tu-primary transition-colors">
          {thaiMonths[monthIdx + 1]} {buddhistYear}
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-1">
          <div className="grid grid-cols-7 text-center mb-2">
            {dayHeaders.map((d, i) => (
              <span key={d + i} className={cn("text-xs font-semibold py-2", (i === 0 || i === 6) ? "text-tu-error" : "text-tu-text-muted")}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center gap-y-1">
            {Array.from({ length: firstDayOffset }, (_, i) => (<div key={`empty-${i}`} className="py-2" />))}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const isToday = day === 9;
              const hasEvent = day in calendarEvents;
              const isSelected = day === selectedDay;
              return (
                <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)} className="flex flex-col items-center py-2 rounded transition-colors min-h-[60px] hover:bg-tu-bg">
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full text-sm", isToday && !isSelected && "ring-2 ring-tu-primary font-semibold text-tu-primary", isSelected && "bg-tu-primary text-white font-semibold", !isToday && !isSelected && "text-tu-text-primary")}>{day}</span>
                  {hasEvent && (
                    <span className="mt-1 flex items-center justify-center gap-0.5">
                      {calendarEvents[day].map((e) => e.dot).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).map((dot, i) => (<span key={i} className={`h-1.5 w-1.5 rounded-full ${dot}`} />))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-tu-border pt-4 lg:pt-0 lg:pl-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-tu-primary" />
            <h3 className="text-sm font-semibold text-tu-text-primary">{selectedDay ? `กิจกรรม ${selectedDay} ${thaiMonths[monthIdx]}` : "กิจกรรมทั้งหมด"}</h3>
            {selectedDay && (<button onClick={() => setSelectedDay(null)} className="ml-auto text-xs text-tu-primary hover:underline">แสดงทั้งหมด</button>)}
          </div>
          {displayEvents.length === 0 ? (<p className="text-xs text-tu-text-muted py-4">ไม่มีกิจกรรมในวันนี้</p>) : (
            <div className="space-y-3">
              {displayEvents.map((ev, i) => (
                <div key={ev.title + i} className="flex items-start gap-2.5">
                  <span className={`mt-1 h-2 w-2 rounded-full ${ev.dot} shrink-0`} />
                  <div className="text-xs min-w-0">
                    <p className="font-medium text-tu-text-primary leading-snug">{ev.title}</p>
                    {"dayLabel" in ev && (<p className="text-tu-text-muted mt-0.5">{ev.dayLabel}</p>)}
                    <p className="text-tu-text-muted">{ev.time}{"room" in ev && ` · ${ev.room}`}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Contacts Tab
   ============================================================================== */

const departments = [
  { name: "สำนักงานคณะนิติศาสตร์", phone: "02-613-2101", email: "law@tu.ac.th", location: "ชั้น 2 อาคารคณะนิติศาสตร์" },
  { name: "ฝ่ายวิชาการ", phone: "02-613-2102", email: "academic.law@tu.ac.th", location: "ชั้น 3 อาคารคณะนิติศาสตร์" },
  { name: "ฝ่ายเทคโนโลยีสารสนเทศ", phone: "02-613-2103", email: "it.law@tu.ac.th", location: "ชั้น 4 อาคารคณะนิติศาสตร์" },
  { name: "ฝ่ายการเงินและบัญชี", phone: "02-613-2104", email: "finance.law@tu.ac.th", location: "ชั้น 2 อาคารคณะนิติศาสตร์" },
  { name: "ฝ่ายวิจัยและนวัตกรรม", phone: "02-613-2105", email: "research.law@tu.ac.th", location: "ชั้น 5 อาคารคณะนิติศาสตร์" },
  { name: "ฝ่ายกิจการนักศึกษา", phone: "02-613-2106", email: "student.law@tu.ac.th", location: "ชั้น 1 อาคารคณะนิติศาสตร์" },
];

function ContactsTab() {
  return (
    <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-tu-bg border-b border-tu-border text-left">
            <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">หน่วยงาน</th>
            <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden sm:table-cell"><Phone size={14} className="inline mr-1" />เบอร์โทร</th>
            <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell"><Mail size={14} className="inline mr-1" />อีเมล</th>
            <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden lg:table-cell"><MapPin size={14} className="inline mr-1" />ที่ตั้ง</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tu-border">
          {departments.map((dept) => (
            <tr key={dept.name} className="hover:bg-tu-surface-hover transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-tu-text-primary">{dept.name}</td>
              <td className="px-4 py-3 text-sm text-tu-text-secondary hidden sm:table-cell">{dept.phone}</td>
              <td className="px-4 py-3 text-sm text-tu-info hidden md:table-cell">{dept.email}</td>
              <td className="px-4 py-3 text-sm text-tu-text-muted hidden lg:table-cell">{dept.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
