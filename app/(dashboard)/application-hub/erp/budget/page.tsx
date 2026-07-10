"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Budget = {
  id: string; budgetCode: string; name: string; fiscalYear: number;
  totalAmount: number; usedAmount: number; status: string; category: string; department?: string;
};

type FormData = {
  budgetCode: string; name: string; fiscalYear: string; totalAmount: string; category: string; department: string;
};

const STATUS_OPTIONS = [
  { value: "active", label: "ใช้งาน", color: "success" as const },
  { value: "closed", label: "ปิดงบ", color: "warning" as const },
  { value: "draft", label: "ร่าง", color: "secondary" as const },
  { value: "pending", label: "รออนุมัติ", color: "info" as const },
];

const CATEGORIES = ["งบบุคลากร", "งบดำเนินงาน", "งบลงทุน", "งบเงินอุดหนุน", "งบรายจ่ายอื่น"];

const INITIAL_FORM: FormData = { budgetCode: "", name: "", fiscalYear: "2568", totalAmount: "", category: "งบดำเนินงาน", department: "" };

function formatCurrency(v: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(v);
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Budget | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const LIMIT = 10;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/erp/budget?${params}`);
      const json = await res.json();
      if (json.success) { setBudgets(json.data); setTotal(json.meta.total); }
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => { setEditing(null); setForm(INITIAL_FORM); setDialogOpen(true); };
  const openEdit = (b: Budget) => {
    setEditing(b);
    setForm({ budgetCode: b.budgetCode, name: b.name, fiscalYear: String(b.fiscalYear), totalAmount: String(b.totalAmount), category: b.category, department: b.department ?? "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.budgetCode || !form.name || !form.fiscalYear || !form.totalAmount) return;
    setSubmitting(true);
    try {
      const url = "/api/erp/budget";
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form, totalAmount: Number(form.totalAmount), fiscalYear: Number(form.fiscalYear) } : { ...form, totalAmount: Number(form.totalAmount), fiscalYear: Number(form.fiscalYear) };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) {
        showToast("success", editing ? "แก้ไขงบประมาณสำเร็จ" : "เพิ่มงบประมาณสำเร็จ");
        setDialogOpen(false); fetchBudgets();
      } else {
        showToast("error", json.error?.message ?? "เกิดข้อผิดพลาด");
      }
    } catch { showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await fetch(`/api/erp/budget?id=${deleteConfirm.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { showToast("success", "ลบงบประมาณสำเร็จ"); setDeleteConfirm(null); fetchBudgets(); }
    } catch { showToast("error", "ไม่สามารถลบข้อมูลได้"); }
  };

  const statusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((x) => x.value === status);
    return <Badge variant={s?.color ?? "secondary"}>{s?.label ?? status}</Badge>;
  };

  const usagePercent = (used: number, total: number) => Math.min(100, Math.round((used / total) * 100));

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2">
            <Calculator size={24} className="text-tu-primary" /> งบประมาณ
          </h1>
          <p className="text-sm text-tu-text-muted">บริหารงบประมาณประจำปีของคณะ</p>
        </div>
        <Button onClick={openCreate} variant="primary"><Plus size={16} /> เพิ่มงบประมาณ</Button>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
              <Input className="pl-9" placeholder="ค้นหาชื่อหรือรหัสงบประมาณ..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {search && (
              <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>รายการงบประมาณ ({total} รายการ)</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-tu-text-muted text-sm">กำลังโหลด...</div>
          ) : budgets.length === 0 ? (
            <div className="py-12 text-center text-tu-text-muted text-sm">
              {search ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีรายการงบประมาณ"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tu-border text-left text-tu-text-muted">
                    <th className="py-3 px-2 font-medium">รหัสงบประมาณ</th>
                    <th className="py-3 px-2 font-medium">ชื่องบประมาณ</th>
                    <th className="py-3 px-2 font-medium">ปีงบ</th>
                    <th className="py-3 px-2 font-medium">หมวดหมู่</th>
                    <th className="py-3 px-2 font-medium text-right">วงเงิน</th>
                    <th className="py-3 px-2 font-medium text-right">ใช้ไป</th>
                    <th className="py-3 px-2 font-medium">การใช้จ่าย</th>
                    <th className="py-3 px-2 font-medium">สถานะ</th>
                    <th className="py-3 px-2 font-medium text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => (
                    <tr key={b.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                      <td className="py-2.5 px-2 font-medium">{b.budgetCode}</td>
                      <td className="py-2.5 px-2">{b.name}</td>
                      <td className="py-2.5 px-2">{b.fiscalYear}</td>
                      <td className="py-2.5 px-2">{b.category}</td>
                      <td className="py-2.5 px-2 text-right">{formatCurrency(Number(b.totalAmount))}</td>
                      <td className="py-2.5 px-2 text-right">{formatCurrency(Number(b.usedAmount))}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-tu-border overflow-hidden max-w-[100px]">
                            <div className={cn("h-full rounded-full transition-all", usagePercent(Number(b.usedAmount), Number(b.totalAmount)) > 90 ? "bg-tu-error" : usagePercent(Number(b.usedAmount), Number(b.totalAmount)) > 70 ? "bg-tu-warning" : "bg-tu-success")} style={{ width: `${usagePercent(Number(b.usedAmount), Number(b.totalAmount))}%` }} />
                          </div>
                          <span className="text-xs text-tu-text-muted w-8">{usagePercent(Number(b.usedAmount), Number(b.totalAmount))}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">{statusBadge(b.status)}</td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(b)} title="แก้ไข"><Pencil size={14} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(b)} title="ลบ"><Trash2 size={14} className="text-tu-error" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-tu-text-muted">หน้า {page} จาก {totalPages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-tu-text-muted">...</span>}
                    <Button variant={p === page ? "primary" : "outline"} size="sm" onClick={() => setPage(p)}>{p}</Button>
                  </span>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogOpen(false)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-tu-border">
              <h2 className="text-lg font-semibold">{editing ? "แก้ไขงบประมาณ" : "เพิ่มงบประมาณ"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">รหัสงบประมาณ <span className="text-tu-error">*</span></label>
                <Input value={form.budgetCode} onChange={(e) => setForm({ ...form, budgetCode: e.target.value })} placeholder="เช่น BGT-2568-001" required disabled={!!editing} />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่องบประมาณ <span className="text-tu-error">*</span></label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่องบประมาณ" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-tu-text-secondary mb-1">ปีงบประมาณ <span className="text-tu-error">*</span></label>
                  <Input value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })} type="number" placeholder="2568" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tu-text-secondary mb-1">วงเงิน <span className="text-tu-error">*</span></label>
                  <Input value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} type="number" placeholder="0.00" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">หมวดหมู่</label>
                <select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface focus:border-tu-border-focus focus:outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">หน่วยงาน</label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="เช่น ฝ่าย IT" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : editing ? "บันทึก" : "เพิ่ม"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-tu-text-muted mb-4">คุณต้องการลบงบประมาณ <strong>{deleteConfirm.budgetCode}</strong> ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>ยกเลิก</Button>
              <Button variant="destructive" onClick={handleDelete}>ลบ</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2 animate-in slide-in-from-right", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
