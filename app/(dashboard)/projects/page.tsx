"use client";

import { useState } from "react";
import useSWR from "swr";
import { swrFetcher, fetchApi } from "@/lib/fetcher";
import { useUrlState } from "@/hooks/use-url-state";
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, useDroppable,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, GripVertical, Calendar, Users, CheckCircle, XCircle, Check, Trash2, UserPlus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserSearchCombobox } from "@/components/shared/user-search-combobox";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

type ColumnId = "planning" | "in_progress" | "pending_approval" | "completed";
type ProjectType = "วิชาการ" | "หลักสูตร" | "สัมมนา" | "IT" | "งบประมาณ" | string;

interface Member { name: string; role: string; }

interface ProjectCard {
  id: string; name: string; description: string; type: ProjectType;
  column: ColumnId; progress: number; owner: string; deadline: string;
  startDate: string; members: Member[]; reason?: string;
}

const COLUMNS: { id: ColumnId; label: string; color: string }[] = [
  { id: "planning", label: "Planning", color: "border-t-tu-info" },
  { id: "in_progress", label: "In Progress", color: "border-t-tu-warning" },
  { id: "pending_approval", label: "Pending Approval", color: "border-t-tu-secondary-active" },
  { id: "completed", label: "Completed", color: "border-t-tu-success" },
];

const DEFAULT_PROJECT_TYPES: ProjectType[] = ["วิชาการ", "หลักสูตร", "สัมมนา", "IT", "งบประมาณ"];

/* ==============================================================================
   Create / Edit Project Modal
   ============================================================================== */

