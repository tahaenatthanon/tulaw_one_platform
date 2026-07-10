"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Wrench, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Asset = {
  id: string; assetNo: string; name: string; purchaseValue: number; status: string;
  depreciations?: { year: number; depreciationAmount: number; netValue: number }[];
  maintenances?: { maintenanceDate: string; cost: number; details: string }[];
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(v);
}

const STATUS_MAP: Record<string, { label: string; color: "success" | "warning" | "destructive" | "info" | "secondary" }> = {
  active: { label: "ใช้งาน", color: "success" },
  maintenance: { label: "ซ่อมบำรุง", color: "warning" },
  disposed: { label: "จำหน่าย", color: "destructive" },
  transferred: { label: "โอน", color: "info" },
  inactive: { label: "ไม่ใช้งาน", color: "secondary" },
};
const statusBadge = (s: string) => {
  const m = STATUS_MAP[s] ?? { label: s, color: "secondary" as const };
  return <Badge variant={m.color}>{m.label}</Badge>;
};

type TabKey = "register" | "depreciation" | "transfer" | "maintenance" | "report";
const TABS = [
  { key: "register" as TabKey, label: "ทะเบียนครุภัณฑ์", icon: Box },
  { key: "depreciation" as TabKey, label: "ค่าเสื่อมราคา", icon: TrendingDown },
  { key: "maintenance" as TabKey, label: "ซ่อมบำรุง", icon: Wrench },
];

