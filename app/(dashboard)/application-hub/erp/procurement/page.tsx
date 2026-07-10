"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, FileText, Truck, Building2, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ─── Type definitions ─── */
type Vendor = { id: string; taxId: string; companyName: string };
type PrItem = { itemName: string; quantity: number; unitPrice: number };
type PR = { id: string; prNo: string; requesterUserId: string; status: string; totalAmount: number; items: PrItem[]; requester?: { email: string } };
type PO = { id: string; poNo: string; vendorId: string; status: string; items: PrItem[]; vendor?: { companyName: string } };
type GoodsReceipt = { id: string; poId: string; receiptDate: string; po?: { poNo: string } };

/* ─── Helpers ─── */
function formatCurrency(v: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(v);
}
const STATUS_MAP: Record<string, { label: string; color: "secondary" | "warning" | "success" | "destructive" | "info" }> = {
  draft: { label: "ร่าง", color: "secondary" },
  pending: { label: "รออนุมัติ", color: "warning" },
  approved: { label: "อนุมัติแล้ว", color: "success" },
  rejected: { label: "ปฏิเสธ", color: "destructive" },
  ordered: { label: "สั่งซื้อแล้ว", color: "info" },
  received: { label: "รับแล้ว", color: "success" },
};
const statusBadge = (s: string) => {
  const m = STATUS_MAP[s] ?? { label: s, color: "secondary" as const };
  return <Badge variant={m.color}>{m.label}</Badge>;
};

