"use client";

import { useState, useMemo, Suspense } from "react";
import useSWR from "swr";
import { swrFetcher, fetchApi, ApiError } from "@/lib/fetcher";
import { useUrlState } from "@/hooks/use-url-state";
import { toast } from "sonner";
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, useDroppable,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Search, Calendar, Check, XCircle, Trash2, UserPlus,
  LayoutGrid, List as ListIcon, Filter as FilterIcon, MoreHorizontal, Tag,
  FolderPlus, SearchX, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserSearchCombobox } from "@/components/shared/user-search-combobox";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

type ColumnId = "planning" | "in_progress" | "pending_approval" | "completed";
type ProjectType = "วิชาการ" | "หลักสูตร" | "สัมมนา" | "IT" | "งบประมาณ" | string;

type Priority = "low" | "medium" | "high" | "urgent";

type ViewMode = "kanban" | "list";

interface Member { userId?: string; name: string; role: string; department?: string; }

interface ProjectCard {
  id: string; name: string; description: string; type: ProjectType;
  column: ColumnId; progress: number; owner: string; deadline: string;
  startDate: string; members: Member[]; reason?: string;
  code?: string; priority?: Priority; labels?: string[];
  taskCount?: { done: number; total: number }; attachments?: number; comments?: number;
}

const COLUMNS: { id: ColumnId; label: string; accent: string; dot: string }[] = [
  { id: "planning", label: "Planning", accent: "from-tu-info/20", dot: "bg-tu-info" },
  { id: "in_progress", label: "In Progress", accent: "from-tu-warning/20", dot: "bg-tu-warning" },
  { id: "pending_approval", label: "Pending Approval", accent: "from-tu-secondary/25", dot: "bg-tu-secondary" },
  { id: "completed", label: "Completed", accent: "from-tu-success/20", dot: "bg-tu-success" },
];

const DEFAULT_PROJECT_TYPES: ProjectType[] = ["วิชาการ", "หลักสูตร", "สัมมนา", "วิจัย", "IT", "งบประมาณ"];

const PRIORITY_META: Record<string, { label: string; className: string }> = {
  low:    { label: "Low",    className: "bg-slate-100 text-slate-600 ring-slate-200" },
  medium: { label: "Medium", className: "bg-tu-info/10 text-tu-info ring-tu-info/30" },
  high:   { label: "High",   className: "bg-tu-warning/10 text-tu-warning ring-tu-warning/30" },
  urgent: { label: "Urgent", className: "bg-tu-error/10 text-tu-error ring-tu-error/30" },
};

function fmtDate(iso: string) {
  if (!iso) return "—";
  // Parse date part only (YYYY-MM-DD) to avoid timezone offset from ISO full datetime
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}
function initials(name: string) {
  return name.split(/\s+/).map(s => s[0]).slice(0, 2).join("").toUpperCase();
}

/* ==============================================================================
   Priority Badge
   ============================================================================== */
function PriorityBadge({ p }: { p: string }) {
  const meta = PRIORITY_META[p] || PRIORITY_META.medium;
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", meta.className)}><span className="h-1.5 w-1.5 rounded-full bg-current" />{meta.label}</span>;
}

/* ==============================================================================
   Progress Bar
   ============================================================================== */
function ProgressBar({ value }: { value: number }) {
  const color = value === 100 ? "bg-tu-success" : value >= 66 ? "bg-tu-info" : value >= 33 ? "bg-tu-secondary" : "bg-tu-primary";
  return <div className="h-1.5 w-full rounded-full bg-tu-bg overflow-hidden"><div className={cn("h-full rounded-full transition-[width] duration-500", color)} style={{ width: `${value}%` }} /></div>;
}

/* ==============================================================================
   Avatar Stack
   ============================================================================== */
