"use client";

import { useState } from "react";
import { FolderOpen, Building2, User, GitBranch, ScanEye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tabs = [
  { id: "central", label: "คลังกลาง", icon: FolderOpen },
  { id: "dept", label: "คลังหน่วยงาน", icon: Building2 },
  { id: "personal", label: "ส่วนตัว", icon: User },
  { id: "version", label: "ประวัติเวอร์ชัน", icon: GitBranch },
  { id: "ocr", label: "ค้นหา OCR", icon: ScanEye },
];

export default function DmsPage() {
  const [activeTab, setActiveTab] = useState("central");
  const t = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary">ระบบจัดการเอกสาร (DMS)</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors", activeTab === tab.id ? "bg-tu-primary text-white" : "border border-tu-border text-tu-text-secondary hover:bg-tu-surface-hover")}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><t.icon size={20} className="text-tu-primary" />{t.label}</CardTitle>
        </CardHeader>
        <CardContent className="text-tu-text-muted text-sm">เนื้อหา {t.label} จะแสดงที่นี่</CardContent>
      </Card>
    </div>
  );
}
