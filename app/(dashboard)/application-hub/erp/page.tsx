"use client";

import { useState } from "react";
import { Calculator, DollarSign, ShoppingCart, Box, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tabs = [
  { id: "budget", label: "งบประมาณ", icon: Calculator },
  { id: "finance", label: "การเงิน", icon: DollarSign },
  { id: "procurement", label: "จัดซื้อจัดจ้าง", icon: ShoppingCart },
  { id: "asset", label: "พัสดุ", icon: Box },
  { id: "reports", label: "รายงาน", icon: FileBarChart },
];

const content: Record<string, { title: string; desc: string; items?: string[] }> = {
  budget: { title: "งบประมาณ", desc: "บริหารงบประมาณประจำปีของคณะ", items: ["งบประมาณรายจ่ายประจำปี 2568", "ติดตามการใช้จ่ายงบประมาณ", "ขออนุมัติงบประมาณเพิ่มเติม", "รายงานงบประมาณรายไตรมาส"] },
  finance: { title: "การเงินและบัญชี", desc: "ระบบการเงิน บัญชี และงบการเงิน", items: ["บัญชีแยกประเภท", "งบทดลอง", "งบกำไรขาดทุน", "งบดุล", "ทะเบียนคุมเช็ค"] },
  procurement: { title: "จัดซื้อจัดจ้าง", desc: "บริหารงานพัสดุและการจัดซื้อจัดจ้าง", items: ["ใบขอซื้อ (PR)", "ใบสั่งซื้อ (PO)", "ทะเบียนผู้ขาย", "ตรวจรับพัสดุ", "รายงานจัดซื้อ"] },
  asset: { title: "พัสดุและสินทรัพย์", desc: "จัดการครุภัณฑ์และสินทรัพย์ของคณะ", items: ["ทะเบียนครุภัณฑ์", "ค่าเสื่อมราคา", "โอน/จำหน่ายสินทรัพย์", "ซ่อมบำรุง", "รายงานสินทรัพย์"] },
  reports: { title: "รายงาน", desc: "รายงานทางการเงิน งบประมาณ และพัสดุ", items: ["รายงานงบประมาณ", "รายงานการเงิน", "รายงานจัดซื้อจัดจ้าง", "รายงานสินทรัพย์", "Dashboard ERP"] },
};

export default function ErpPage() {
  const [activeTab, setActiveTab] = useState("budget");
  const current = content[activeTab];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary">ERP — ระบบบริหารทรัพยากรองค์กร</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors", activeTab === tab.id ? "bg-tu-primary text-white" : "border border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover")}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => { const t = tabs.find((t) => t.id === activeTab)!; return <><t.icon size={20} className="text-tu-primary" />{current.title}</>; })()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-tu-text-muted text-sm mb-4">{current.desc}</p>
          {current.items && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {current.items.map((item) => (
                <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-tu-border bg-tu-bg text-sm text-tu-text-primary hover:bg-tu-surface-hover cursor-pointer transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-tu-primary" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
