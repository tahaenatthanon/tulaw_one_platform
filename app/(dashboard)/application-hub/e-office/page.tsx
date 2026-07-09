"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Repeat, CheckCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tabs = [
  { id: "incoming", label: "หนังสือเข้า", icon: ArrowDownToLine },
  { id: "outgoing", label: "หนังสือออก", icon: ArrowUpFromLine },
  { id: "circular", label: "หนังสือเวียน", icon: Repeat },
  { id: "approval", label: "อนุมัติ", icon: CheckCheck },
  { id: "meetings", label: "การประชุม", icon: Users },
];

const content: Record<string, { title: string; desc: string; items?: string[] }> = {
  incoming: { title: "หนังสือเข้า", desc: "จัดการหนังสือรับเข้าจากหน่วยงานภายนอก", items: ["ลงทะเบียนรับหนังสือ", "เสนอผู้บริหาร", "ติดตามสถานะ", "ค้นหาหนังสือเข้า", "รายงาน"] },
  outgoing: { title: "หนังสือออก", desc: "จัดการหนังสือส่งออกไปยังหน่วยงานภายนอก", items: ["ร่างหนังสือออก", "เสนอลงนาม", "ลงทะเบียนส่ง", "ติดตามผล", "ค้นหาหนังสือออก"] },
  circular: { title: "หนังสือเวียน", desc: "จัดการหนังสือเวียนภายในคณะ", items: ["สร้างหนังสือเวียน", "กำหนดผู้รับ", "ติดตามการรับทราบ", "ประวัติหนังสือเวียน"] },
  approval: { title: "อนุมัติเอกสาร", desc: "ระบบเวียนอนุมัติเอกสารอิเล็กทรอนิกส์", items: ["รายการรออนุมัติ", "ประวัติการอนุมัติ", "ตั้งค่าสายอนุมัติ", "ติดตามสถานะ"] },
  meetings: { title: "การประชุม", desc: "จัดการวาระการประชุมและมติ", items: ["สร้างวาระประชุม", "บันทึกมติที่ประชุม", "รายงานการประชุม", "ปฏิทินประชุม"] },
};

export default function EofficePage() {
  const [activeTab, setActiveTab] = useState("incoming");
  const current = content[activeTab];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary">E-Office — ระบบสารบรรณอิเล็กทรอนิกส์</h1>
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
