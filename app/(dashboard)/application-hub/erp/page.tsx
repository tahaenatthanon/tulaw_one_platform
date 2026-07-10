"use client";

import { useState, useEffect, useCallback } from "react";
import { Calculator, DollarSign, ShoppingCart, Box, FileBarChart, Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, FileText, Truck, Building2, ClipboardCheck, Wrench, TrendingDown as Depreciation, Download, Printer, BadgeCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useActionPermissions } from "@/hooks/use-action-permissions";

/* ─── Types ─── */
type Budget = { id: string; budgetCode: string; name: string; fiscalYear: number; totalAmount: number; usedAmount: number; status: string; category: string; department?: string };
type PR = { id: string; prNo: string; requesterUserId: string; status: string; totalAmount: number; items: { itemName: string; quantity: number; unitPrice: number }[]; requester?: { email: string } };
type PO = { id: string; poNo: string; vendorId: string; status: string; items: { itemName: string; quantity: number; unitPrice: number }[]; vendor?: { companyName: string } };
type Vendor = { id: string; taxId: string; companyName: string };
type Asset = { id: string; assetNo: string; name: string; purchaseValue: number; status: string };
type ErpStats = { totalVendors: number; totalPR: number; totalPO: number; totalAssets: number; totalBudgets: number; pendingPR: number; totalBudgetAmount: number; totalAssetValue: number; recentPR: { prNo: string; status: string; totalAmount: number }[] };

/* ─── Helpers ─── */
function fmt(n: number) { return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(n); }
const usagePct = (used: number, total: number) => Math.min(100, Math.round((used / total) * 100));

const STATUS: Record<string, { label: string; color: "secondary" | "warning" | "success" | "destructive" | "info" }> = {
  draft: { label: "ร่าง", color: "secondary" }, pending: { label: "รออนุมัติ", color: "warning" }, approved: { label: "อนุมัติแล้ว", color: "success" }, rejected: { label: "ปฏิเสธ", color: "destructive" }, ordered: { label: "สั่งซื้อแล้ว", color: "info" }, received: { label: "รับแล้ว", color: "success" },
  active: { label: "ใช้งาน", color: "success" }, closed: { label: "ปิดงบ", color: "warning" }, inactive: { label: "ไม่ใช้งาน", color: "secondary" },
};
const sb = (s: string) => { const m = STATUS[s] ?? { label: s, color: "secondary" as const }; return <Badge variant={m.color}>{m.label}</Badge>; };
const CATEGORIES = ["งบบุคลากร", "งบดำเนินงาน", "งบลงทุน", "งบเงินอุดหนุน", "งบรายจ่ายอื่น"];

const ERP_TABS = [
  { id: "budget", label: "งบประมาณ", icon: Calculator },
  { id: "procurement", label: "จัดซื้อจัดจ้าง", icon: ShoppingCart },
  { id: "asset", label: "พัสดุ", icon: Box },
  { id: "finance", label: "การเงิน", icon: DollarSign },
  { id: "reports", label: "รายงาน", icon: FileBarChart },
];

const PROC_TABS = [
  { key: "pr", label: "ใบขอซื้อ (PR)", icon: FileText },
  { key: "po", label: "ใบสั่งซื้อ (PO)", icon: ShoppingCart },
  { key: "vendor", label: "ทะเบียนผู้ขาย", icon: Building2 },
];

const ASSET_TABS = [
  { key: "register", label: "ทะเบียน", icon: Box },
  { key: "depreciation", label: "ค่าเสื่อม", icon: Depreciation },
  { key: "maintenance", label: "ซ่อมบำรุง", icon: Wrench },
];

const FINANCE_TABS = [
  { key: "gl", label: "บัญชีแยกประเภท" }, { key: "trial", label: "งบทดลอง" },
  { key: "income", label: "กำไรขาดทุน" }, { key: "balance", label: "งบดุล" }, { key: "check", label: "ทะเบียนเช็ค" },
];

const MOCK_GL = [
  { id: "1", date: "2026-07-01", description: "รับเงินงบประมาณประจำปี", code: "1101-01", debit: 5000000, credit: 0, balance: 5000000, cat: "เงินงบประมาณ", type: "income" as const },
  { id: "2", date: "2026-07-03", description: "ค่าจ้างบุคลากร", code: "5101-01", debit: 0, credit: 85000, balance: 4915000, cat: "ค่าจ้าง", type: "expense" as const },
  { id: "3", date: "2026-07-05", description: "ค่าเช่าห้องประชุม", code: "5102-02", debit: 0, credit: 15000, balance: 4900000, cat: "ค่าเช่า", type: "expense" as const },
  { id: "4", date: "2026-07-10", description: "ค่าวัสดุสำนักงาน", code: "5103-01", debit: 0, credit: 32500, balance: 4867500, cat: "วัสดุ", type: "expense" as const },
  { id: "5", date: "2026-07-15", description: "ค่าไฟฟ้า", code: "5105-01", debit: 0, credit: 68000, balance: 4799500, cat: "สาธารณูปโภค", type: "expense" as const },
  { id: "6", date: "2026-07-16", description: "ค่าน้ำประปา", code: "5105-02", debit: 0, credit: 12500, balance: 4787000, cat: "สาธารณูปโภค", type: "expense" as const },
];