function ProjectFormModal({ open, onClose, onSave, edit, projectTypes }: {
  open: boolean; onClose: () => void;
  projectTypes: ProjectType[];
  onSave: (data: { name: string; type: ProjectType; description: string; startDate: string; deadline: string; members: Member[]; progress?: number }) => void;
  edit?: ProjectCard;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const [type, setType] = useState<ProjectType>(edit?.type ?? "วิชาการ");
  const [desc, setDesc] = useState(edit?.description ?? "");
  const [start, setStart] = useState(edit?.startDate ?? "");
  const [end, setEnd] = useState(edit?.deadline ?? "");
  const [members, setMembers] = useState<Member[]>(edit?.members ?? []);
  const [progress, setProgress] = useState(edit?.progress ?? 0);
  const [ddOpen, setDdOpen] = useState(false);
  const [showCombobox, setShowCombobox] = useState(false);

  const addMember = (user: { userId: string; name: string; department: string }) => {
    if (members.some(m => m.userId === user.userId)) return;
    setMembers([...members, { userId: user.userId, name: user.name, department: user.department, role: "" }]);
    setShowCombobox(false);
  };
  const removeMember = (i: number) => setMembers(members.filter((_, idx) => idx !== i));
  const updateMemberRole = (i: number, role: string) => {
    const next = [...members];
    next[i] = { ...next[i], role };
    setMembers(next);
  };

  const memberUserIds = members.map(m => m.userId).filter(Boolean);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), type, description: desc.trim(), startDate: start, deadline: end, members, progress: edit ? progress : undefined });
    setName(""); setType("วิชาการ"); setDesc(""); setStart(""); setEnd(""); setProgress(0); setMembers([]); setDdOpen(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-tu-text-primary">{edit ? "แก้ไขโครงการ" : "สร้างโครงการ"}</h2>
          <button onClick={onClose} className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover"><XCircle size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">ชื่อโครงการ <span className="text-tu-error">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ระบุชื่อโครงการ..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
          </div>

          {/* Type dropdown */}
          <div className="relative">
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">ประเภท <span className="text-tu-error">*</span></label>
            <button onClick={() => setDdOpen(!ddOpen)} className="w-full flex items-center justify-between rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors">
              <span className="text-tu-text-primary">{type}</span>
              <span className="text-tu-text-muted text-xs">▾</span>
            </button>
            {ddOpen && (
              <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-10 py-1">
                {projectTypes.map(t => (
                  <button key={t} onClick={() => { setType(t); setDdOpen(false); }} className={cn("w-full text-left px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors", type === t && "bg-tu-primary-soft text-tu-primary font-medium")}>{t}</button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">วัตถุประสงค์</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="ระบุวัตถุประสงค์..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-tu-text-secondary mb-1.5">วันที่เริ่ม</label><input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
            <div><label className="block text-xs font-medium text-tu-text-secondary mb-1.5">วันที่สิ้นสุด</label><input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          </div>

          {/* Progress slider (edit only) */}
          {edit && (
            <div>
              <label className="block text-xs font-medium text-tu-text-secondary mb-1.5">ความคืบหน้า: {progress}%</label>
              <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} className="w-full accent-tu-primary" />
              <div className="w-full h-2 rounded-full bg-tu-bg overflow-hidden mt-1">
                <div className={cn("h-full rounded-full transition-all", progress === 100 ? "bg-tu-success" : progress >= 50 ? "bg-tu-secondary" : "bg-tu-primary")} style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-tu-text-secondary">สมาชิก</label>
              <button onClick={() => setShowCombobox(!showCombobox)} className="flex items-center gap-1 text-xs font-medium text-tu-primary hover:text-tu-primary-hover transition-colors"><UserPlus size={12} />เพิ่มสมาชิก</button>
            </div>
            {showCombobox && (
              <div className="mb-2">
                <UserSearchCombobox onSelect={addMember} excludeUserIds={memberUserIds} />
              </div>
            )}
            {members.length === 0 && <p className="text-xs text-tu-text-muted py-2">ยังไม่มีสมาชิก — กด "เพิ่มสมาชิก" เพื่อเพิ่ม</p>}
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={m.userId || i} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tu-text-primary truncate">{m.name}</p>
                    {m.department && <p className="text-[10px] text-tu-text-muted">{m.department}</p>}
                  </div>
                  <input type="text" value={m.role} onChange={e => updateMemberRole(i, e.target.value)} placeholder="บทบาท" className="w-28 rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" />
                  <button onClick={() => removeMember(i)} className="p-1.5 rounded-md text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10 transition-colors"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handleSave} disabled={!name.trim()} className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{edit ? "บันทึก" : "สร้างโครงการ"}</button>
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
  onAction: (id: string, reason: string) => void;
  project: ProjectCard | null;
}) {
  const [reason, setReason] = useState("");
  if (!open || !project) return null;

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
          <button onClick={() => { onAction(project.id, reason.trim()); setReason(""); onClose(); }} disabled={!reason.trim()} className="rounded-[--radius-btn] bg-tu-success px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-colors disabled:opacity-50">อนุมัติ</button>
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
  onAction: (id: string, reason: string) => void;
  project: ProjectCard | null;
}) {
  const [reason, setReason] = useState("");
  if (!open || !project) return null;

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
          <button onClick={() => { onAction(project.id, reason.trim()); setReason(""); onClose(); }} disabled={!reason.trim()} className="rounded-[--radius-btn] border border-tu-error px-4 py-2 text-sm font-medium text-tu-error hover:bg-tu-error/10 transition-colors disabled:opacity-50">ปฏิเสธ</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Sortable Card
   ============================================================================== */

function SortableCard({ project, onEdit, onApproveClick, onRejectClick, canApprove, canDelete, onDelete }: {
  project: ProjectCard;
  onEdit: (p: ProjectCard) => void;
  onApproveClick: (p: ProjectCard) => void;
  onRejectClick: (p: ProjectCard) => void;
  canApprove?: boolean;
  canDelete?: boolean;
  onDelete?: (p: ProjectCard) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id, data: { column: project.column } });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} suppressHydrationWarning style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, touchAction: "none" }}
      className="bg-tu-surface rounded-lg border border-tu-border p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
      <div className="flex items-start gap-2 mb-2">
        <GripVertical size={14} className="mt-0.5 text-tu-text-muted shrink-0 pointer-events-none" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-tu-text-primary leading-snug">{project.name}</h4>
          <p className="text-xs text-tu-text-muted mt-0.5 line-clamp-1">{project.description}</p>
        </div>
        <button onPointerDown={e => { e.stopPropagation(); onEdit(project); }} className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-tu-text-muted hover:text-tu-primary hover:bg-tu-primary-soft transition-all shrink-0"><Pencil size={13} /></button>
        {canDelete && onDelete && (
          <button onPointerDown={e => { e.stopPropagation(); onDelete(project); }} className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-tu-text-muted hover:text-tu-error hover:bg-tu-error/10 transition-all shrink-0"><Trash2 size={13} /></button>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-[10px]">{project.type}</Badge>
        <span className="text-[10px] text-tu-text-muted flex items-center gap-1"><Calendar size={10} />{new Date(project.deadline).toLocaleDateString("th-TH")}</span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-[10px] text-tu-text-muted mb-0.5"><span>ความคืบหน้า</span><span>{project.progress}%</span></div>
        <div className="h-1.5 rounded-full bg-tu-bg overflow-hidden"><div className={cn("h-full rounded-full", project.progress === 100 ? "bg-tu-success" : project.progress >= 50 ? "bg-tu-secondary" : "bg-tu-primary")} style={{ width: `${project.progress}%` }} /></div>
      </div>
      {project.column === "pending_approval" && canApprove && (
        <div className="flex gap-1.5 mt-2 pt-2 border-t border-tu-border" onClick={e => e.stopPropagation()}>
          <button onPointerDown={e => { e.stopPropagation(); onApproveClick(project); }} className="flex-1 flex items-center justify-center gap-1 rounded-md bg-tu-success/10 px-2 py-1.5 text-[10px] font-medium text-tu-success hover:bg-tu-success/20 transition-colors"><Check size={12} />อนุมัติ</button>
          <button onPointerDown={e => { e.stopPropagation(); onRejectClick(project); }} className="flex-1 flex items-center justify-center gap-1 rounded-md bg-tu-error/10 px-2 py-1.5 text-[10px] font-medium text-tu-error hover:bg-tu-error/20 transition-colors"><XCircle size={12} />ปฏิเสธ</button>
        </div>
      )}
      <div className="flex items-center justify-between text-[10px] text-tu-text-muted mt-1">
        <span className="flex items-center gap-1"><Users size={10} />{project.owner}</span>
        <span className="flex items-center gap-1"><Users size={10} />{project.members?.length ?? 0} คน</span>
      </div>
    </div>
  );
}

/* ==============================================================================
   Droppable Column
   ============================================================================== */

function DroppableColumn({ col, projects, onEdit, onApproveClick, onRejectClick, canApprove, canDelete, onDelete }: {
  col: { id: ColumnId; label: string; color: string };
  projects: ProjectCard[];
  onEdit: (p: ProjectCard) => void;
  onApproveClick: (p: ProjectCard) => void;
  onRejectClick: (p: ProjectCard) => void;
  canApprove?: boolean;
  canDelete?: boolean;
  onDelete?: (p: ProjectCard) => void;
}) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: col.id });
  return (
    <div ref={setDropRef} className={cn("bg-tu-bg rounded-[--radius-card] border border-tu-border border-t-2 flex flex-col min-h-[300px] overflow-hidden transition-colors", col.color, isOver && "ring-2 ring-tu-primary bg-tu-primary-soft/10")}>
      <div className="px-4 py-3 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-tu-text-primary">{col.label}</h3>
        <Badge variant="outline" className="text-[10px]">{projects.length}</Badge>
      </div>
      <SortableContext items={projects.map(p => p.id)}>
        <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto">
          {projects.map(proj => (
            <SortableCard key={proj.id} project={proj} onEdit={onEdit} onApproveClick={onApproveClick} onRejectClick={onRejectClick} canApprove={canApprove} canDelete={canDelete} onDelete={onDelete} />
          ))}
          {projects.length === 0 && (
            <div className="flex items-center justify-center h-24 text-xs text-tu-text-muted pointer-events-none">ลากการ์ดมาวางที่นี่</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function ProjectsPage() {
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
  const [search, setSearch] = useUrlState("search", "");
  const [typeParam, setTypeParam] = useUrlState("type", "");
  const typeFilter: ProjectType | null = (typeParam && PROJECT_TYPES.includes(typeParam) ? typeParam : null) as ProjectType | null;
  const setTypeFilter = (t: ProjectType | null) => setTypeParam(t ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectCard | null>(null);
  const [approveTarget, setApproveTarget] = useState<ProjectCard | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectCard | null>(null);

  const canCreate = useHasPermission("PROJECTS_CREATE");
  const canApprove = useHasPermission("PROJECTS_APPROVE");
  const canEdit = useHasPermission("PROJECTS_EDIT");
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
    if (targetCol) {
      try { await fetchApi(`/api/projects`, { method: "PUT", body: JSON.stringify({ id: active.id, status: targetCol }) }); } catch {}
      await mutate();
      return;
    }

    const overProject = projects.find(p => p.id === over.id);
    if (overProject) {
      try { await fetchApi(`/api/projects`, { method: "PUT", body: JSON.stringify({ id: active.id, status: overProject.column }) }); } catch {}
      await mutate();
    }
  };

  const handleApprove = async (id: string, reason: string) => {
    try { await fetchApi("/api/projects", { method: "PUT", body: JSON.stringify({ id, status: "completed", description: reason }) }); } catch {}
    await mutate();
  };

  const handleReject = async (id: string, reason: string) => {
    try { await fetchApi("/api/projects", { method: "PUT", body: JSON.stringify({ id, status: "planning", description: reason }) }); } catch {}
    await mutate();
  };

  const handleCreate = async (data: { name: string; type: ProjectType; description: string; startDate: string; deadline: string; members: Member[] }) => {
    const memberIds = data.members.filter(m => m.userId).map(m => ({ userId: m.userId, role: m.role || "member" }));
    try { await fetchApi("/api/projects", { method: "POST", body: JSON.stringify({ ...data, memberIds }) }); } catch {}
    await mutate();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await fetchApi(`/api/projects?id=${deleteTarget.id}`, { method: "DELETE" }); } catch {}
    setDeleteTarget(null);
    await mutate();
  };

  const handleEdit = async (data: { name: string; type: ProjectType; description: string; startDate: string; deadline: string; members: Member[]; progress?: number }) => {
    if (!editTarget) return;
    const memberIds = data.members.filter(m => m.userId).map(m => ({ userId: m.userId, role: m.role || "member" }));
    try {
      const { progress, members: _m, ...body } = data;
      await fetchApi("/api/projects", { method: "PUT", body: JSON.stringify({ id: editTarget.id, ...body, memberIds }) });
    } catch {}
    setEditTarget(null);
    await mutate();
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) && (!typeFilter || p.type === typeFilter)
  );

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div><h1 className="text-2xl font-semibold text-tu-text-primary">Projects</h1><p className="text-tu-text-muted text-sm mt-1">Kanban Board — Drag & Drop + Approve / Reject</p></div>
        {canCreate && <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors"><Plus size={18} />สร้างโครงการ</button>}
      </div>

      <div className="relative max-w-md shrink-0">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 transition" />
      </div>

      <div className="flex gap-1.5 flex-wrap shrink-0">
        {[null, ...PROJECT_TYPES].map(t => (
          <button key={t ?? "all"} onClick={() => setTypeFilter(t as ProjectType | null)} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors border", typeFilter === t ? "bg-tu-primary text-white border-tu-primary" : "bg-tu-surface border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover")}>{t ?? "ทั้งหมด"}</button>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          {COLUMNS.map(col => {
            const colProjects = filtered.filter(p => p.column === col.id);
            return (
              <DroppableColumn key={col.id} col={col} projects={colProjects} onEdit={p => setEditTarget(p)}
                onApproveClick={p => { setApproveTarget(p); setApproveOpen(true); }}
                onRejectClick={p => { setApproveTarget(p); setRejectOpen(true); }}
                canApprove={canApprove} canDelete={canDelete} onDelete={p => setDeleteTarget(p)} />
            );
          })}
        </div>
        <DragOverlay>{activeProject && (
          <div className="bg-tu-surface rounded-lg border-2 border-tu-primary p-3 shadow-xl opacity-90 rotate-2 w-64"><h4 className="text-sm font-semibold">{activeProject.name}</h4><p className="text-xs text-tu-text-muted mt-0.5">{activeProject.type} · {activeProject.progress}%</p></div>
        )}</DragOverlay>
      </DndContext>

      <ProjectFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} projectTypes={PROJECT_TYPES} />
      <ProjectFormModal key={editTarget?.id ?? "create"} open={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} edit={editTarget ?? undefined} projectTypes={PROJECT_TYPES} />
      <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} onAction={handleApprove} project={approveTarget} />
      <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onAction={handleReject} project={approveTarget} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="ยืนยันลบโครงการ"
        message={`คุณต้องการลบ "${deleteTarget?.name ?? ""}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
        confirmLabel="ลบ"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