export default function AssetPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("register");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 10;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState({ assetNo: "", name: "", purchaseValue: "", status: "active" });
  const [deleteConfirm, setDeleteConfirm] = useState<Asset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/erp/assets?${params}`);
      const json = await res.json();
      if (json.success) { setAssets(json.data); setTotal(json.meta.total); }
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const openCreate = () => { setEditing(null); setForm({ assetNo: "", name: "", purchaseValue: "", status: "active" }); setDialogOpen(true); };
  const openEdit = (a: Asset) => {
    setEditing(a);
    setForm({ assetNo: a.assetNo, name: a.name, purchaseValue: String(a.purchaseValue ?? 0), status: a.status });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetNo || !form.name) return;
    setSubmitting(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form, purchaseValue: Number(form.purchaseValue) } : { ...form, purchaseValue: Number(form.purchaseValue) };
      const res = await fetch("/api/erp/assets", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) { showToast("success", editing ? "แก้ไขครุภัณฑ์สำเร็จ" : "เพิ่มครุภัณฑ์สำเร็จ"); setDialogOpen(false); fetchAssets(); }
      else { showToast("error", json.error?.message ?? "เกิดข้อผิดพลาด"); }
    } catch { showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const res = await fetch(`/api/erp/assets?id=${deleteConfirm.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { showToast("success", "ลบครุภัณฑ์สำเร็จ"); setDeleteConfirm(null); fetchAssets(); }
  };

  const totalAssetValue = assets.reduce((s, a) => s + Number(a.purchaseValue ?? 0), 0);
  const activeAssets = assets.filter((a) => a.status === "active").length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><Box size={24} className="text-tu-primary" /> พัสดุและสินทรัพย์</h1>
          <p className="text-sm text-tu-text-muted">จัดการครุภัณฑ์และสินทรัพย์ของคณะ</p>
        </div>
        <Button onClick={openCreate} variant="primary"><Plus size={16} /> เพิ่มครุภัณฑ์</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">ครุภัณฑ์ทั้งหมด</p><p className="text-xl font-bold">{total} รายการ</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">ใช้งานอยู่</p><p className="text-xl font-bold text-tu-success">{activeAssets} รายการ</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">มูลค่ารวม</p><p className="text-xl font-bold">{formatCurrency(totalAssetValue)}</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TABS.map((tab) => (
          <Card key={tab.key} className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === tab.key && "ring-2 ring-tu-primary")} onClick={() => setActiveTab(tab.key)}>
            <CardContent className="pt-4 text-center">
              <tab.icon size={20} className={cn("mx-auto mb-1", activeTab === tab.key ? "text-tu-primary" : "text-tu-text-muted")} />
              <p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
              <Input className="pl-9" placeholder="ค้นหาชื่อหรือรหัสครุภัณฑ์..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{TABS.find((t) => t.key === activeTab)?.label} ({total} รายการ)</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-tu-text-muted text-sm">กำลังโหลด...</div>
          ) : (
            <>
              {/* Register Tab */}
              {activeTab === "register" && (
                <>
                  {assets.length === 0 ? (
                    <div className="py-12 text-center text-tu-text-muted text-sm">{search ? "ไม่พบข้อมูล" : "ยังไม่มีครุภัณฑ์"}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-tu-border text-left text-tu-text-muted">
                            <th className="py-3 px-2 font-medium">รหัสครุภัณฑ์</th>
                            <th className="py-3 px-2 font-medium">ชื่อ</th>
                            <th className="py-3 px-2 font-medium text-right">มูลค่าซื้อ</th>
                            <th className="py-3 px-2 font-medium">สถานะ</th>
                            <th className="py-3 px-2 font-medium text-right">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assets.map((a) => (
                            <tr key={a.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                              <td className="py-2.5 px-2 font-mono font-medium">{a.assetNo}</td>
                              <td className="py-2.5 px-2">{a.name}</td>
                              <td className="py-2.5 px-2 text-right">{formatCurrency(Number(a.purchaseValue))}</td>
                              <td className="py-2.5 px-2">{statusBadge(a.status)}</td>
                              <td className="py-2.5 px-2 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil size={14} /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(a)}><Trash2 size={14} className="text-tu-error" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Depreciation Tab */}
              {activeTab === "depreciation" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tu-border text-left text-tu-text-muted">
                        <th className="py-3 px-2 font-medium">รหัสครุภัณฑ์</th>
                        <th className="py-3 px-2 font-medium">ชื่อ</th>
                        <th className="py-3 px-2 font-medium text-right">มูลค่าซื้อ</th>
                        <th className="py-3 px-2 font-medium text-right">ค่าเสื่อม/ปี</th>
                        <th className="py-3 px-2 font-medium text-right">มูลค่าสุทธิ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((a) => {
                        const latestDep = a.depreciations?.[0];
                        const annualDep = latestDep ? Number(latestDep.depreciationAmount) : Number(a.purchaseValue ?? 0) * 0.2;
                        const netVal = latestDep ? Number(latestDep.netValue) : Number(a.purchaseValue ?? 0) * 0.8;
                        return (
                          <tr key={a.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                            <td className="py-2.5 px-2 font-mono">{a.assetNo}</td>
                            <td className="py-2.5 px-2">{a.name}</td>
                            <td className="py-2.5 px-2 text-right">{formatCurrency(Number(a.purchaseValue))}</td>
                            <td className="py-2.5 px-2 text-right text-tu-warning">{formatCurrency(annualDep)}</td>
                            <td className="py-2.5 px-2 text-right font-medium">{formatCurrency(netVal)}</td>
                          </tr>
                        );
                      })}
                      {assets.length === 0 && (
                        <tr><td colSpan={5} className="py-12 text-center text-tu-text-muted text-sm">ไม่มีข้อมูลครุภัณฑ์</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Maintenance Tab */}
              {activeTab === "maintenance" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tu-border text-left text-tu-text-muted">
                        <th className="py-3 px-2 font-medium">รหัสครุภัณฑ์</th>
                        <th className="py-3 px-2 font-medium">ชื่อ</th>
                        <th className="py-3 px-2 font-medium">วันที่ซ่อมล่าสุด</th>
                        <th className="py-3 px-2 font-medium text-right">ค่าซ่อม</th>
                        <th className="py-3 px-2 font-medium">รายละเอียด</th>
                        <th className="py-3 px-2 font-medium text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.flatMap((a) =>
                        (a.maintenances?.length ? a.maintenances.slice(0, 1).map((m) => ({ ...m, assetNo: a.assetNo, assetName: a.name, assetId: a.id })) : [])
                      ).length > 0 ? (
                        assets.flatMap((a) =>
                          (a.maintenances?.length ? a.maintenances.slice(0, 1).map((m) => ({ ...m, assetNo: a.assetNo, assetName: a.name, assetId: a.id })) : [])
                        ).map((item) => (
                          <tr key={`${item.assetId}-${item.maintenanceDate}`} className="border-b border-tu-border hover:bg-tu-surface-hover">
                            <td className="py-2.5 px-2 font-mono">{item.assetNo}</td>
                            <td className="py-2.5 px-2">{item.assetName}</td>
                            <td className="py-2.5 px-2">{item.maintenanceDate}</td>
                            <td className="py-2.5 px-2 text-right">{formatCurrency(Number(item.cost))}</td>
                            <td className="py-2.5 px-2 max-w-[200px] truncate">{item.details ?? "-"}</td>
                            <td className="py-2.5 px-2 text-right">
                              <Button variant="ghost" size="sm"><Pencil size={14} /></Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="py-12 text-center text-tu-text-muted text-sm">ไม่มีประวัติการซ่อมบำรุง</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

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
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-tu-border">
              <h2 className="text-lg font-semibold">{editing ? "แก้ไขครุภัณฑ์" : "เพิ่มครุภัณฑ์"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}><X size={18} /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">รหัสครุภัณฑ์ <span className="text-tu-error">*</span></label>
                <Input value={form.assetNo} onChange={(e) => setForm({ ...form, assetNo: e.target.value })} placeholder="AST-001" required disabled={!!editing} />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่อครุภัณฑ์ <span className="text-tu-error">*</span></label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อครุภัณฑ์" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">มูลค่าซื้อ</label>
                <Input value={form.purchaseValue} onChange={(e) => setForm({ ...form, purchaseValue: e.target.value })} type="number" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">สถานะ</label>
                <select className="w-full rounded-[--radius-input] border border-tu-border px-3 py-2 text-sm bg-tu-surface focus:border-tu-border-focus focus:outline-none" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-tu-text-muted mb-4">ต้องการลบ <strong>{deleteConfirm.assetNo} - {deleteConfirm.name}</strong> ใช่หรือไม่?</p>
            <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteConfirm(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handleDelete}>ลบ</Button></div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-6 right-6 z-[60] rounded-[--radius-card] border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
