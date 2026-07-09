"use client";

import { useState } from "react";
import { Users, CalendarCheck, Clock, ClipboardCheck, GraduationCap, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tabs = [
  { id: "personnel", label: "บุคลากร", icon: Users },
  { id: "leave", label: "ลางาน", icon: CalendarCheck },
  { id: "attendance", label: "เวลาเข้างาน", icon: Clock },
  { id: "evaluation", label: "ประเมินผล", icon: ClipboardCheck },
  { id: "training", label: "อบรม", icon: GraduationCap },
  { id: "payroll", label: "เงินเดือน", icon: DollarSign },
];

export default function HrPage() {
  const [activeTab, setActiveTab] = useState("personnel");
  const t = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary">ระบบงานบุคคล (HRM)</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors", activeTab === tab.id ? "bg-tu-primary text-white" : "border border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover")}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><t.icon size={20} className="text-tu-primary" />{t.label}</CardTitle></CardHeader>
        <CardContent className="text-tu-text-muted text-sm">เนื้อหา {t.label} จะแสดงที่นี่</CardContent>
      </Card>
    </div>
  );
}