function AvatarStack({ members, max = 3 }: { members: Member[]; max?: number }) {
  const shown = members.slice(0, max);
  const rest = Math.max(0, members.length - max);
  return (
    <div className="flex -space-x-2">
      {shown.map(m => (
        <div key={m.userId || m.name} title={m.name} className="h-7 w-7 rounded-full ring-2 ring-tu-surface bg-gradient-to-br from-tu-primary to-tu-primary-active text-white text-[10px] font-semibold flex items-center justify-center">{initials(m.name)}</div>
      ))}
      {rest > 0 && <div className="h-7 w-7 rounded-full ring-2 ring-tu-surface bg-tu-bg text-tu-text-secondary text-[10px] font-semibold flex items-center justify-center">+{rest}</div>}
    </div>
  );
}

/* ==============================================================================
   Filter Select
   ============================================================================== */
function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="appearance-none pr-8 pl-3 h-9 rounded-[10px] border border-tu-border bg-tu-surface text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover focus:outline-none focus:ring-2 focus:ring-tu-primary/20 focus:border-tu-primary transition-colors" aria-label={label}>
        {options.map(o => <option key={o.value} value={o.value}>{label}: {o.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-tu-text-muted">▾</span>
    </div>
  );
}

/* ==============================================================================
   Create / Edit Project Modal
   ============================================================================== */

function ProjectFormModal({ open, onClose, onSave, edit, projectTypes }: {
  open: boolean; onClose: () => void;
  projectTypes: ProjectType[];
  onSave: (data: { name: string; type: ProjectType; description: string; startDate: string; deadline: string; members: Member[]; progress?: number; priority?: Priority }) => void;
  edit?: ProjectCard;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const [type, setType] = useState<ProjectType>(edit?.type ?? "วิชาการ");
  const [desc, setDesc] = useState(edit?.description ?? "");
  const [start, setStart] = useState(edit?.startDate ? edit.startDate.slice(0, 10) : "");
  const [end, setEnd] = useState(edit?.deadline ? edit.deadline.slice(0, 10) : "");
  const [prio, setPrio] = useState<Priority>((edit?.priority as Priority) ?? "medium");
  const [members, setMembers] = useState<Member[]>(edit?.members ?? []);
  const [progress, setProgress] = useState(edit?.progress ?? 0);
  const [ddOpen, setDdOpen] = useState(false);
  const [prioOpen, setPrioOpen] = useState(false);
  const [showCombobox, setShowCombobox] = useState(false);

  const addMember = (user: { userId: string; name: string; department: string }) => {
    if (members.some(m => m.userId === user.userId)) return;
    setMembers([...members, { userId: user.userId, name: user.name, department: user.department, role: "" }]);
    setShowCombobox(false);
  };
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));
  const updateMemberRole = (i: number, role: string) => {
    const next = [...members]; next[i] = { ...next[i], role }; setMembers(next);
  };
  const memberUserIds = members.map(m => m.userId).filter((id): id is string => !!id);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await onSave({ name: name.trim(), type, description: desc.trim(), startDate: start, deadline: end, members, progress: edit ? progress : undefined, priority: prio });
      setName(""); setType("วิชาการ"); setDesc(""); setStart(""); setEnd(""); setPrio("medium"); setProgress(0); setMembers([]); setDdOpen(false);
      onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  if (!open) return null;
  const isEdit = !!edit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-tu-surface w-full max-w-lg rounded-[20px] border border-tu-border shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-tu-border">
          <div>
            <h2 className="text-base font-semibold text-tu-text-primary">{isEdit ? "แก้ไขโครงการ" : "สร้างโครงการใหม่"}</h2>
            <p className="text-xs text-tu-text-muted mt-0.5">{isEdit ? "แก้ไขข้อมูลโครงการที่มีอยู่" : "กรอกรายละเอียดโครงการเพื่อเริ่มต้น"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tu-text-muted hover:bg-tu-bg hover:text-tu-text-primary"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-tu-text-secondary mb-1.5">ชื่อโครงการ <span className="text-tu-error">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ระบุชื่อโครงการ..." className="w-full h-10 rounded-[10px] border border-tu-border bg-tu-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-tu-primary/20 focus:border-tu-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-tu-text-secondary mb-1.5">วัตถุประสงค์</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="ระบุวัตถุประสงค์..." className="w-full rounded-[10px] border border-tu-border bg-tu-surface px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-tu-primary/20 focus:border-tu-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-xs font-semibold text-tu-text-secondary mb-1.5">ประเภท <span className="text-tu-error">*</span></label>
              <button onClick={() => setDdOpen(!ddOpen)} className="w-full h-10 flex items-center justify-between rounded-[10px] border border-tu-border bg-tu-surface px-3 text-sm hover:bg-tu-surface-hover transition-colors">
                <span className="text-tu-text-primary">{type}</span><span className="text-tu-text-muted text-xs">▾</span>
              </button>
              {ddOpen && (
                <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                  {projectTypes.map(t => (
                    <button key={t} onClick={() => { setType(t); setDdOpen(false); }} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors", type === t && "bg-tu-primary-soft text-tu-primary font-medium")}>{t}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-tu-text-secondary mb-1.5">ระดับความสำคัญ <span className="text-tu-error">*</span></label>
              <button onClick={() => setPrioOpen(!prioOpen)} className="w-full h-10 flex items-center justify-between rounded-[10px] border border-tu-border bg-tu-surface px-3 text-sm hover:bg-tu-surface-hover transition-colors">
                <span className="text-tu-text-primary">{PRIORITY_META[prio].label}</span><span className="text-tu-text-muted text-xs">▾</span>
              </button>
              {prioOpen && (
                <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                  {(Object.keys(PRIORITY_META) as Priority[]).map(p => (
                    <button key={p} onClick={() => { setPrio(p); setPrioOpen(false); }} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors", prio === p && "bg-tu-primary-soft text-tu-primary font-medium")}>{PRIORITY_META[p].label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-tu-text-secondary mb-1.5">วันที่เริ่ม</label><input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full h-10 rounded-[10px] border border-tu-border bg-tu-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-tu-primary/20 focus:border-tu-primary" /></div>
            <div><label className="block text-xs font-semibold text-tu-text-secondary mb-1.5">วันที่สิ้นสุด</label><input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full h-10 rounded-[10px] border border-tu-border bg-tu-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-tu-primary/20 focus:border-tu-primary" /></div>
          </div>
          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-tu-text-secondary mb-1.5">ความคืบหน้า: {progress}%</label>
              <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full accent-tu-primary" />
              <ProgressBar value={progress} />
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-tu-text-secondary">สมาชิก</label>
              <button onClick={() => setShowCombobox(!showCombobox)} className="flex items-center gap-1 text-xs font-medium text-tu-primary hover:text-tu-primary-hover transition-colors"><UserPlus size={12} />เพิ่มสมาชิก</button>
            </div>
            {showCombobox && <div className="mb-2"><UserSearchCombobox onSelect={addMember} excludeUserIds={memberUserIds} /></div>}
            {members.length === 0 && <p className="text-xs text-tu-text-muted py-2">ยังไม่มีสมาชิก — กด &quot;เพิ่มสมาชิก&quot; เพื่อเพิ่ม</p>}
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={m.userId || i} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-tu-text-primary truncate">{m.name}</p>{m.department && <p className="text-[10px] text-tu-text-muted">{m.department}</p>}</div>
                  <input type="text" value={m.role} onChange={e => updateMemberRole(i, e.target.value)} placeholder="บทบาท" className="w-28 h-9 rounded-[10px] border border-tu-border bg-tu-surface px-3 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
                  <button onClick={() => removeMember(i)} className="p-1.5 rounded-md text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-tu-border bg-tu-bg/30">
          <button onClick={onClose} className="h-9 rounded-[10px] border border-tu-border bg-tu-surface px-4 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover">ยกเลิก</button>
          <button onClick={handleSave} disabled={!name.trim()} className="h-9 rounded-[10px] bg-tu-primary text-white px-4 text-sm font-medium hover:bg-tu-primary-hover shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">{isEdit ? "บันทึก" : "สร้างโครงการ"}</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Approve Modal (อนุมัติ + ยกเลิก, no X)
   ============================================================================== */

function ApproveModal({ open, onClose, onAction, project }: {
  open: boolean; onClose: () => void;
  onAction: (id: string, reason: string) => Promise<void>;
  project: ProjectCard | null;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!open || !project) return null;

  const handleAction = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onAction(project.id, reason.trim());
      setReason(""); onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "เกิดข้อผิดพลาด");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-tu-text-primary mb-1">{project.name}</h2>
        <p className="text-sm text-tu-text-secondary mb-4">{project.description}</p>
        <div>
          <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เหตุผลในการอนุมัติ <span className="text-tu-error">*</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="ระบุเหตุผล..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 resize-none" />
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleAction} disabled={!reason.trim() || submitting} className="rounded-[--radius-btn] bg-tu-success px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-colors disabled:opacity-50">{submitting ? "กำลังดำเนินการ..." : "อนุมัติ"}</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Reject Modal (ปฏิเสธ + ยกเลิก, no X)
   ============================================================================== */

function RejectModal({ open, onClose, onAction, project }: {
  open: boolean; onClose: () => void;
  onAction: (id: string, reason: string) => Promise<void>;
  project: ProjectCard | null;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!open || !project) return null;

  const handleAction = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onAction(project.id, reason.trim());
      setReason(""); onClose();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "เกิดข้อผิดพลาด");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-tu-text-primary mb-1">{project.name}</h2>
        <p className="text-sm text-tu-text-secondary mb-4">{project.description}</p>
        <div>
          <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">เหตุผลในการปฏิเสธ <span className="text-tu-error">*</span></label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="ระบุเหตุผล..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 resize-none" />
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleAction} disabled={!reason.trim() || submitting} className="rounded-[--radius-btn] border border-tu-error px-4 py-2 text-sm font-medium text-tu-error hover:bg-tu-error/10 transition-colors disabled:opacity-50">{submitting ? "กำลังดำเนินการ..." : "ปฏิเสธ"}</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Sortable Card
   ============================================================================== */

function ProjectCardView({ project, onEdit, onApproveClick, onRejectClick, canApprove, canDelete, onDelete }: {
  project: ProjectCard;
  onEdit: (p: ProjectCard) => void;
  onApproveClick: (p: ProjectCard) => void;
  onRejectClick: (p: ProjectCard) => void;
  canApprove?: boolean;
  canDelete?: boolean;
  onDelete?: (p: ProjectCard) => void;
}) {
  const overdue = new Date(project.deadline) < new Date() && project.column !== "completed";
  const p = project.priority || "medium";
  const labels = project.labels;

  return (
    <div className="group bg-tu-surface rounded-2xl border border-tu-border shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_-8px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 transition-all duration-200 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-md bg-tu-bg px-1.5 py-0.5 text-[10px] font-medium text-tu-text-secondary border border-tu-border">{project.type}</span>
            <PriorityBadge p={p} />
          </div>
          <h4 className="text-sm font-semibold text-tu-text-primary leading-snug line-clamp-2">{project.name}</h4>
        </div>
        <button type="button" onPointerDown={e => { e.stopPropagation(); onEdit(project); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-tu-text-muted hover:text-tu-primary hover:bg-tu-primary-soft transition-all shrink-0" aria-label="More"><MoreHorizontal size={16} /></button>
        {canDelete && onDelete && (
          <button type="button" onPointerDown={e => { e.stopPropagation(); onDelete(project); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10 transition-all shrink-0" aria-label="Delete"><Trash2 size={16} /></button>
        )}
      </div>
      {project.description && <p className="text-xs text-tu-text-muted mb-3 line-clamp-2 leading-relaxed">{project.description}</p>}
      {labels && labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {labels.map(l => <span key={l} className="inline-flex items-center gap-1 rounded-md bg-tu-bg px-1.5 py-0.5 text-[10px] font-medium text-tu-text-secondary border border-tu-border"><Tag size={9} /> {l}</span>)}
        </div>
      )}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-tu-text-muted mb-1"><span>ความคืบหน้า</span><span className="font-semibold text-tu-text-secondary tabular-nums">{project.progress}%</span></div>
        <ProgressBar value={project.progress} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-tu-text-muted">
        <span className={cn("inline-flex items-center gap-1 font-medium", overdue ? "text-tu-error" : "text-tu-text-secondary")}><Calendar size={11} />{project.startDate ? `${fmtDate(project.startDate)} – ${fmtDate(project.deadline)}` : fmtDate(project.deadline)}</span>
      </div>
      {project.column === "pending_approval" && canApprove && (
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-tu-border" onClick={e => e.stopPropagation()}>
          <button onPointerDown={e => { e.stopPropagation(); onApproveClick(project); }} className="flex-1 flex items-center justify-center gap-1 rounded-md bg-tu-success/10 px-2 py-1.5 text-[10px] font-medium text-tu-success hover:bg-tu-success/20 transition-colors"><Check size={12} />อนุมัติ</button>
          <button onPointerDown={e => { e.stopPropagation(); onRejectClick(project); }} className="flex-1 flex items-center justify-center gap-1 rounded-md bg-tu-error/10 px-2 py-1.5 text-[10px] font-medium text-tu-error hover:bg-tu-error/20 transition-colors"><XCircle size={12} />ปฏิเสธ</button>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-tu-border flex items-center justify-between">
        <AvatarStack members={project.members} />
        <span className="text-[10px] text-tu-text-muted">โดย <span className="font-medium text-tu-text-secondary">{project.owner}</span></span>
      </div>
    </div>
  );
}

/* ==============================================================================
   Droppable Column
   ============================================================================== */

function SortableCard({ project, ...rest }: { project: ProjectCard } & Omit<Parameters<typeof ProjectCardView>[0], "project">) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id, data: { column: project.column } });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} suppressHydrationWarning style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, touchAction: "none" }} className="cursor-grab active:cursor-grabbing">
      <ProjectCardView project={project} {...rest} />
    </div>
  );
}

/* ==============================================================================
   Kanban Column (redesigned)
   ============================================================================== */
function KanbanColumn({ col, projects, ...rest }: { col: (typeof COLUMNS)[number]; projects: ProjectCard[] } & Omit<Parameters<typeof ProjectCardView>[0], "project">) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div ref={setNodeRef} className={cn("flex flex-col min-h-[420px] rounded-2xl border border-tu-border bg-tu-bg/60 overflow-hidden transition-all", isOver && "ring-2 ring-tu-primary/40 bg-tu-primary-soft/30")}>
      <div className={cn("bg-gradient-to-b to-transparent px-4 pt-4 pb-3", col.accent)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", col.dot)} />
            <h3 className="text-sm font-semibold text-tu-text-primary">{col.label}</h3>
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-tu-surface border border-tu-border text-[11px] font-semibold text-tu-text-secondary tabular-nums">{projects.length}</span>
          </div>
        </div>
      </div>
      <SortableContext items={projects.map(p => p.id)}>
        <div className="flex-1 px-3 pb-3 space-y-3 overflow-y-auto">
          {projects.map(p => <SortableCard key={p.id} project={p} {...rest} />)}
          {projects.length === 0 && <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-tu-border text-xs text-tu-text-muted">ลากการ์ดมาวางที่นี่</div>}
        </div>
      </SortableContext>
    </div>
  );
}

/* ==============================================================================
   List Row
   ============================================================================== */
function ListRow({ project, onEdit }: { project: ProjectCard; onEdit: (p: ProjectCard) => void }) {
  const overdue = new Date(project.deadline) < new Date() && project.column !== "completed";
  const col = COLUMNS.find(c => c.id === project.column)!;
  const p = project.priority || "medium";
  return (
    <div className="grid grid-cols-12 items-center gap-3 px-4 py-3 hover:bg-tu-bg/60 transition-colors">
      <div className="col-span-12 md:col-span-5 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="inline-flex items-center rounded-md bg-tu-bg px-1.5 py-0.5 text-[10px] font-medium text-tu-text-secondary border border-tu-border">{project.type}</span>
          <PriorityBadge p={p} />
        </div>
        <button onClick={() => onEdit(project)} className="text-left text-sm font-semibold text-tu-text-primary hover:text-tu-primary truncate block w-full">{project.name}</button>
        <p className="text-xs text-tu-text-muted truncate">{project.description}</p>
      </div>
      <div className="col-span-4 md:col-span-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-tu-text-secondary"><span className={cn("h-1.5 w-1.5 rounded-full", col.dot)} />{col.label}</span>
      </div>
      <div className="col-span-4 md:col-span-2">
        <ProgressBar value={project.progress} />
        <div className="text-[10px] text-tu-text-muted mt-1 tabular-nums">{project.progress}%</div>
      </div>
      <div className="col-span-2 md:col-span-1"><AvatarStack members={project.members} max={3} /></div>
      <div className={cn("col-span-2 md:col-span-2 text-xs font-medium text-right", overdue ? "text-tu-error" : "text-tu-text-secondary")}>
        <span className="inline-flex items-center gap-1"><Calendar size={12} />{project.startDate ? `${fmtDate(project.startDate)} – ${fmtDate(project.deadline)}` : fmtDate(project.deadline)}</span>
      </div>
    </div>
  );
}

/* ==============================================================================
   Empty States
   ============================================================================== */
function EmptyState({ variant, onCreate }: { variant: "no-projects" | "no-results"; onCreate?: () => void }) {
  const isSearch = variant === "no-results";
  const Icon = isSearch ? SearchX : FolderPlus;
  return (
    <div className="bg-tu-surface rounded-2xl border border-dashed border-tu-border p-14 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-tu-primary-soft text-tu-primary mb-4"><Icon size={28} /></div>
      <h3 className="text-base font-semibold text-tu-text-primary">{isSearch ? "ไม่พบโครงการที่ตรงกับเงื่อนไข" : "ยังไม่มีโครงการในระบบ"}</h3>
      <p className="text-sm text-tu-text-muted mt-1 max-w-md mx-auto">{isSearch ? "ลองปรับคำค้นหาหรือลบตัวกรองบางรายการเพื่อดูผลลัพธ์เพิ่มเติม" : "เริ่มต้นจัดการงานของคณะได้ทันที เพียงสร้างโครงการแรกของคุณ"}</p>
      {!isSearch && onCreate && <button onClick={onCreate} className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] bg-tu-primary text-white px-4 py-2 text-sm font-medium hover:bg-tu-primary-hover transition-colors"><Plus size={16} /> สร้างโครงการ</button>}
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-tu-text-muted">Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}

function ProjectsContent() {
  const { data: apiProjects, isLoading, mutate } = useSWR("/api/projects", swrFetcher);
  const projects: ProjectCard[] = Array.isArray(apiProjects) ? apiProjects : [];

  // Fetch project types from System Settings API
  const { data: settingsData } = useSWR("/api/settings", swrFetcher);
  const settings = (settingsData || {}) as Record<string, Record<string, unknown>>;
  const storageSection = (settings.storage || {}) as Record<string, unknown>;
  const rawProjCats: Array<{ id: string; name: string }> =
    (Array.isArray(storageSection.projCats) ? storageSection.projCats : DEFAULT_PROJECT_TYPES.map(n => ({ id: n, name: n }))) as Array<{ id: string; name: string }>;
  const PROJECT_TYPES: ProjectType[] = rawProjCats.map(c => c.name);

  const [activeProject, setActiveProject] = useState<ProjectCard | null>(null);
  const [search, setSearch] = useUrlState<string>("search", "");
  const [view, setView] = useState<ViewMode>("kanban");
  const [filters, setFilters] = useState<{ status: string; priority: string; category: string }>({ status: "all", priority: "all", category: "all" });
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectCard | null>(null);
  const [approveTarget, setApproveTarget] = useState<ProjectCard | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectCard | null>(null);

  const canCreate = useHasPermission("PROJECTS_CREATE");
  const canApprove = useHasPermission("PROJECTS_APPROVE");
  const canDelete = useHasPermission("PROJECTS_DELETE");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e: DragStartEvent) => setActiveProject(projects.find(p => p.id === e.active.id) ?? null);

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveProject(null);
    const { active, over } = e;
    if (!over) return;
    const overCol = COLUMNS.find(c => c.id === String(over.id));
    const targetCol = overCol?.id;
    if (!targetCol) return;

    // Block drag-to-completed: pending_approval items must be approved via modal with reason
    const draggedProject = projects.find(p => p.id === active.id);
    if (targetCol === "completed" && draggedProject?.column === "pending_approval") {
      setApproveTarget(draggedProject);
      setApproveOpen(true);
      return;
    }

    try { await fetchApi(`/api/projects`, { method: "PUT", body: JSON.stringify({ id: active.id, status: targetCol }) }); } catch {}
    await mutate();
  };

  const handleApprove = async (id: string, reason: string) =>{
    await fetchApi("/api/projects", { method: "PUT", body: JSON.stringify({ id, status: "completed", description: reason }) });
    await mutate();
  };

  const handleReject = async (id: string, reason: string) =>{
    await fetchApi("/api/projects", { method: "PUT", body: JSON.stringify({ id, status: "planning", description: reason }) });
    await mutate();
  };

  const handleCreate = async (data: { name: string; type: ProjectType; description: string; startDate: string; deadline: string; members: Member[]; priority?: Priority }) => {
    const memberIds = data.members.filter(m => m.userId).map(m => ({ userId: m.userId, role: m.role || "member" }));
    const { members: _, ...rest } = data;
    await fetchApi("/api/projects", { method: "POST", body: JSON.stringify({ ...rest, memberIds }) });
    await mutate();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await fetchApi(`/api/projects?id=${deleteTarget.id}`, { method: "DELETE" }); } catch {}
    setDeleteTarget(null);
    await mutate();
  };

  const handleEdit = async (data: { name: string; type: ProjectType; description: string; startDate: string; deadline: string; members: Member[]; progress?: number; priority?: Priority }) => {
    if (!editTarget) return;
    const memberIds = data.members.filter(m => m.userId).map(m => ({ userId: m.userId, role: m.role || "member" }));
    const { members: _, progress: _p, priority, ...body } = data;
    await fetchApi("/api/projects", { method: "PUT", body: JSON.stringify({ id: editTarget.id, ...body, priority, memberIds }) });
    await mutate();
  };

  // Derived data for filters — use all PROJECT_TYPES not just types that have projects
  const categories = useMemo(() => PROJECT_TYPES, [PROJECT_TYPES]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return projects.filter(p => {
      if (q && !(p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))) return false;
      if (filters.status !== "all" && p.column !== filters.status) return false;
      if (filters.priority !== "all" && (p.priority || "medium") !== filters.priority) return false;
      if (filters.category !== "all" && p.type !== filters.category) return false;
      return true;
    });
  }, [projects, search, filters]);

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v !== "all").length + (search ? 1 : 0);
  const showNoResults = !isLoading && projects.length > 0 && filtered.length === 0;
  const showNoProjects = !isLoading && projects.length === 0;

  const cardProps = {
    onEdit: (p: ProjectCard) => setEditTarget(p),
    onApproveClick: (p: ProjectCard) => { setApproveTarget(p); setApproveOpen(true); },
    onRejectClick: (p: ProjectCard) => { setApproveTarget(p); setRejectOpen(true); },
    canApprove, canDelete, onDelete: (p: ProjectCard) => setDeleteTarget(p),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="mt-3 truncate text-[26px] sm:text-[32px] font-semibold tracking-tight leading-tight text-tu-text-primary">Project</h1>
          <p className="mt-2 text-[14px] text-tu-text-muted max-w-2xl">จัดการโครงการของคณะ พร้อมกระดาน Kanban และมุมมองรายการ</p>
        </div>
        {canCreate && (
          <button onClick={() => setCreateOpen(true)} className="shrink-0 h-10 px-4 rounded-[10px] bg-tu-primary text-white hover:bg-tu-primary-hover text-[13px] font-semibold inline-flex items-center gap-2 shadow-sm transition-colors">
            <Plus size={16} />สร้างโครงการ
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 lg:max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาโครงการ" className="w-full h-10 rounded-[10px] border border-tu-border bg-tu-bg/50 pl-9 pr-9 text-sm text-tu-text-primary placeholder:text-tu-text-muted focus:outline-none focus:ring-2 focus:ring-tu-primary/20 focus:border-tu-primary focus:bg-tu-surface transition-all" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-tu-text-muted hover:text-tu-text-primary hover:bg-tu-bg" aria-label="Clear"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-tu-text-muted mr-1">
              <FilterIcon size={12} /> Filters
              {activeFilterCount > 0 && <span className="ml-1 px-1.5 rounded-full bg-tu-primary/10 text-tu-primary">{activeFilterCount}</span>}
            </div>
            <Select label="สถานะ" value={filters.status} onChange={v => setFilters(f => ({ ...f, status: v }))} options={[{ value: "all", label: "ทั้งหมด" }, ...COLUMNS.map(c => ({ value: c.id, label: c.label }))]} />
            <Select label="ระดับ" value={filters.priority} onChange={v => setFilters(f => ({ ...f, priority: v }))} options={[{ value: "all", label: "ทั้งหมด" }, ...Object.keys(PRIORITY_META).map(k => ({ value: k, label: PRIORITY_META[k].label }))]} />
            <Select label="ประเภท" value={filters.category} onChange={v => setFilters(f => ({ ...f, category: v }))} options={[{ value: "all", label: "ทั้งหมด" }, ...categories.map(c => ({ value: c, label: c }))]} />
          </div>
        </div>
      </div>

      {/* View switch + count */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-tu-text-muted">แสดง <span className="font-semibold text-tu-text-primary">{filtered.length}</span> จาก <span className="font-semibold text-tu-text-primary">{projects.length}</span> โครงการ</div>
        <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5">
          <button onClick={() => setView("kanban")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", view === "kanban" ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary")}><LayoutGrid size={14} />Kanban</button>
          <button onClick={() => setView("list")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", view === "list" ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary")}><ListIcon size={14} />List</button>
        </div>
      </div>

      {/* Board / List / States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map(c => <div key={c.id} className="rounded-2xl border border-tu-border bg-tu-bg/60 p-3 space-y-3"><div className="h-6 w-32 bg-tu-surface rounded mb-2 animate-pulse" /><div className="bg-tu-surface rounded-2xl border border-tu-border p-4 space-y-3 animate-pulse"><div className="h-3 w-20 bg-tu-bg rounded" /><div className="h-4 w-3/4 bg-tu-bg rounded" /></div></div>)}
        </div>
      ) : showNoProjects ? (
        <EmptyState variant="no-projects" onCreate={() => setCreateOpen(true)} />
      ) : showNoResults ? (
        <EmptyState variant="no-results" />
      ) : view === "kanban" ? (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map(col => <KanbanColumn key={col.id} col={col} projects={filtered.filter(p => p.column === col.id)} {...cardProps} />)}
          </div>
          <DragOverlay>{activeProject && <div className="w-[300px] rotate-2"><ProjectCardView project={activeProject} {...cardProps} /></div>}</DragOverlay>
        </DndContext>
      ) : (
        <div className="bg-tu-surface rounded-2xl border border-tu-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-tu-border bg-tu-bg/40 text-[10px] font-semibold uppercase tracking-wider text-tu-text-muted">
            <div className="col-span-5">โครงการ</div><div className="col-span-2">สถานะ</div><div className="col-span-2">ความคืบหน้า</div><div className="col-span-1">ทีม</div><div className="col-span-2 text-right">ครบกำหนด</div>
          </div>
          <div className="divide-y divide-tu-border">
            {filtered.map(p => <ListRow key={p.id} project={p} onEdit={(p: ProjectCard) => setEditTarget(p)} />)}
          </div>
        </div>
      )}

      <ProjectFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} projectTypes={PROJECT_TYPES} />
      <ProjectFormModal key={editTarget?.id ?? "create"} open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} edit={editTarget ?? undefined} projectTypes={PROJECT_TYPES} />
      <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} onAction={handleApprove} project={approveTarget} />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onAction={handleReject} project={approveTarget} />
      <ConfirmDialog open={!!deleteTarget} title="ยืนยันลบโครงการ" message={`คุณต้องการลบ "${deleteTarget?.name ?? ""}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`} confirmLabel="ลบ" variant="danger" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