export default function ErpPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("budget");

  /* ─── Budget state ─── */
  const [budgets, setBudgets] = useState<Budget[]>([]); const [bTotal, setBTotal] = useState(0); const [bPage, setBPage] = useState(1); const [bSearch, setBSearch] = useState(""); const [bLoading, setBLoading] = useState(false);
  const [bDialog, setBDialog] = useState(false); const [bEdit, setBEdit] = useState<Budget | null>(null);
  const [bForm, setBForm] = useState({ budgetCode: "", name: "", fiscalYear: "2568", totalAmount: "", category: "งบดำเนินงาน", department: "" });
  const [bDel, setBDel] = useState<Budget | null>(null);
  const L = 10;

  /* ─── Procurement state ─── */
  const [pTab, setPTab] = useState("pr");
  const [prs, setPrs] = useState<PR[]>([]); const [pos, setPos] = useState<PO[]>([]); const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pTotal, setPTotal] = useState(0); const [pPage, setPPage] = useState(1); const [pSearch, setPSearch] = useState(""); const [pLoading, setPLoading] = useState(false);
  const [prDialog, setPrDialog] = useState(false); const [prForm, setPrForm] = useState({ prNo: "", requesterUserId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] as { itemName: string; quantity: number; unitPrice: number }[] });
  const [prDel, setPrDel] = useState<PR | null>(null);
  const [poDialog, setPoDialog] = useState(false); const [poForm, setPoForm] = useState({ poNo: "", vendorId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] as { itemName: string; quantity: number; unitPrice: number }[] });
  const [poDel, setPoDel] = useState<PO | null>(null);
  const [vDialog, setVDialog] = useState(false); const [vEdit, setVEdit] = useState<Vendor | null>(null);
  const [vForm, setVForm] = useState({ taxId: "", companyName: "" }); const [vDel, setVDel] = useState<Vendor | null>(null);

  /* ─── Asset state ─── */
  const [assets, setAssets] = useState<Asset[]>([]); const [aTotal, setATotal] = useState(0); const [aPage, setAPage] = useState(1); const [aSearch, setASearch] = useState(""); const [aLoading, setALoading] = useState(false);
  const [aTab, setATab] = useState("register");
  const [aDialog, setADialog] = useState(false); const [aEdit, setAEdit] = useState<Asset | null>(null);
  const [aForm, setAForm] = useState({ assetNo: "", name: "", purchaseValue: "", status: "active" });
  const [aDel, setADel] = useState<Asset | null>(null);

  /* ─── Reports state ─── */
  const [stats, setStats] = useState<ErpStats | null>(null); const [rLoading, setRLoading] = useState(false);

  /* ─── Finance state ─── */
  const [fTab, setFTab] = useState("gl"); const [fSearch, setFSearch] = useState("");

  /* ─── Toast ─── */
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const toast_ = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3000); };
  const [sub, setSub] = useState(false);

  /* ====== Budget fetchers ====== */
  const fB = useCallback(async () => { setBLoading(true); try { const p = new URLSearchParams({ page: String(bPage), limit: String(L) }); if (bSearch) p.set("search", bSearch); const r = await fetch(`/api/erp/budget?${p}`); const j = await r.json(); if (j.success) { setBudgets(j.data); setBTotal(j.meta.total); } } catch { /* */ } setBLoading(false); }, [bPage, bSearch]);
  useEffect(() => { if (activeTab === "budget") fB(); }, [activeTab, fB]);

  /* ====== Procurement fetchers ====== */
  const fPR = useCallback(async () => { setPLoading(true); try { const p = new URLSearchParams({ page: String(pPage), limit: String(L) }); if (pSearch) p.set("search", pSearch); const r = await fetch(`/api/erp/purchase-requests?${p}`); const j = await r.json(); if (j.success) { setPrs(j.data); setPTotal(j.meta.total); } } catch { /* */ } setPLoading(false); }, [pPage, pSearch]);
  const fPO = useCallback(async () => { setPLoading(true); try { const p = new URLSearchParams({ page: String(pPage), limit: String(L) }); if (pSearch) p.set("search", pSearch); const r = await fetch(`/api/erp/purchase-orders?${p}`); const j = await r.json(); if (j.success) { setPos(j.data); setPTotal(j.meta.total); } } catch { /* */ } setPLoading(false); }, [pPage, pSearch]);
  const fV = useCallback(async () => { setPLoading(true); try { const p = new URLSearchParams({ page: String(pPage), limit: String(L) }); if (pSearch) p.set("search", pSearch); const r = await fetch(`/api/erp/vendors?${p}`); const j = await r.json(); if (j.success) { setVendors(j.data); setPTotal(j.meta.total); } } catch { /* */ } setPLoading(false); }, [pPage, pSearch]);
  useEffect(() => { if (activeTab === "procurement") { if (pTab === "pr") fPR(); else if (pTab === "po") fPO(); else if (pTab === "vendor") fV(); } }, [activeTab, pTab, fPR, fPO, fV]);

  /* ====== Asset fetchers ====== */
  const fA = useCallback(async () => { setALoading(true); try { const p = new URLSearchParams({ page: String(aPage), limit: String(L) }); if (aSearch) p.set("search", aSearch); const r = await fetch(`/api/erp/assets?${p}`); const j = await r.json(); if (j.success) { setAssets(j.data); setATotal(j.meta.total); } } catch { /* */ } setALoading(false); }, [aPage, aSearch]);
  useEffect(() => { if (activeTab === "asset") fA(); }, [activeTab, fA]);

  /* ====== Reports ====== */
  useEffect(() => { if (activeTab === "reports") { setRLoading(true); fetch("/api/erp/stats").then(r => r.json()).then(j => { if (j.success) setStats(j.data); }).catch(() => {}).finally(() => setRLoading(false)); } }, [activeTab]);

  /* ====== Budget actions ====== */
  const bSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!bForm.budgetCode || !bForm.name || !bForm.totalAmount) return; setSub(true); try { const m = bEdit ? "PUT" : "POST"; const body = bEdit ? { id: bEdit.id, ...bForm, totalAmount: Number(bForm.totalAmount), fiscalYear: Number(bForm.fiscalYear) } : { ...bForm, totalAmount: Number(bForm.totalAmount), fiscalYear: Number(bForm.fiscalYear) }; const r = await fetch("/api/erp/budget", { method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const j = await r.json(); if (j.success) { toast_("success", bEdit ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ"); setBDialog(false); fB(); } } catch { toast_("error", "เกิดข้อผิดพลาด"); } setSub(false); };
  const bDelFn = async () => { if (!bDel) return; await fetch(`/api/erp/budget?id=${bDel.id}`, { method: "DELETE" }); toast_("success", "ลบสำเร็จ"); setBDel(null); fB(); };

  /* ====== Procurement actions ====== */
  const prSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!prForm.prNo || !prForm.requesterUserId || prForm.items.some(i => !i.itemName)) return; setSub(true); try { const r = await fetch("/api/erp/purchase-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prForm) }); const j = await r.json(); if (j.success) { toast_("success", "สร้าง PR สำเร็จ"); setPrDialog(false); fPR(); } } catch { toast_("error", "เกิดข้อผิดพลาด"); } setSub(false); };
  const poSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!poForm.poNo || !poForm.vendorId || poForm.items.some(i => !i.itemName)) return; setSub(true); try { const r = await fetch("/api/erp/purchase-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(poForm) }); const j = await r.json(); if (j.success) { toast_("success", "สร้าง PO สำเร็จ"); setPoDialog(false); fPO(); } } catch { toast_("error", "เกิดข้อผิดพลาด"); } setSub(false); };
  const vSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!vForm.taxId || !vForm.companyName) return; setSub(true); try { const m = vEdit ? "PUT" : "POST"; const body = vEdit ? { id: vEdit.id, ...vForm } : vForm; const r = await fetch("/api/erp/vendors", { method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const j = await r.json(); if (j.success) { toast_("success", vEdit ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ"); setVDialog(false); fV(); } } catch { toast_("error", "เกิดข้อผิดพลาด"); } setSub(false); };
  const prStatus = async (id: string, status: string) => { await fetch("/api/erp/purchase-requests", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); fPR(); };

  /* ====== Asset actions ====== */
  const aSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!aForm.assetNo || !aForm.name) return; setSub(true); try { const m = aEdit ? "PUT" : "POST"; const body = aEdit ? { id: aEdit.id, ...aForm, purchaseValue: Number(aForm.purchaseValue) } : { ...aForm, purchaseValue: Number(aForm.purchaseValue) }; const r = await fetch("/api/erp/assets", { method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const j = await r.json(); if (j.success) { toast_("success", aEdit ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ"); setADialog(false); fA(); } } catch { toast_("error", "เกิดข้อผิดพลาด"); } setSub(false); };
  const aDelFn = async () => { if (!aDel) return; await fetch(`/api/erp/assets?id=${aDel.id}`, { method: "DELETE" }); toast_("success", "ลบสำเร็จ"); setADel(null); fA(); };

  const pTotalPages = Math.ceil(pTotal / L); const bTotalPages = Math.ceil(bTotal / L); const aTotalPages = Math.ceil(aTotal / L);
  const totalDebit = MOCK_GL.reduce((s, d) => s + d.debit, 0);
  const totalCredit = MOCK_GL.reduce((s, d) => s + d.credit, 0);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><Calculator size={24} className="text-tu-primary" /> ERP — ระบบบริหารทรัพยากรองค์กร</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ERP_TABS.map((tab) => (
          <Card key={tab.id} className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === tab.id && "ring-2 ring-tu-primary")} onClick={() => setActiveTab(tab.id)}>
            <CardContent className="pt-4 text-center">
              <tab.icon size={20} className={cn("mx-auto mb-1", activeTab === tab.id ? "text-tu-primary" : "text-tu-text-muted")} />
              <p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ BUDGET ═══ */}
      {activeTab === "budget" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">งบประมาณ ({bTotal} รายการ)</h2>
            <div className="flex gap-2">
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9 w-44" placeholder="ค้นหา..." value={bSearch} onChange={(e) => { setBSearch(e.target.value); setBPage(1); }} /></div>
              {perm.erp.createEditDelete && <Button onClick={() => { setBEdit(null); setBForm({ budgetCode: "", name: "", fiscalYear: "2568", totalAmount: "", category: "งบดำเนินงาน", department: "" }); setBDialog(true); }} variant="primary"><Plus size={16} /> เพิ่ม</Button>}
            </div>
          </div>
          <Card><CardContent className="pt-4">
            {bLoading ? <div className="py-12 text-center text-tu-text-muted text-sm">กำลังโหลด...</div> : budgets.length === 0 ? <div className="py-12 text-center text-tu-text-muted text-sm">ไม่มีงบประมาณ</div> : (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">รหัส</th><th className="py-3 px-2">ชื่อ</th><th className="py-3 px-2">ปี</th><th className="py-3 px-2">หมวด</th><th className="py-3 px-2 text-right">วงเงิน</th><th className="py-3 px-2 text-right">ใช้ไป</th><th className="py-3 px-2">ใช้%</th><th className="py-3 px-2">สถานะ</th><th className="py-3 px-2 text-right">จัดการ</th></tr></thead><tbody>{budgets.map(b => (<tr key={b.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-mono font-medium">{b.budgetCode}</td><td className="py-2.5 px-2">{b.name}</td><td className="py-2.5 px-2">{b.fiscalYear}</td><td className="py-2.5 px-2">{b.category}</td><td className="py-2.5 px-2 text-right">{fmt(Number(b.totalAmount))}</td><td className="py-2.5 px-2 text-right">{fmt(Number(b.usedAmount))}</td><td className="py-2.5 px-2"><div className="flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-tu-border overflow-hidden max-w-[60px]"><div className={cn("h-full rounded-full", usagePct(Number(b.usedAmount), Number(b.totalAmount)) > 90 ? "bg-tu-error" : usagePct(Number(b.usedAmount), Number(b.totalAmount)) > 70 ? "bg-tu-warning" : "bg-tu-success")} style={{ width: `${usagePct(Number(b.usedAmount), Number(b.totalAmount))}%` }} /></div><span className="text-xs">{usagePct(Number(b.usedAmount), Number(b.totalAmount))}%</span></div></td><td className="py-2.5 px-2">{sb(b.status)}</td><td className="py-2.5 px-2 text-right">{perm.erp.createEditDelete ? <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => { setBEdit(b); setBForm({ budgetCode: b.budgetCode, name: b.name, fiscalYear: String(b.fiscalYear), totalAmount: String(b.totalAmount), category: b.category, department: b.department ?? "" }); setBDialog(true); }}><Pencil size={14} /></Button><Button variant="ghost" size="icon" onClick={() => setBDel(b)}><Trash2 size={14} className="text-tu-error" /></Button></div> : null}</td></tr>))}</tbody></table></div>
            )}
            {bTotalPages > 1 && <div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {bPage} จาก {bTotalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={bPage <= 1} onClick={() => setBPage(bPage - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={bPage >= bTotalPages} onClick={() => setBPage(bPage + 1)}><ChevronRight size={14} /></Button></div></div>}
          </CardContent></Card>
        </>
      )}

      {/* ═══ PROCUREMENT ═══ */}
      {activeTab === "procurement" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PROC_TABS.map((tab) => (
              <Card key={tab.key} className={cn("cursor-pointer hover:shadow-md transition-shadow", pTab === tab.key && "ring-2 ring-tu-primary")} onClick={() => setPTab(tab.key)}>
                <CardContent className="pt-4 text-center"><tab.icon size={20} className={cn("mx-auto mb-1", pTab === tab.key ? "text-tu-primary" : "text-tu-text-muted")} /><p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p></CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">{PROC_TABS.find(t => t.key === pTab)?.label} ({pTotal} รายการ)</h2>
            <div className="flex gap-2">
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9 w-44" placeholder="ค้นหา..." value={pSearch} onChange={(e) => { setPSearch(e.target.value); setPPage(1); }} /></div>
              {perm.erp.createEditDelete && <Button onClick={() => { if (pTab === "pr") { setPrForm({ prNo: "", requesterUserId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] }); setPrDialog(true); } else if (pTab === "po") { setPoForm({ poNo: "", vendorId: "", items: [{ itemName: "", quantity: 1, unitPrice: 0 }] }); setPoDialog(true); } else { setVEdit(null); setVForm({ taxId: "", companyName: "" }); setVDialog(true); } }} variant="primary"><Plus size={16} /> เพิ่ม</Button>}
            </div>
          </div>
          <Card><CardContent className="pt-4">
            {pLoading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : (
              <div className="overflow-x-auto">
                {pTab === "pr" && (prs.length === 0 ? <div className="py-12 text-center text-tu-text-muted">ไม่มีใบขอซื้อ</div> : <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">เลขที่ PR</th><th className="py-3 px-2">ผู้ขอ</th><th className="py-3 px-2">รายการ</th><th className="py-3 px-2 text-right">จำนวนเงิน</th><th className="py-3 px-2">สถานะ</th>{(perm.erp.approve || perm.erp.createEditDelete) && <th className="py-3 px-2 text-right">จัดการ</th>}</tr></thead><tbody>{prs.map(pr => (<tr key={pr.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-mono font-medium">{pr.prNo}</td><td className="py-2.5 px-2">{pr.requester?.email ?? pr.requesterUserId}</td><td className="py-2.5 px-2">{pr.items?.map(i => i.itemName).join(", ")}</td><td className="py-2.5 px-2 text-right">{fmt(Number(pr.totalAmount))}</td><td className="py-2.5 px-2">{sb(pr.status)}</td>{(perm.erp.approve || perm.erp.createEditDelete) && <td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1">{perm.erp.approve && pr.status === "pending" && <><Button variant="ghost" size="sm" onClick={() => prStatus(pr.id, "approved")} className="text-tu-success text-xs">อนุมัติ</Button><Button variant="ghost" size="sm" onClick={() => prStatus(pr.id, "rejected")} className="text-tu-error text-xs">ปฏิเสธ</Button></>}{perm.erp.createEditDelete && <Button variant="ghost" size="icon" onClick={() => setPrDel(pr)}><Trash2 size={14} className="text-tu-error" /></Button>}</div></td>}</tr>))}</tbody></table>)}
                {pTab === "po" && (pos.length === 0 ? <div className="py-12 text-center text-tu-text-muted">ไม่มีใบสั่งซื้อ</div> : <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">เลขที่ PO</th><th className="py-3 px-2">ผู้ขาย</th><th className="py-3 px-2">รายการ</th><th className="py-3 px-2">สถานะ</th>{perm.erp.createEditDelete && <th className="py-3 px-2 text-right">จัดการ</th>}</tr></thead><tbody>{pos.map(po => (<tr key={po.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-mono font-medium">{po.poNo}</td><td className="py-2.5 px-2">{po.vendor?.companyName ?? po.vendorId}</td><td className="py-2.5 px-2">{po.items?.map(i => i.itemName).join(", ")}</td><td className="py-2.5 px-2">{sb(po.status)}</td>{perm.erp.createEditDelete && <td className="py-2.5 px-2 text-right"><Button variant="ghost" size="icon" onClick={() => setPoDel(po)}><Trash2 size={14} className="text-tu-error" /></Button></td>}</tr>))}</tbody></table>)}
                {pTab === "vendor" && (vendors.length === 0 ? <div className="py-12 text-center text-tu-text-muted">ไม่มีผู้ขาย</div> : <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">เลขประจำตัวผู้เสียภาษี</th><th className="py-3 px-2">ชื่อบริษัท</th>{perm.erp.createEditDelete && <th className="py-3 px-2 text-right">จัดการ</th>}</tr></thead><tbody>{vendors.map(v => (<tr key={v.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-mono">{v.taxId}</td><td className="py-2.5 px-2">{v.companyName}</td>{perm.erp.createEditDelete && <td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => { setVEdit(v); setVForm({ taxId: v.taxId, companyName: v.companyName }); setVDialog(true); }}><Pencil size={14} /></Button><Button variant="ghost" size="icon" onClick={() => setVDel(v)}><Trash2 size={14} className="text-tu-error" /></Button></div></td>}</tr>))}</tbody></table>)}
              </div>
            )}
            {pTotalPages > 1 && <div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {pPage} จาก {pTotalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={pPage <= 1} onClick={() => setPPage(pPage - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={pPage >= pTotalPages} onClick={() => setPPage(pPage + 1)}><ChevronRight size={14} /></Button></div></div>}
          </CardContent></Card>
        </>
      )}

      {/* ═══ ASSET ═══ */}
      {activeTab === "asset" && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {ASSET_TABS.map((tab) => (
              <Card key={tab.key} className={cn("cursor-pointer hover:shadow-md transition-shadow", aTab === tab.key && "ring-2 ring-tu-primary")} onClick={() => setATab(tab.key)}>
                <CardContent className="pt-4 text-center"><tab.icon size={20} className={cn("mx-auto mb-1", aTab === tab.key ? "text-tu-primary" : "text-tu-text-muted")} /><p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p></CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">{ASSET_TABS.find(t => t.key === aTab)?.label} ({aTotal} รายการ)</h2>
            <div className="flex gap-2">
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9 w-44" placeholder="ค้นหา..." value={aSearch} onChange={(e) => { setASearch(e.target.value); setAPage(1); }} /></div>
              {perm.erp.createEditDelete && <Button onClick={() => { setAEdit(null); setAForm({ assetNo: "", name: "", purchaseValue: "", status: "active" }); setADialog(true); }} variant="primary"><Plus size={16} /> เพิ่ม</Button>}
            </div>
          </div>
          <Card><CardContent className="pt-4">
            {aLoading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : assets.length === 0 ? <div className="py-12 text-center text-tu-text-muted">ไม่มีครุภัณฑ์</div> : (
              <div className="overflow-x-auto">
                {aTab === "register" && <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">รหัส</th><th className="py-3 px-2">ชื่อ</th><th className="py-3 px-2 text-right">มูลค่า</th><th className="py-3 px-2">สถานะ</th>{perm.erp.createEditDelete && <th className="py-3 px-2 text-right">จัดการ</th>}</tr></thead><tbody>{assets.map(a => (<tr key={a.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-mono">{a.assetNo}</td><td className="py-2.5 px-2">{a.name}</td><td className="py-2.5 px-2 text-right">{fmt(Number(a.purchaseValue))}</td><td className="py-2.5 px-2">{sb(a.status)}</td>{perm.erp.createEditDelete && <td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => { setAEdit(a); setAForm({ assetNo: a.assetNo, name: a.name, purchaseValue: String(a.purchaseValue ?? 0), status: a.status }); setADialog(true); }}><Pencil size={14} /></Button><Button variant="ghost" size="icon" onClick={() => setADel(a)}><Trash2 size={14} className="text-tu-error" /></Button></div></td>}</tr>))}</tbody></table>}
                {aTab === "depreciation" && <table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">รหัส</th><th className="py-3 px-2">ชื่อ</th><th className="py-3 px-2 text-right">มูลค่าซื้อ</th><th className="py-3 px-2 text-right">ค่าเสื่อม/ปี</th><th className="py-3 px-2 text-right">มูลค่าสุทธิ</th></tr></thead><tbody>{assets.map(a => { const d = Number(a.purchaseValue ?? 0) * 0.2; return (<tr key={a.id} className="border-b border-tu-border"><td className="py-2.5 px-2 font-mono">{a.assetNo}</td><td className="py-2.5 px-2">{a.name}</td><td className="py-2.5 px-2 text-right">{fmt(Number(a.purchaseValue))}</td><td className="py-2.5 px-2 text-right text-tu-warning">{fmt(d)}</td><td className="py-2.5 px-2 text-right font-medium">{fmt(Number(a.purchaseValue ?? 0) - d)}</td></tr>); })}</tbody></table>}
                {aTab === "maintenance" && <div className="py-12 text-center text-tu-text-muted"><Wrench size={48} className="mx-auto mb-3" /><p>ประวัติการซ่อมบำรุง</p><p className="text-sm">เลือกครุภัณฑ์เพื่อดูประวัติ</p></div>}
              </div>
            )}
            {aTotalPages > 1 && <div className="flex items-center justify-between pt-4"><span className="text-sm text-tu-text-muted">หน้า {aPage} จาก {aTotalPages}</span><div className="flex gap-1"><Button variant="outline" size="sm" disabled={aPage <= 1} onClick={() => setAPage(aPage - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={aPage >= aTotalPages} onClick={() => setAPage(aPage + 1)}><ChevronRight size={14} /></Button></div></div>}
          </CardContent></Card>
        </>
      )}

      {/* ═══ FINANCE ═══ */}
      {activeTab === "finance" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">รายรับรวม</p><p className="text-xl font-bold text-tu-success">{fmt(totalDebit)}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">รายจ่ายรวม</p><p className="text-xl font-bold text-tu-error">{fmt(totalCredit)}</p></CardContent></Card>
            <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">ยอดคงเหลือสุทธิ</p><p className="text-xl font-bold">{fmt(totalDebit - totalCredit)}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {FINANCE_TABS.map(t => (
              <Card key={t.key} className={cn("cursor-pointer hover:shadow-md transition-shadow", fTab === t.key && "ring-2 ring-tu-primary")} onClick={() => setFTab(t.key)}>
                <CardContent className="pt-4 text-center"><p className="text-xs font-medium">{t.label}</p></CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">{FINANCE_TABS.find(t => t.key === fTab)?.label} ({MOCK_GL.length} รายการ)</h2>
            <div className="flex gap-2"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9 w-44" placeholder="ค้นหา..." value={fSearch} onChange={(e) => setFSearch(e.target.value)} /></div><Button variant="outline" size="sm"><Download size={14} /> ส่งออก</Button></div>
          </div>
          <Card><CardContent className="pt-4">
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">วันที่</th><th className="py-3 px-2">รหัส</th><th className="py-3 px-2">รายการ</th><th className="py-3 px-2">ประเภท</th><th className="py-3 px-2 text-right">เดบิต</th><th className="py-3 px-2 text-right">เครดิต</th><th className="py-3 px-2 text-right">คงเหลือ</th></tr></thead><tbody>{MOCK_GL.filter(d => !fSearch || d.description.includes(fSearch)).map(d => (<tr key={d.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2">{d.date}</td><td className="py-2.5 px-2 font-mono text-xs">{d.code}</td><td className="py-2.5 px-2">{d.description}</td><td className="py-2.5 px-2"><Badge variant={d.type === "income" ? "success" : "destructive"}>{d.type === "income" ? "รายรับ" : "รายจ่าย"}</Badge></td><td className="py-2.5 px-2 text-right">{d.debit > 0 ? fmt(d.debit) : "-"}</td><td className="py-2.5 px-2 text-right">{d.credit > 0 ? fmt(d.credit) : "-"}</td><td className="py-2.5 px-2 text-right font-medium">{fmt(d.balance)}</td></tr>))}</tbody><tfoot><tr className="border-t-2 border-tu-border font-semibold"><td colSpan={4} className="py-3 px-2 text-right">รวม</td><td className="py-3 px-2 text-right text-tu-success">{fmt(totalDebit)}</td><td className="py-3 px-2 text-right text-tu-error">{fmt(totalCredit)}</td><td className="py-3 px-2 text-right">{fmt(totalDebit - totalCredit)}</td></tr></tfoot></table></div>
          </CardContent></Card>
        </>
      )}

      {/* ═══ REPORTS ═══ */}
      {activeTab === "reports" && (
        <>
          <h2 className="text-lg font-semibold">ภาพรวม ERP</h2>
          {rLoading ? <div className="py-12 text-center text-tu-text-muted">กำลังโหลด...</div> : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">งบประมาณ</p><p className="text-xl font-bold">{stats.totalBudgets} รายการ</p><p className="text-xs text-tu-text-muted">วงเงิน {fmt(Number(stats.totalBudgetAmount))}</p></CardContent></Card>
                <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">PR / PO</p><p className="text-xl font-bold">{stats.totalPR} / {stats.totalPO}</p><p className="text-xs text-tu-text-muted">รออนุมัติ <Badge variant="warning">{stats.pendingPR}</Badge></p></CardContent></Card>
                <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">สินทรัพย์</p><p className="text-xl font-bold">{stats.totalAssets} รายการ</p><p className="text-xs text-tu-text-muted">มูลค่า {fmt(Number(stats.totalAssetValue))}</p></CardContent></Card>
                <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">ผู้ขาย</p><p className="text-xl font-bold">{stats.totalVendors} ราย</p></CardContent></Card>
              </div>
              {stats.recentPR?.length > 0 && <Card><CardHeader><CardTitle className="text-base">PR ล่าสุด</CardTitle></CardHeader><CardContent><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-2 px-2">เลขที่</th><th className="py-2 px-2">สถานะ</th><th className="py-2 px-2 text-right">จำนวนเงิน</th></tr></thead><tbody>{stats.recentPR.slice(0,5).map((pr: any) => (<tr key={pr.prNo} className="border-b border-tu-border"><td className="py-2 px-2 font-mono">{pr.prNo}</td><td className="py-2 px-2">{sb(pr.status)}</td><td className="py-2 px-2 text-right">{fmt(Number(pr.totalAmount))}</td></tr>))}</tbody></table></CardContent></Card>}
            </div>
          ) : null}
        </>
      )}

      {/* ─── Budget Dialog ─── */}
      {bDialog && <Modal title={bEdit ? "แก้ไขงบประมาณ" : "เพิ่มงบประมาณ"} onClose={() => setBDialog(false)}>
        <form onSubmit={bSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium mb-1">รหัส <span className="text-tu-error">*</span></label><Input value={bForm.budgetCode} onChange={e => setBForm({ ...bForm, budgetCode: e.target.value })} disabled={!!bEdit} required /></div><div><label className="block text-xs font-medium mb-1">ปี <span className="text-tu-error">*</span></label><Input type="number" value={bForm.fiscalYear} onChange={e => setBForm({ ...bForm, fiscalYear: e.target.value })} /></div></div>
          <div><label className="block text-xs font-medium mb-1">ชื่อ <span className="text-tu-error">*</span></label><Input value={bForm.name} onChange={e => setBForm({ ...bForm, name: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium mb-1">วงเงิน <span className="text-tu-error">*</span></label><Input type="number" value={bForm.totalAmount} onChange={e => setBForm({ ...bForm, totalAmount: e.target.value })} required /></div><div><label className="block text-xs font-medium mb-1">หมวดหมู่</label><select className="w-full rounded-lg border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={bForm.category} onChange={e => setBForm({ ...bForm, category: e.target.value })}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>
          <div><label className="block text-xs font-medium mb-1">หน่วยงาน</label><Input value={bForm.department} onChange={e => setBForm({ ...bForm, department: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setBDialog(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={sub}>{sub ? "กำลังบันทึก..." : "บันทึก"}</Button></div>
        </form>
      </Modal>}

      {/* ─── PR Dialog ─── */}
      {prDialog && <Modal title="สร้างใบขอซื้อ (PR)" onClose={() => setPrDialog(false)}>
        <form onSubmit={prSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium mb-1">เลขที่ PR <span className="text-tu-error">*</span></label><Input value={prForm.prNo} onChange={e => setPrForm({ ...prForm, prNo: e.target.value })} required /></div><div><label className="block text-xs font-medium mb-1">รหัสผู้ขอ <span className="text-tu-error">*</span></label><Input value={prForm.requesterUserId} onChange={e => setPrForm({ ...prForm, requesterUserId: e.target.value })} required /></div></div>
          <div><label className="block text-xs font-medium mb-1">รายการ <span className="text-tu-error">*</span></label>{prForm.items.map((item, idx) => (<div key={idx} className="flex gap-2 mb-2"><Input className="flex-[2]" value={item.itemName} onChange={e => { const items = [...prForm.items]; items[idx].itemName = e.target.value; setPrForm({ ...prForm, items }); }} placeholder="ชื่อ" /><Input className="w-16" type="number" value={item.quantity} onChange={e => { const items = [...prForm.items]; items[idx].quantity = Number(e.target.value); setPrForm({ ...prForm, items }); }} /><Input className="w-24" type="number" value={item.unitPrice} onChange={e => { const items = [...prForm.items]; items[idx].unitPrice = Number(e.target.value); setPrForm({ ...prForm, items }); }} />{prForm.items.length > 1 && <Button variant="ghost" size="icon" type="button" onClick={() => setPrForm({ ...prForm, items: prForm.items.filter((_, i) => i !== idx) })}><X size={14} /></Button>}</div>))}<Button variant="outline" size="sm" type="button" onClick={() => setPrForm({ ...prForm, items: [...prForm.items, { itemName: "", quantity: 1, unitPrice: 0 }] })}><Plus size={14} /> เพิ่มรายการ</Button></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setPrDialog(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={sub}>{sub ? "กำลังบันทึก..." : "บันทึก"}</Button></div>
        </form>
      </Modal>}

      {/* ─── PO Dialog ─── */}
      {poDialog && <Modal title="สร้างใบสั่งซื้อ (PO)" onClose={() => setPoDialog(false)}>
        <form onSubmit={poSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium mb-1">เลขที่ PO <span className="text-tu-error">*</span></label><Input value={poForm.poNo} onChange={e => setPoForm({ ...poForm, poNo: e.target.value })} required /></div><div><label className="block text-xs font-medium mb-1">รหัสผู้ขาย <span className="text-tu-error">*</span></label><Input value={poForm.vendorId} onChange={e => setPoForm({ ...poForm, vendorId: e.target.value })} required /></div></div>
          <div><label className="block text-xs font-medium mb-1">รายการ</label>{poForm.items.map((item, idx) => (<div key={idx} className="flex gap-2 mb-2"><Input className="flex-[2]" value={item.itemName} onChange={e => { const items = [...poForm.items]; items[idx].itemName = e.target.value; setPoForm({ ...poForm, items }); }} /><Input className="w-16" type="number" value={item.quantity} onChange={e => { const items = [...poForm.items]; items[idx].quantity = Number(e.target.value); setPoForm({ ...poForm, items }); }} /><Input className="w-24" type="number" value={item.unitPrice} onChange={e => { const items = [...poForm.items]; items[idx].unitPrice = Number(e.target.value); setPoForm({ ...poForm, items }); }} />{poForm.items.length > 1 && <Button variant="ghost" size="icon" type="button" onClick={() => setPoForm({ ...poForm, items: poForm.items.filter((_, i) => i !== idx) })}><X size={14} /></Button>}</div>))}<Button variant="outline" size="sm" type="button" onClick={() => setPoForm({ ...poForm, items: [...poForm.items, { itemName: "", quantity: 1, unitPrice: 0 }] })}><Plus size={14} /> เพิ่มรายการ</Button></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setPoDialog(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={sub}>{sub ? "กำลังบันทึก..." : "บันทึก"}</Button></div>
        </form>
      </Modal>}

      {/* ─── Vendor Dialog ─── */}
      {vDialog && <Modal title={vEdit ? "แก้ไขผู้ขาย" : "เพิ่มผู้ขาย"} onClose={() => setVDialog(false)}>
        <form onSubmit={vSubmit} className="space-y-3"><div><label className="block text-xs font-medium mb-1">เลขประจำตัวผู้เสียภาษี <span className="text-tu-error">*</span></label><Input value={vForm.taxId} onChange={e => setVForm({ ...vForm, taxId: e.target.value })} disabled={!!vEdit} required /></div><div><label className="block text-xs font-medium mb-1">ชื่อบริษัท <span className="text-tu-error">*</span></label><Input value={vForm.companyName} onChange={e => setVForm({ ...vForm, companyName: e.target.value })} required /></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setVDialog(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={sub}>{sub ? "กำลังบันทึก..." : "บันทึก"}</Button></div></form>
      </Modal>}

      {/* ─── Asset Dialog ─── */}
      {aDialog && <Modal title={aEdit ? "แก้ไขครุภัณฑ์" : "เพิ่มครุภัณฑ์"} onClose={() => setADialog(false)}>
        <form onSubmit={aSubmit} className="space-y-3"><div><label className="block text-xs font-medium mb-1">รหัสครุภัณฑ์ <span className="text-tu-error">*</span></label><Input value={aForm.assetNo} onChange={e => setAForm({ ...aForm, assetNo: e.target.value })} disabled={!!aEdit} required /></div><div><label className="block text-xs font-medium mb-1">ชื่อครุภัณฑ์ <span className="text-tu-error">*</span></label><Input value={aForm.name} onChange={e => setAForm({ ...aForm, name: e.target.value })} required /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium mb-1">มูลค่าซื้อ</label><Input type="number" value={aForm.purchaseValue} onChange={e => setAForm({ ...aForm, purchaseValue: e.target.value })} /></div><div><label className="block text-xs font-medium mb-1">สถานะ</label><select className="w-full rounded-lg border border-tu-border px-3 py-2 text-sm bg-tu-surface" value={aForm.status} onChange={e => setAForm({ ...aForm, status: e.target.value })}><option value="active">ใช้งาน</option><option value="maintenance">ซ่อมบำรุง</option><option value="disposed">จำหน่าย</option><option value="inactive">ไม่ใช้งาน</option></select></div></div><div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setADialog(false)}>ยกเลิก</Button><Button type="submit" variant="primary" disabled={sub}>{sub ? "กำลังบันทึก..." : "บันทึก"}</Button></div></form>
      </Modal>}

      {/* ─── Delete Confirms ─── */}
      {bDel && <Confirm title="ยืนยันการลบ" msg={`ลบงบประมาณ ${bDel.budgetCode}?`} onCancel={() => setBDel(null)} onConfirm={bDelFn} />}
      {prDel && <Confirm title="ยืนยันการลบ" msg={`ลบ ${prDel.prNo}?`} onCancel={() => setPrDel(null)} onConfirm={async () => { await fetch(`/api/erp/purchase-requests?id=${prDel.id}`, { method: "DELETE" }); toast_("success", "ลบสำเร็จ"); setPrDel(null); fPR(); }} />}
      {poDel && <Confirm title="ยืนยันการลบ" msg={`ลบ ${poDel.poNo}?`} onCancel={() => setPoDel(null)} onConfirm={async () => { await fetch(`/api/erp/purchase-orders?id=${poDel.id}`, { method: "DELETE" }); toast_("success", "ลบสำเร็จ"); setPoDel(null); fPO(); }} />}
      {vDel && <Confirm title="ยืนยันการลบ" msg={`ลบ ${vDel.companyName}?`} onCancel={() => setVDel(null)} onConfirm={async () => { await fetch(`/api/erp/vendors?id=${vDel.id}`, { method: "DELETE" }); toast_("success", "ลบสำเร็จ"); setVDel(null); fV(); }} />}
      {aDel && <Confirm title="ยืนยันการลบ" msg={`ลบ ${aDel.name}?`} onCancel={() => setADel(null)} onConfirm={aDelFn} />}

      {toast && <div className={cn("fixed bottom-6 right-6 z-[60] rounded-xl border px-4 py-3 shadow-lg text-sm flex items-center gap-2", toast.type === "success" ? "bg-tu-success/10 border-tu-success/30 text-tu-success" : "bg-tu-error/10 border-tu-error/30 text-tu-error")}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}<button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button></div>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between p-4 border-b border-tu-border"><h2 className="text-lg font-semibold">{title}</h2><Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button></div><div className="p-4">{children}</div></div></div>;
}

function Confirm({ title, msg, onCancel, onConfirm }: { title: string; msg: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}><div className="bg-tu-surface rounded-[--radius-dialog] border border-tu-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}><h2 className="text-lg font-semibold mb-2">{title}</h2><p className="text-sm text-tu-text-muted mb-4">{msg}</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={onCancel}>ยกเลิก</Button><Button variant="destructive" onClick={onConfirm}>ลบ</Button></div></div></div>;
}
