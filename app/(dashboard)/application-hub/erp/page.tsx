"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Calculator, DollarSign, ShoppingCart, Box, FileBarChart, Lock, LogOut } from "lucide-react";
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("budget");
  const current = content[activeTab];

  const handleLogin = () => {
    router.push("/login?callbackUrl=/application-hub/erp");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/application-hub/erp" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-[70vh] p-6 flex items-center justify-center">
        <div className="text-sm text-tu-text-muted">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[70vh] p-6 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[--radius-card] border border-tu-border bg-tu-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tu-primary-soft">
              <Lock size={24} className="text-tu-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-tu-text-primary">ERP Access</h1>
              <p className="text-sm text-tu-text-muted">กรุณาเข้าสู่ระบบด้วยบัญชี TULAW ก่อนเข้าถึง ERP</p>
            </div>
          </div>

          <button onClick={handleLogin} className="flex w-full items-center justify-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-tu-text-inverse transition-colors hover:bg-tu-primary-hover">
            <Lock size={16} /> เข้าสู่ระบบด้วย TULAW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary">ERP — ระบบบริหารทรัพยากรองค์กร</h1>
          <p className="text-sm text-tu-text-muted">เข้าสู่ระบบในชื่อ {session.user?.name || session.user?.email}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 rounded-[--radius-btn] border border-tu-border bg-tu-surface px-3 py-2 text-sm text-tu-text-secondary transition-colors hover:bg-tu-surface-hover">
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>
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