type TabKey = "pr" | "po" | "vendor" | "receipt";
const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "pr", label: "ใบขอซื้อ (PR)", icon: FileText },
  { key: "po", label: "ใบสั่งซื้อ (PO)", icon: ShoppingCart },
  { key: "vendor", label: "ทะเบียนผู้ขาย", icon: Building2 },
  { key: "receipt", label: "ตรวจรับพัสดุ", icon: ClipboardCheck },
];

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pr");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 10;

  /* ─── PR State ─── */
  const [prs, setPrs] = useState<PR[]>([]);
  const [prDialog, setPrDialog] = useState(false);
  const [prEditing, setPrEditing] = useState<PR | null>(null);
  const [prForm, setPrForm] = useState({ prNo: "", requesterUserId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] as PrItem[] });
  const [prDelete, setPrDelete] = useState<PR | null>(null);

  /* ─── PO State ─── */
  const [pos, setPos] = useState<PO[]>([]);
  const [poDialog, setPoDialog] = useState(false);
  const [poForm, setPoForm] = useState({ poNo: "", vendorId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] as PrItem[] });
  const [poDelete, setPoDelete] = useState<PO | null>(null);

  /* ─── Vendor State ─── */
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorDialog, setVendorDialog] = useState(false);
  const [vendorEditing, setVendorEditing] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState({ taxId: "", companyName: "" });
  const [vendorDelete, setVendorDelete] = useState<Vendor | null>(null);

  /* ─── Receipt State ─── */
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(total / LIMIT);

  /* ─── Fetch functions ─── */
  const fetchPRs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/erp/purchase-requests?${params}`);
      const json = await res.json();
      if (json.success) { setPrs(json.data); setTotal(json.meta.total); }
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search]);

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/erp/purchase-orders?${params}`);
      const json = await res.json();
      if (json.success) { setPos(json.data); setTotal(json.meta.total); }
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/erp/vendors?${params}`);
      const json = await res.json();
      if (json.success) { setVendors(json.data); setTotal(json.meta.total); }
    } catch { /* silent */ }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    if (activeTab === "pr") fetchPRs();
    else if (activeTab === "po") fetchPOs();
    else if (activeTab === "vendor") fetchVendors();
  }, [activeTab, fetchPRs, fetchPOs, fetchVendors]);

  const switchTab = (tab: TabKey) => { setActiveTab(tab); setSearch(""); setPage(1); };

  /* ─── PR Handlers ─── */
  const openPrCreate = () => { setPrEditing(null); setPrForm({ prNo: "", requesterUserId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] }); setPrDialog(true); };
  const handlePrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prForm.prNo || !prForm.requesterUserId || prForm.items.some((i) => !i.itemName)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/erp/purchase-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prForm) });
      const json = await res.json();
      if (json.success) { showToast("success", "สร้างใบขอซื้อสำเร็จ"); setPrDialog(false); fetchPRs(); }
      else { showToast("error", json.error?.message ?? "เกิดข้อผิดพลาด"); }
    } catch { showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitting(false);
  };
  const handlePrDelete = async () => {
    if (!prDelete) return;
    const res = await fetch(`/api/erp/purchase-requests?id=${prDelete.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { showToast("success", "ลบใบขอซื้อสำเร็จ"); setPrDelete(null); fetchPRs(); }
  };
  const handlePrStatus = async (id: string, status: string) => {
    const res = await fetch("/api/erp/purchase-requests", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const json = await res.json();
    if (json.success) { showToast("success", "เปลี่ยนสถานะสำเร็จ"); fetchPRs(); }
    else { showToast("error", "ไม่มีสิทธิ์อนุมัติ"); }
  };

  /* ─── PO Handlers ─── */
  const openPoCreate = () => { setPoForm({ poNo: "", vendorId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] }); setPoDialog(true); };
  const handlePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.poNo || !poForm.vendorId || poForm.items.some((i) => !i.itemName)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/erp/purchase-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(poForm) });
      const json = await res.json();
      if (json.success) { showToast("success", "สร้างใบสั่งซื้อสำเร็จ"); setPoDialog(false); fetchPOs(); }
      else { showToast("error", json.error?.message ?? "เกิดข้อผิดพลาด"); }
    } catch { showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitting(false);
  };
  const handlePoDelete = async () => {
    if (!poDelete) return;
    const res = await fetch(`/api/erp/purchase-orders?id=${poDelete.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { showToast("success", "ลบใบสั่งซื้อสำเร็จ"); setPoDelete(null); fetchPOs(); }
  };

  /* ─── Vendor Handlers ─── */
  const openVendorCreate = () => { setVendorEditing(null); setVendorForm({ taxId: "", companyName: "" }); setVendorDialog(true); };
  const openVendorEdit = (v: Vendor) => { setVendorEditing(v); setVendorForm({ taxId: v.taxId, companyName: v.companyName }); setVendorDialog(true); };
  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.taxId || !vendorForm.companyName) return;
    setSubmitting(true);
    try {
      const method = vendorEditing ? "PUT" : "POST";
      const body = vendorEditing ? { id: vendorEditing.id, ...vendorForm } : vendorForm;
      const res = await fetch("/api/erp/vendors", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) { showToast("success", vendorEditing ? "แก้ไขผู้ขายสำเร็จ" : "เพิ่มผู้ขายสำเร็จ"); setVendorDialog(false); fetchVendors(); }
      else { showToast("error", json.error?.message ?? "เกิดข้อผิดพลาด"); }
    } catch { showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์"); }
    setSubmitting(false);
  };
  const handleVendorDelete = async () => {
    if (!vendorDelete) return;
    const res = await fetch(`/api/erp/vendors?id=${vendorDelete.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) { showToast("success", "ลบผู้ขายสำเร็จ"); setVendorDelete(null); fetchVendors(); }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><ShoppingCart size={24} className="text-tu-primary" /> จัดซื้อจัดจ้าง</h1>
          <p className="text-sm text-tu-text-muted">บริหารงานพัสดุและการจัดซื้อจัดจ้าง</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "pr" && <Button onClick={openPrCreate} variant="primary"><Plus size={16} /> ใบขอซื้อ</Button>}
          {activeTab === "po" && <Button onClick={openPoCreate} variant="primary"><Plus size={16} /> ใบสั่งซื้อ</Button>}
          {activeTab === "vendor" && <Button onClick={openVendorCreate} variant="primary"><Plus size={16} /> เพิ่มผู้ขาย</Button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TABS.map((tab) => (
          <Card key={tab.key} className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === tab.key && "ring-2 ring-tu-primary")} onClick={() => switchTab(tab.key)}>
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
              <Input className="pl-9" placeholder="ค้นหา..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            {search && <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setPage(1); }}><X size={16} /></Button>}
          </div>
        </CardContent>
      </Card>

      {/* Content Card */}
      <Card>
        <CardHeader><CardTitle>{TABS.find((t) => t.key === activeTab)?.label} ({total} รายการ)</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-tu-text-muted text-sm">กำลังโหลด...</div>
          ) : (
            <div className="overflow-x-auto">
              {/* ─── PR Table ─── */}
              {activeTab === "pr" && (
                <>
                  {prs.length === 0 ? (
                    <div className="py-12 text-center text-tu-text-muted text-sm">{search ? "ไม่พบข้อมูล" : "ยังไม่มีใบขอซื้อ"}</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-tu-border text-left text-tu-text-muted">
                          <th className="py-3 px-2 font-medium">เลขที่ PR</th>
                          <th className="py-3 px-2 font-medium">ผู้ขอ</th>
                          <th className="py-3 px-2 font-medium">รายการ</th>
                          <th className="py-3 px-2 font-medium text-right">จำนวนเงิน</th>
                          <th className="py-3 px-2 font-medium">สถานะ</th>
                          <th className="py-3 px-2 font-medium text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prs.map((pr) => (
                          <tr key={pr.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                            <td className="py-2.5 px-2 font-mono font-medium">{pr.prNo}</td>
                            <td className="py-2.5 px-2">{pr.requester?.email ?? pr.requesterUserId}</td>
                            <td className="py-2.5 px-2">{pr.items?.map((i) => i.itemName).join(", ") || "-"}</td>
                            <td className="py-2.5 px-2 text-right">{formatCurrency(Number(pr.totalAmount))}</td>
                            <td className="py-2.5 px-2">{statusBadge(pr.status)}</td>
                            <td className="py-2.5 px-2 text-right">
                              <div className="flex justify-end gap-1">
                                {pr.status === "pending" && (
                                  <>
                                    <Button variant="ghost" size="sm" onClick={() => handlePrStatus(pr.id, "approved")} className="text-tu-success text-xs">อนุมัติ</Button>
                                    <Button variant="ghost" size="sm" onClick={() => handlePrStatus(pr.id, "rejected")} className="text-tu-error text-xs">ปฏิเสธ</Button>
                                  </>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => setPrDelete(pr)}><Trash2 size={14} className="text-tu-error" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* ─── PO Table ─── */}
              {activeTab === "po" && (
                <>
                  {pos.length === 0 ? (
                    <div className="py-12 text-center text-tu-text-muted text-sm">{search ? "ไม่พบข้อมูล" : "ยังไม่มีใบสั่งซื้อ"}</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-tu-border text-left text-tu-text-muted">
                          <th className="py-3 px-2 font-medium">เลขที่ PO</th>
                          <th className="py-3 px-2 font-medium">ผู้ขาย</th>
                          <th className="py-3 px-2 font-medium">รายการ</th>
                          <th className="py-3 px-2 font-medium">สถานะ</th>
                          <th className="py-3 px-2 font-medium text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pos.map((po) => (
                          <tr key={po.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                            <td className="py-2.5 px-2 font-mono font-medium">{po.poNo}</td>
                            <td className="py-2.5 px-2">{po.vendor?.companyName ?? po.vendorId}</td>
                            <td className="py-2.5 px-2">{po.items?.map((i) => i.itemName).join(", ") || "-"}</td>
                            <td className="py-2.5 px-2">{statusBadge(po.status)}</td>
                            <td className="py-2.5 px-2 text-right">
                              <Button variant="ghost" size="icon" onClick={() => setPoDelete(po)}><Trash2 size={14} className="text-tu-error" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* ─── Vendor Table ─── */}
              {activeTab === "vendor" && (
                <>
                  {vendors.length === 0 ? (
                    <div className="py-12 text-center text-tu-text-muted text-sm">{search ? "ไม่พบข้อมูล" : "ยังไม่มีผู้ขาย"}</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-tu-border text-left text-tu-text-muted">
                          <th className="py-3 px-2 font-medium">เลขประจำตัวผู้เสียภาษี</th>
                          <th className="py-3 px-2 font-medium">ชื่อบริษัท</th>
                          <th className="py-3 px-2 font-medium text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendors.map((v) => (
                          <tr key={v.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                            <td className="py-2.5 px-2 font-mono">{v.taxId}</td>
                            <td className="py-2.5 px-2">{v.companyName}</td>
                            <td className="py-2.5 px-2 text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openVendorEdit(v)}><Pencil size={14} /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setVendorDelete(v)}><Trash2 size={14} className="text-tu-error" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              )}

              {/* ─── Receipt placeholder ─── */}
              {activeTab === "receipt" && (
                <div className="py-12 text-center">
                  <Truck size={48} className="mx-auto text-tu-text-muted mb-3" />
                  <p className="text-tu-text-muted">ระบบตรวจรับพัสดุ</p>
                  <p className="text-sm text-tu-text-muted mt-1">เชื่อมต่อกับใบสั่งซื้อ (PO) เพื่อบันทึกการรับสินค้า</p>
                  <Button variant="outline" className="mt-4">ตรวจรับจาก PO</Button>
                </div>
              )}
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

      {/* ─── PR Dialog ─── */}
      {prDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPrDialog(false)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-tu-border">
              <h2 className="text-lg font-semibold">สร้างใบขอซื้อ (PR)</h2>
              <Button variant="ghost" size="icon" onClick={() => setPrDialog(false)}><X size={18} /></Button>
            </div>
            <form onSubmit={handlePrSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">เลขที่ PR <span className="text-tu-error">*</span></label>
                <Input value={prForm.prNo} onChange={(e) => setPrForm({ ...prForm, prNo: e.target.value })} placeholder="PR-2568-001" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">รหัสผู้ขอ <span className="text-tu-error">*</span></label>
                <Input value={prForm.requesterUserId} onChange={(e) => setPrForm({ ...prForm, requesterUserId: e.target.value })} placeholder="UUID ของผู้ใช้" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">รายการ <span className="text-tu-error">*</span></label>
                {prForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input className="flex-[2]" value={item.itemName} onChange={(e) => { const items = [...prForm.items]; items[idx].itemName = e.target.value; setPrForm({ ...prForm, items }); }} placeholder="ชื่อรายการ" />
                    <Input className="w-20" type="number" value={item.quantity} onChange={(e) => { const items = [...prForm.items]; items[idx].quantity = Number(e.target.value); setPrForm({ ...prForm, items }); }} placeholder="จำนวน" />
                    <Input className="w-28" type="number" value={item.unitPrice} onChange={(e) => { const items = [...prForm.items]; items[idx].unitPrice = Number(e.target.value); setPrForm({ ...prForm, items }); }} placeholder="ราคา/หน่วย" />
                    {prForm.items.length > 1 && <Button variant="ghost" size="icon" type="button" onClick={() => { const items = prForm.items.filter((_, i) => i !== idx); setPrForm({ ...prForm, items }); }}><X size={14} /></Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" type="button" onClick={() => setPrForm({ ...prForm, items: [...prForm.items, { itemName: "", quantity: 1, unitPrice: 0 }] })}><Plus size={14} /> เพิ่มรายการ</Button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setPrDialog(false)}>ยกเลิก</Button>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PO Dialog ─── */}
      {poDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPoDialog(false)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-tu-border">
              <h2 className="text-lg font-semibold">สร้างใบสั่งซื้อ (PO)</h2>
              <Button variant="ghost" size="icon" onClick={() => setPoDialog(false)}><X size={18} /></Button>
            </div>
            <form onSubmit={handlePoSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">เลขที่ PO <span className="text-tu-error">*</span></label>
                <Input value={poForm.poNo} onChange={(e) => setPoForm({ ...poForm, poNo: e.target.value })} placeholder="PO-2568-001" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">รหัสผู้ขาย <span className="text-tu-error">*</span></label>
                <Input value={poForm.vendorId} onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })} placeholder="UUID ของผู้ขาย" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">รายการ <span className="text-tu-error">*</span></label>
                {poForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input className="flex-[2]" value={item.itemName} onChange={(e) => { const items = [...poForm.items]; items[idx].itemName = e.target.value; setPoForm({ ...poForm, items }); }} placeholder="ชื่อรายการ" />
                    <Input className="w-20" type="number" value={item.quantity} onChange={(e) => { const items = [...poForm.items]; items[idx].quantity = Number(e.target.value); setPoForm({ ...poForm, items }); }} placeholder="จำนวน" />
                    <Input className="w-28" type="number" value={item.unitPrice} onChange={(e) => { const items = [...poForm.items]; items[idx].unitPrice = Number(e.target.value); setPoForm({ ...poForm, items }); }} placeholder="ราคา/หน่วย" />
                    {poForm.items.length > 1 && <Button variant="ghost" size="icon" type="button" onClick={() => { const items = poForm.items.filter((_, i) => i !== idx); setPoForm({ ...poForm, items }); }}><X size={14} /></Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" type="button" onClick={() => setPoForm({ ...poForm, items: [...poForm.items, { itemName: "", quantity: 1, unitPrice: 0 }] })}><Plus size={14} /> เพิ่มรายการ</Button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setPoDialog(false)}>ยกเลิก</Button>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Vendor Dialog ─── */}
      {vendorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setVendorDialog(false)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-tu-border">
              <h2 className="text-lg font-semibold">{vendorEditing ? "แก้ไขผู้ขาย" : "เพิ่มผู้ขาย"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setVendorDialog(false)}><X size={18} /></Button>
            </div>
            <form onSubmit={handleVendorSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">เลขประจำตัวผู้เสียภาษี <span className="text-tu-error">*</span></label>
                <Input value={vendorForm.taxId} onChange={(e) => setVendorForm({ ...vendorForm, taxId: e.target.value })} placeholder="1234567890123" required disabled={!!vendorEditing} />
              </div>
              <div>
                <label className="block text-sm font-medium text-tu-text-secondary mb-1">ชื่อบริษัท <span className="text-tu-error">*</span></label>
                <Input value={vendorForm.companyName} onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })} placeholder="ชื่อบริษัท" required />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setVendorDialog(false)}>ยกเลิก</Button>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "กำลังบันทึก..." : "บันทึก"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PR Delete Confirm ─── */}
      {prDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPrDelete(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-tu-text-muted mb-4">ต้องการลบ <strong>{prDelete.prNo}</strong> ใช่หรือไม่?</p>
            <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setPrDelete(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handlePrDelete}>ลบ</Button></div>
          </div>
        </div>
      )}

      {/* ─── PO Delete Confirm ─── */}
      {poDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPoDelete(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-tu-text-muted mb-4">ต้องการลบ <strong>{poDelete.poNo}</strong> ใช่หรือไม่?</p>
            <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setPoDelete(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handlePoDelete}>ลบ</Button></div>
          </div>
        </div>
      )}

      {/* ─── Vendor Delete Confirm ─── */}
      {vendorDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setVendorDelete(null)}>
          <div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-tu-text-muted mb-4">ต้องการลบ <strong>{vendorDelete.companyName}</strong> ใช่หรือไม่?</p>
            <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setVendorDelete(null)}>ยกเลิก</Button><Button variant="destructive" onClick={handleVendorDelete}>ลบ</Button></div>
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
