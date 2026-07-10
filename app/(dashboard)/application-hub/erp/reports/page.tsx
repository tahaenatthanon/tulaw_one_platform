"use client";

import { useState, useEffect } from "react";
import { FileBarChart, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Box, Calculator, Download, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(v);
}

type ErpStats = {
  totalVendors: number; totalPR: number; totalPO: number; totalAssets: number;
  totalBudgets: number; pendingPR: number; totalBudgetAmount: number; totalAssetValue: number;
  recentPR: { prNo: string; status: string; totalAmount: number }[];
};

export default function ReportsPage() {
  const [stats, setStats] = useState<ErpStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/erp/stats")
      .then((r) => r.json())
      .then((json) => { if (json.success) setStats(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = stats;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><FileBarChart size={24} className="text-tu-primary" /> รายงาน ERP</h1>
          <p className="text-sm text-tu-text-muted">รายงานทางการเงิน งบประมาณ จัดซื้อ และพัสดุ</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer size={14} /> พิมพ์</Button>
          <Button variant="outline" size="sm"><Download size={14} /> ส่งออก</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-tu-text-muted">กำลังโหลดข้อมูล...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><Calculator size={16} className="text-tu-primary" /><p className="text-xs text-tu-text-muted">งบประมาณ</p></div>
                <p className="text-xl font-bold">{s?.totalBudgets ?? 0} รายการ</p>
                <p className="text-xs text-tu-text-muted mt-1">วงเงินรวม {formatCurrency(Number(s?.totalBudgetAmount ?? 0))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><ShoppingCart size={16} className="text-tu-primary" /><p className="text-xs text-tu-text-muted">จัดซื้อ</p></div>
                <p className="text-xl font-bold">{s?.totalPR ?? 0} PR / {s?.totalPO ?? 0} PO</p>
                <p className="text-xs text-tu-text-muted mt-1">รออนุมัติ <Badge variant="warning">{s?.pendingPR ?? 0}</Badge></p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><Box size={16} className="text-tu-primary" /><p className="text-xs text-tu-text-muted">สินทรัพย์</p></div>
                <p className="text-xl font-bold">{s?.totalAssets ?? 0} รายการ</p>
                <p className="text-xs text-tu-text-muted mt-1">มูลค่ารวม {formatCurrency(Number(s?.totalAssetValue ?? 0))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-tu-primary" /><p className="text-xs text-tu-text-muted">ผู้ขาย</p></div>
                <p className="text-xl font-bold">{s?.totalVendors ?? 0} ราย</p>
              </CardContent>
            </Card>
          </div>

          {/* Report Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Budget Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Calculator size={18} className="text-tu-primary" /> รายงานงบประมาณ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">จำนวนงบประมาณทั้งหมด</span><span className="font-medium">{s?.totalBudgets ?? 0} รายการ</span></div>
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">วงเงินรวม</span><span className="font-medium text-tu-success">{formatCurrency(Number(s?.totalBudgetAmount ?? 0))}</span></div>
                  <div className="border-t border-tu-border pt-3">
                    <p className="text-xs text-tu-text-muted mb-2">สัดส่วนงบประมาณตามหมวดหมู่ (ตัวอย่าง)</p>
                    {[
                      { cat: "งบบุคลากร", pct: 45, color: "bg-tu-primary" },
                      { cat: "งบดำเนินงาน", pct: 25, color: "bg-tu-info" },
                      { cat: "งบลงทุน", pct: 15, color: "bg-tu-warning" },
                      { cat: "งบเงินอุดหนุน", pct: 10, color: "bg-tu-success" },
                      { cat: "งบรายจ่ายอื่น", pct: 5, color: "bg-tu-secondary" },
                    ].map((item) => (
                      <div key={item.cat} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-tu-text-secondary w-24">{item.cat}</span>
                        <div className="flex-1 h-2 rounded-full bg-tu-border overflow-hidden">
                          <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Procurement Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><ShoppingCart size={18} className="text-tu-primary" /> รายงานจัดซื้อจัดจ้าง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">ใบขอซื้อ (PR) ทั้งหมด</span><span className="font-medium">{s?.totalPR ?? 0} ฉบับ</span></div>
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">ใบสั่งซื้อ (PO) ทั้งหมด</span><span className="font-medium">{s?.totalPO ?? 0} ฉบับ</span></div>
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">รออนุมัติ</span><Badge variant="warning">{s?.pendingPR ?? 0} ฉบับ</Badge></div>
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">ผู้ขายในทะเบียน</span><span className="font-medium">{s?.totalVendors ?? 0} ราย</span></div>
                  <div className="border-t border-tu-border pt-3">
                    <p className="text-xs text-tu-text-muted mb-2">PR ล่าสุด</p>
                    {s?.recentPR?.length ? s.recentPR.slice(0, 4).map((pr) => (
                      <div key={pr.prNo} className="flex justify-between text-sm py-1">
                        <span className="text-tu-text-secondary font-mono">{pr.prNo}</span>
                        <span>{formatCurrency(Number(pr.totalAmount))}</span>
                      </div>
                    )) : <p className="text-sm text-tu-text-muted">ไม่มีข้อมูล</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Finance Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><DollarSign size={18} className="text-tu-primary" /> รายงานการเงิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">รายรับทั้งปี</span><span className="font-medium text-tu-success">{formatCurrency(5128500)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">รายจ่ายทั้งปี</span><span className="font-medium text-tu-error">{formatCurrency(258000)}</span></div>
                  <div className="flex justify-between text-sm font-semibold border-t border-tu-border pt-2"><span>ยอดสุทธิ</span><span className="text-tu-success">{formatCurrency(4870500)}</span></div>
                  <div className="border-t border-tu-border pt-3">
                    <p className="text-xs text-tu-text-muted mb-2">แนวโน้มรายรับ-รายจ่ายรายเดือน</p>
                    <div className="flex items-end gap-1 h-24">
                      {["ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map((m, i) => {
                        const income = [5000, 120, 45, 8.5, 0, 0][i] * 1000;
                        const expense = [85, 15, 0, 32.5, 45, 68][i] * 1000;
                        const maxH = 5000000;
                        return (
                          <div key={m} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex flex-col items-center" style={{ height: 80 }}>
                              <div className="w-4/5 bg-tu-success/30 rounded-t" style={{ height: `${(income / maxH) * 80}px` }} />
                              <div className="w-4/5 bg-tu-error/30 rounded-b" style={{ height: `${(expense / maxH) * 80}px` }} />
                            </div>
                            <span className="text-[10px] text-tu-text-muted">{m}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-tu-text-muted">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-tu-success/30" /> รายรับ</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-tu-error/30" /> รายจ่าย</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Box size={18} className="text-tu-primary" /> รายงานสินทรัพย์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">ครุภัณฑ์ทั้งหมด</span><span className="font-medium">{s?.totalAssets ?? 0} รายการ</span></div>
                  <div className="flex justify-between text-sm"><span className="text-tu-text-secondary">มูลค่ารวม</span><span className="font-medium">{formatCurrency(Number(s?.totalAssetValue ?? 0))}</span></div>
                  <div className="border-t border-tu-border pt-3">
                    <p className="text-xs text-tu-text-muted mb-2">สถานะครุภัณฑ์</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "ใช้งาน", count: s?.totalAssets ? Math.round((s.totalAssets ?? 0) * 0.7) : 0, color: "text-tu-success" },
                        { label: "ซ่อมบำรุง", count: s?.totalAssets ? Math.round((s.totalAssets ?? 0) * 0.15) : 0, color: "text-tu-warning" },
                        { label: "จำหน่าย", count: s?.totalAssets ? Math.round((s.totalAssets ?? 0) * 0.1) : 0, color: "text-tu-error" },
                        { label: "ไม่ใช้งาน", count: s?.totalAssets ? Math.round((s.totalAssets ?? 0) * 0.05) : 0, color: "text-tu-text-muted" },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between text-sm bg-tu-bg rounded-lg px-3 py-2">
                          <span className="text-tu-text-secondary">{item.label}</span>
                          <span className={cn("font-medium", item.color)}>{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
