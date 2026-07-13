"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search, UserPlus, Upload, RefreshCw, Shield, Users,
  GraduationCap, Building2, User, Eye, X, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHasPermission } from "@/hooks/use-permission";

/* ==============================================================================
   Types
   ============================================================================== */

interface UserData {
  id: string; name: string; email: string; role: string;
  department: string; status: "active" | "inactive" | "mfa_pending";
  lastAdSync: string;
}

/* ==============================================================================
   Mock Data (~300 users)
   ============================================================================== */

const DEPARTMENTS = ["สำนักงานคณะ", "ฝ่ายวิชาการ", "ฝ่ายการเงิน", "ฝ่ายเทคโนโลยี", "ฝ่ายวิจัย", "ฝ่ายกิจการนักศึกษา", "ฝ่ายบุคคล"];
const ROLES = ["Super Admin", "System Admin", "Dean", "Dept Admin", "User", "Viewer"];
const STATUSES: UserData["status"][] = ["active", "inactive", "mfa_pending"];

const FIRST_NAMES = ["สมชาย", "สมศรี", "วิชัย", "นภา", "ธนา", "พิมพ์ใจ", "ผู้ดูแล", "สมหมาย", "สมหวัง", "วิไล", "ประภาส", "อารี", "ก้องภพ", "สุนทร", "ภานุมาศ", "จีรนันท์", "เอกชัย", "สุพัตรา", "นฤมล", "ชัยวัฒน์", "รุ่งทิวา", "พงศธร", "มยุรี", "ธนวัฒน์", "กาญจนา"];
const LAST_NAMES = ["ใจดี", "รักเรียน", "มั่นคง", "สดใส", "ปัญญา", "นิติศาสตร์", "ระบบ", "วงศ์วิเศษ", "แก้วดี", "ศรีสุข", "ภัทรปัญญา", "ธรรมนูญ", "เลิศกุล", "สุวรรณ", "วัฒนา", "ศิริโชค", "ฤทธิ์เดช", "นพรัตน์", "ภักดี", "บดินทร", "แสงจันทร์", "นาคา", "ชาญชัย", "มงคล", "ประเสริฐ"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randDate(daysBack: number): string {
  const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().slice(0, 10) + " " + d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

const generateUsers = (count: number): UserData[] => {
  const users: UserData[] = [];
  const usedNames = new Set<string>();
  for (let i = 0; i < count; i++) {
    let name: string;
    do { name = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`; } while (usedNames.has(name));
    usedNames.add(name);
    const englishName = name.replace(/ /g, ".").toLowerCase();
    const role = ROLES[i % 6];
    const status = i === 0 ? "active" : i === 1 ? "active" : i === 2 ? "active" : i % 7 === 0 ? "inactive" : i % 11 === 0 ? "mfa_pending" : "active";
    users.push({
      id: String(i + 1),
      name,
      email: `${englishName}@tulaw.ac.th`,
      role,
      department: rand(DEPARTMENTS),
      status: status as UserData["status"],
      lastAdSync: randDate(7),
    });
  }
  return users;
};

const MOCK_USERS = generateUsers(315);

/* ==============================================================================
   Role Stats Config
   ============================================================================== */

const ROLE_STATS = [
  { role: "Super Admin", label: "Super Admin", icon: Shield, color: "text-tu-primary", bg: "bg-tu-primary-soft" },
  { role: "System Admin", label: "System Admin", icon: Users, color: "text-tu-info", bg: "bg-tu-info/10" },
  { role: "Dean", label: "Dean", icon: GraduationCap, color: "text-tu-success", bg: "bg-tu-success/10" },
  { role: "Dept Admin", label: "Dept Admin", icon: Building2, color: "text-tu-secondary-active", bg: "bg-tu-secondary-soft" },
  { role: "User", label: "User", icon: User, color: "text-tu-warning", bg: "bg-tu-warning/10" },
  { role: "Viewer", label: "Viewer", icon: Eye, color: "text-tu-text-muted", bg: "bg-tu-bg" },
];

/* ==============================================================================
   Add User Dialog
   ============================================================================== */

function AddUserDialog({ open, onClose, onAdd }: {
  open: boolean; onClose: () => void; onAdd: (u: Omit<UserData, "id" | "lastAdSync">) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [status, setStatus] = useState<UserData["status"]>("active");

  const handle = () => {
    if (!name.trim() || !email.trim()) return;
    onAdd({ name: name.trim(), email: email.trim(), role, department: dept, status });
    setName(""); setEmail(""); setRole("User"); setDept(DEPARTMENTS[0]); setStatus("active");
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-tu-text-primary">เพิ่มผู้ใช้งาน</h2><button onClick={onClose} className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover"><X size={18} /></button></div>
        <div className="space-y-4">
          <div><label className="block text-xs font-medium text-tu-text-secondary mb-1.5">ชื่อ-นามสกุล <span className="text-tu-error">*</span></label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อ นามสกุล" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          <div><label className="block text-xs font-medium text-tu-text-secondary mb-1.5">อีเมล <span className="text-tu-error">*</span></label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@tulaw.ac.th" className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20" /></div>
          <div><label className="block text-xs font-medium text-tu-text-secondary mb-1.5">บทบาท</label><select value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20">{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-tu-text-secondary mb-1.5">หน่วยงาน</label><select value={dept} onChange={e => setDept(e.target.value)} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20">{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-tu-text-secondary mb-1.5">สถานะ</label><select value={status} onChange={e => setStatus(e.target.value as UserData["status"])} className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20">{STATUSES.map(s => <option key={s} value={s}>{s === "active" ? "Active" : s === "inactive" ? "Inactive" : "MFA Pending"}</option>)}</select></div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={handle} disabled={!name.trim() || !email.trim()} className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">เพิ่มผู้ใช้งาน</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   CSV Import Dialog
   ============================================================================== */

function ImportDialog({ open, onClose, onImport }: {
  open: boolean; onClose: () => void; onImport: () => void;
}) {
  const [file, setFile] = useState<string | null>(null);
  const fileRef = useState<HTMLInputElement | null>(null);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold text-tu-text-primary">นำเข้าจาก CSV</h2><button onClick={onClose} className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover"><X size={18} /></button></div>
        <div className="space-y-4">
          <p className="text-sm text-tu-text-secondary">อัปโหลดไฟล์ CSV ที่มีคอลัมน์: Name, Email, Role, Department, Status</p>
          <div className="border-2 border-dashed border-tu-border rounded-lg p-8 text-center hover:border-tu-primary transition-colors cursor-pointer">
            <Upload size={32} className="mx-auto mb-2 text-tu-text-muted" />
            <p className="text-sm text-tu-text-secondary">{file ?? "ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์ CSV"}</p>
            <input type="file" accept=".csv" className="hidden" onChange={e => { setFile(e.target.files?.[0]?.name ?? null); }} />
          </div>
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button onClick={onClose} className="rounded-[--radius-btn] border border-tu-border px-4 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors">ยกเลิก</button>
          <button onClick={() => { onImport(); onClose(); }} disabled={!file} className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">นำเข้า</button>
        </div>
      </div>
    </div>
  );
}

/* ==============================================================================
   Main Page
   ============================================================================== */

export default function UserManagementPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const canCreate = useHasPermission("USERS_CREATE");
  const canImport = useHasPermission("USERS_BULK_IMPORT");
  const canAdSync = useHasPermission("USERS_AD_SYNC");

  const handleAdSync = async () => { setSyncing(true); await new Promise(r => setTimeout(r, 2000)); setSyncing(false); };

  const filtered = users.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || u.role === roleFilter) &&
    (statusFilter === "all" || u.status === statusFilter)
  );

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ROLES.forEach(r => counts[r] = users.filter(u => u.role === r).length);
    return counts;
  }, [users]);

  const handleAdd = (u: Omit<UserData, "id" | "lastAdSync">) => {
    const now = new Date();
    const np: UserData = {
      ...u, id: String(users.length + 1),
      lastAdSync: now.toISOString().slice(0, 10) + " " + now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
    };
    setUsers(prev => [np, ...prev]);
  };

  const handleImport = () => {
    const newUsers = Array.from({ length: 10 }, (_, i) => generateUsers(1)[0]);
    setUsers(prev => [...newUsers, ...prev]);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-xl font-semibold text-tu-text-primary">Users & Roles</h1><p className="text-tu-text-muted text-sm mt-1">จัดการผู้ใช้งาน — {users.length} บัญชี</p></div>
        <div className="flex items-center gap-2">
          {canImport && <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 rounded-[--radius-btn] border border-tu-border px-3 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"><Upload size={16} />Import CSV</button>}
          {canAdSync && <button onClick={handleAdSync} disabled={syncing} className="flex items-center gap-1.5 rounded-[--radius-btn] border border-tu-border px-3 py-2 text-sm font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors disabled:opacity-50"><RefreshCw size={16} className={syncing ? "animate-spin" : ""} />{syncing ? "กำลังซิงค์..." : "AD Sync"}</button>}
          {canCreate && <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors"><UserPlus size={16} />เพิ่มผู้ใช้งาน</button>}
        </div>
      </div>

      {/* AD Sync note */}
      <p className="text-xs text-tu-text-muted flex items-center gap-1.5"><RefreshCw size={12} />AD Sync อัตโนมัติทุก 15 นาที — ซิงค์ล่าสุด: {users[0]?.lastAdSync ?? "-"}</p>

      {/* Role Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ROLE_STATS.map(s => (
          <div key={s.role} className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-3">
            <div className="flex items-center gap-2 mb-1"><div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", s.bg)}><s.icon size={14} className={s.color} /></div><span className="text-xs font-medium text-tu-text-muted">{s.label}</span></div>
            <p className="text-xl font-bold text-tu-text-primary tabular-nums">{roleCounts[s.role] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาผู้ใช้งาน..." className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 transition" /></div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20">
          <option value="">ทุกบทบาท</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="flex gap-1 bg-tu-surface border border-tu-border rounded-lg p-0.5">
          {[{ v: "all", l: "ทั้งหมด" }, { v: "active", l: "Active" }, { v: "inactive", l: "Inactive" }, { v: "mfa_pending", l: "MFA Pending" }].map(f => (
            <button key={f.v} onClick={() => setStatusFilter(f.v)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors", statusFilter === f.v ? "bg-tu-primary text-white shadow-sm" : "text-tu-text-secondary hover:text-tu-text-primary")}>{f.l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-auto">
        <table className="w-full min-w-[700px]">
          <thead><tr className="bg-tu-bg border-b border-tu-border text-left"><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ชื่อ-นามสกุล</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">อีเมล</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">บทบาท</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden lg:table-cell">หน่วยงาน</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">สถานะ</th><th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden xl:table-cell">ล่าสุด AD</th></tr></thead>
          <tbody className="divide-y divide-tu-border">
            {filtered.slice(0, 100).map(user => (
              <tr key={user.id} className="hover:bg-tu-surface-hover transition-colors">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-tu-primary-soft text-tu-primary text-[10px] font-semibold">{user.name.charAt(0)}</div><span className="text-sm font-medium text-tu-text-primary">{user.name}</span></div></td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary">{user.email}</td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-tu-secondary-soft text-tu-text-primary font-medium">{user.role}</span></td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden lg:table-cell">{user.department}</td>
                <td className="px-4 py-3"><span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", user.status === "active" ? "bg-tu-success/10 text-tu-success border-tu-success/20" : user.status === "mfa_pending" ? "bg-tu-warning/10 text-tu-warning border-tu-warning/20" : "bg-tu-text-muted/10 text-tu-text-muted border-tu-text-muted/20")}>{user.status === "active" ? "Active" : user.status === "mfa_pending" ? "MFA Pending" : "Inactive"}</span></td>
                <td className="px-4 py-3 text-xs text-tu-text-muted hidden xl:table-cell">{user.lastAdSync}</td>
              </tr>
            ))}
            {filtered.length > 100 && <tr><td colSpan={6} className="px-4 py-3 text-center text-xs text-tu-text-muted">แสดง 100 จาก {filtered.length} รายการ — ใช้ค้นหาเพื่อกรอง</td></tr>}
          </tbody>
        </table>
      </div>

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
    </div>
  );
}
