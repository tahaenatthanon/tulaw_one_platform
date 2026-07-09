"use client";

import { useState } from "react";
import {
  DndContext, DragOverlay, closestCorners,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, GripVertical, Calendar, Users, CheckCircle, XCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/hooks/use-permission";

type ColumnId = "planning" | "in_progress" | "pending_approval" | "completed";

interface ProjectCard {
  id: string; name: string; description: string; type: string;
  column: ColumnId; progress: number; owner: string; deadline: string; tasks: number;
}

const initialProjects: ProjectCard[] = [
  { id: "1", name: "พัฒนาระบบฐานข้อมูลกฎหมาย", description: "สืบค้นกฎหมายดิจิทัล", type: "IT", column: "in_progress", progress: 65, owner: "วิชัย", deadline: "2025-09-30", tasks: 12 },
  { id: "2", name: "ปรับปรุงหลักสูตร ป.ตรี 2569", description: "อัปเดตหลักสูตร", type: "หลักสูตร", column: "planning", progress: 20, owner: "สมศรี", deadline: "2025-12-15", tasks: 8 },
  { id: "3", name: "สัมมนากฎหมายระหว่างประเทศ", description: "สัมมนาเชิงปฏิบัติการ", type: "สัมมนา", column: "in_progress", progress: 80, owner: "สมชาย", deadline: "2025-08-20", tasks: 15 },
  { id: "4", name: "จัดทำรายงานประจำปี 2568", description: "รายงานผลการดำเนินงาน", type: "งบประมาณ", column: "pending_approval", progress: 95, owner: "ผู้ดูแล", deadline: "2025-07-30", tasks: 5 },
  { id: "5", name: "อบรม PDPA บุคลากร", description: "กฎหมายคุ้มครองข้อมูล", type: "วิชาการ", column: "planning", progress: 10, owner: "นภา", deadline: "2025-10-01", tasks: 6 },
  { id: "6", name: "พัฒนาเว็บไซต์คณะใหม่", description: "รีดีไซน์ UI/UX", type: "IT", column: "in_progress", progress: 40, owner: "ธนา", deadline: "2025-11-01", tasks: 9 },
  { id: "7", name: "ขอทุนวิจัยกฎหมายสิ่งแวดล้อม", description: "เสนอโครงการวิจัย", type: "วิจัย", column: "pending_approval", progress: 70, owner: "สมศรี", deadline: "2025-08-15", tasks: 4 },
  { id: "8", name: "ประเมินการสอน 1/2568", description: "ประเมินอาจารย์", type: "วิชาการ", column: "completed", progress: 100, owner: "สมชาย", deadline: "2025-06-30", tasks: 3 },
];

const columns: { id: ColumnId; label: string; color: string }[] = [
  { id: "planning", label: "วางแผน", color: "border-t-tu-info" },
  { id: "in_progress", label: "กำลังดำเนินการ", color: "border-t-tu-warning" },
  { id: "pending_approval", label: "รออนุมัติ", color: "border-t-tu-secondary-active" },
  { id: "completed", label: "เสร็จสิ้น", color: "border-t-tu-success" },
];

function SortableCard({ project, onApprove, onReject, canApprove, canEdit }: { project: ProjectCard; onApprove: (id: string) => void; onReject?: (id: string) => void; canApprove?: boolean; canEdit?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id, data: { column: project.column } });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }} className="bg-tu-surface rounded-lg border border-tu-border p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-start gap-2 mb-2">
        <button {...attributes} {...listeners} className="mt-0.5 text-tu-text-muted hover:text-tu-text-secondary shrink-0"><GripVertical size={14} /></button>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-tu-text-primary leading-snug">{project.name}</h4>
          <p className="text-xs text-tu-text-muted mt-0.5 line-clamp-1">{project.description}</p>
        </div>
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
        <div className="flex gap-1.5 mt-2 pt-2 border-t border-tu-border">
          <button onClick={() => onApprove(project.id)} className="flex-1 flex items-center justify-center gap-1 rounded-md bg-tu-success/10 px-2 py-1.5 text-[10px] font-medium text-tu-success hover:bg-tu-success/20 transition-colors"><Check size={12} />อนุมัติ</button>
          <button onClick={() => onReject?.(project.id)} className="flex-1 flex items-center justify-center gap-1 rounded-md bg-tu-error/10 px-2 py-1.5 text-[10px] font-medium text-tu-error hover:bg-tu-error/20 transition-colors"><XCircle size={12} />ปฏิเสธ</button>
        </div>
      )}
      <div className="flex items-center justify-between text-[10px] text-tu-text-muted mt-1"><span className="flex items-center gap-1"><Users size={10} />{project.owner}</span><span className="flex items-center gap-1"><CheckCircle size={10} />{project.tasks} งาน</span></div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCard[]>(initialProjects);
  const [activeProject, setActiveProject] = useState<ProjectCard | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const canCreate = useHasPermission("PROJECTS_CREATE");
  const canApprove = useHasPermission("PROJECTS_APPROVE");
  const canEdit = useHasPermission("PROJECTS_EDIT");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragStart = (e: DragStartEvent) => setActiveProject(projects.find((p) => p.id === e.active.id) ?? null);
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveProject(null);
    const { active, over } = e;
    if (!over) return;
    const overCol = columns.find((c) => c.id === String(over.id));
    if (overCol) { setProjects((prev) => prev.map((p) => (p.id === active.id ? { ...p, column: overCol.id } : p))); return; }
    const ap = projects.find((p) => p.id === active.id);
    const op = projects.find((p) => p.id === over.id);
    if (!ap || !op || ap.column !== op.column) return;
    const colProjs = projects.filter((p) => p.column === ap.column);
    const oldIdx = colProjs.findIndex((p) => p.id === active.id);
    const newIdx = colProjs.findIndex((p) => p.id === over.id);
    setProjects((prev) => [...prev.filter((p) => p.column !== ap.column), ...arrayMove(colProjs, oldIdx, newIdx)]);
  };

  const handleApprove = (id: string) => { setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, column: "completed", progress: 100 } : p))); alert("✅ อนุมัติโครงการแล้ว"); };
  const handleReject = (id: string) => { setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, column: "planning" } : p))); alert("❌ ปฏิเสธโครงการ — ส่งกลับไปวางแผน"); };

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) && (!typeFilter || p.type === typeFilter));

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div><h1 className="text-2xl font-semibold text-tu-text-primary">โครงการ</h1><p className="text-tu-text-muted text-sm mt-1">Kanban Board — ลากวาง + อนุมัติ/ปฏิเสธ</p></div>
        {canCreate && <Button><Plus size={18} />สร้างโครงการ</Button>}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="relative max-w-md flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition" /></div>
        <div className="flex gap-1.5 flex-wrap">{[null, "วิชาการ", "หลักสูตร", "สัมมนา", "วิจัย", "IT", "งบประมาณ"].map((t) => (<button key={t ?? "all"} onClick={() => setTypeFilter(t)} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors border", typeFilter === t ? "bg-tu-primary text-white border-tu-primary" : "bg-tu-surface border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover")}>{t ?? "ทั้งหมด"}</button>))}</div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          {columns.map((col) => {
            const colProjects = filtered.filter((p) => p.column === col.id);
            return (
              <div key={col.id} className={cn("bg-tu-bg rounded-[--radius-card] border border-tu-border border-t-2 flex flex-col min-h-[200px] overflow-hidden", col.color)}>
                <div className="px-4 py-3 flex items-center justify-between shrink-0"><h3 className="text-sm font-semibold text-tu-text-primary">{col.label}</h3><Badge variant="outline" className="text-[10px]">{colProjects.length}</Badge></div>
                <SortableContext items={colProjects.map((p) => p.id)}>
                  <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto">
                    {colProjects.map((proj) => (<SortableCard key={proj.id} project={proj} onApprove={handleApprove} onReject={handleReject} canApprove={canApprove} canEdit={canEdit} />))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
        <DragOverlay>{activeProject && (<div className="bg-tu-surface rounded-lg border-2 border-tu-primary p-3 shadow-xl opacity-90 rotate-2 w-64"><h4 className="text-sm font-semibold">{activeProject.name}</h4><p className="text-xs text-tu-text-muted mt-0.5">{activeProject.type} · {activeProject.progress}%</p></div>)}</DragOverlay>
      </DndContext>
    </div>
  );
}
