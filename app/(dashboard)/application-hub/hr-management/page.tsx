"use client";

import { useState } from "react";
import { Users, CalendarCheck, Clock, ClipboardCheck, GraduationCap, DollarSign, Search, X, Plus, Eye, Pencil, Trash2, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useActionPermissions } from "@/hooks/use-action-permissions";

const TABS = [
  { id: "personnel", label: "บุคลากร", icon: Users },
  { id: "leave", label: "ลางาน", icon: CalendarCheck },
    { id: "attendance", label: "เวลาเข้างาน", icon: Clock, perm: "attendance" as const },
    { id: "evaluation", label: "ประเมินผล", icon: ClipboardCheck },
    { id: "training", label: "อบรม", icon: GraduationCap },
    { id: "payroll", label: "เงินเดือน", icon: DollarSign, perm: "payroll" as const },
];

const MOCK_PERSONNEL = [
  { id: "1", name: "รศ.ดร.สมชาย ใจดี", email: "somchai@law.tu.ac.th", dept: "กฎหมายแพ่ง", type: "ข้าราชการ", status: "active" },
  { id: "2", name: "ผศ.สมหญิง รักเรียน", email: "somying@law.tu.ac.th", dept: "กฎหมายอาญา", type: "พนักงานมหาวิทยาลัย", status: "active" },
  { id: "3", name: "อ.วิชัย ก้าวไกล", email: "wichai@law.tu.ac.th", dept: "กฎหมายมหาชน", type: "อาจารย์พิเศษ", status: "active" },
  { id: "4", name: "นางสาวพิมพ์ใจ สบายดี", email: "pimjai@law.tu.ac.th", dept: "สำนักงานคณะ", type: "ลูกจ้าง", status: "leave" },
  { id: "5", name: "นายเอกชัย ตั้งมั่น", email: "ekachai@law.tu.ac.th", dept: "กฎหมายระหว่างประเทศ", type: "ข้าราชการ", status: "active" },
];

const MOCK_LEAVE = [
  { id: "1", name: "นางสาวพิมพ์ใจ สบายดี", type: "ลาป่วย", startDate: "15 ก.ค. 2568", endDate: "16 ก.ค. 2568", status: "approved" },
  { id: "2", name: "นายเอกชัย ตั้งมั่น", type: "ลากิจ", startDate: "20 ก.ค. 2568", endDate: "21 ก.ค. 2568", status: "pending" },
  { id: "3", name: "รศ.ดร.สมชาย ใจดี", type: "ลาพักผ่อน", startDate: "1 ส.ค. 2568", endDate: "5 ส.ค. 2568", status: "pending" },
];

const MOCK_ATTENDANCE = [
  { id: "1", name: "รศ.ดร.สมชาย ใจดี", date: "10 ก.ค. 2568", clockIn: "08:15", clockOut: "17:30", status: "present" },
  { id: "2", name: "ผศ.สมหญิง รักเรียน", date: "10 ก.ค. 2568", clockIn: "08:45", clockOut: "16:45", status: "late" },
  { id: "3", name: "นางสาวพิมพ์ใจ สบายดี", date: "10 ก.ค. 2568", clockIn: "-", clockOut: "-", status: "absent" },
];

const MOCK_PAYROLL = [
  { id: "1", name: "รศ.ดร.สมชาย ใจดี", period: "ก.ค. 2568", salary: 75000, bonus: 5000, total: 80000 },
  { id: "2", name: "ผศ.สมหญิง รักเรียน", period: "ก.ค. 2568", salary: 55000, bonus: 3000, total: 58000 },
  { id: "3", name: "อ.วิชัย ก้าวไกล", period: "ก.ค. 2568", salary: 40000, bonus: 0, total: 40000 },
];

function fmt(n: number) { return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n); }

export default function HrPage() {
  const perm = useActionPermissions();
  const [activeTab, setActiveTab] = useState("personnel");
  const [search, setSearch] = useState("");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2"><Users size={24} className="text-tu-primary" /> ระบบงานบุคคล (HRM)</h1>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TABS.map((tab) => {
          if (tab.perm === "payroll" && !perm.hr.payroll) return null;
          if (tab.perm === "attendance" && !perm.hr.attendance) return null;
          return (
          <Card key={tab.id} className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === tab.id && "ring-2 ring-tu-primary")} onClick={() => setActiveTab(tab.id)}>
            <CardContent className="pt-4 text-center">
              <tab.icon size={20} className={cn("mx-auto mb-1", activeTab === tab.id ? "text-tu-primary" : "text-tu-text-muted")} />
              <p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p>
            </CardContent>
          </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">{TABS.find((t) => t.id === activeTab)?.label}</h2>
        <div className="flex gap-2">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" /><Input className="pl-9 w-48" placeholder="ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {perm.hr.manage && <Button variant="primary"><Plus size={16} /> เพิ่ม</Button>}
        </div>
      </div>

      <Card><CardContent className="pt-4">
        {activeTab === "personnel" && (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ชื่อ</th><th className="py-3 px-2">อีเมล</th><th className="py-3 px-2">หน่วยงาน</th><th className="py-3 px-2">ประเภท</th><th className="py-3 px-2">สถานะ</th><th className="py-3 px-2 text-right">จัดการ</th></tr></thead><tbody>{MOCK_PERSONNEL.filter((p) => !search || p.name.includes(search)).map((p) => (<tr key={p.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2 font-medium">{p.name}</td><td className="py-2.5 px-2 text-xs">{p.email}</td><td className="py-2.5 px-2">{p.dept}</td><td className="py-2.5 px-2"><Badge variant="secondary">{p.type}</Badge></td><td className="py-2.5 px-2"><Badge variant={p.status === "active" ? "success" : "warning"}>{p.status === "active" ? "ทำงาน" : "ลา"}</Badge></td><td className="py-2.5 px-2 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon"><Eye size={14} /></Button><Button variant="ghost" size="icon"><Pencil size={14} /></Button></div></td></tr>))}</tbody></table></div>
        )}

        {activeTab === "leave" && (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ผู้ขอ</th><th className="py-3 px-2">ประเภท</th><th className="py-3 px-2">วันที่เริ่ม</th><th className="py-3 px-2">วันที่สิ้นสุด</th><th className="py-3 px-2">สถานะ</th><th className="py-3 px-2 text-right">จัดการ</th></tr></thead><tbody>{MOCK_LEAVE.filter((l) => !search || l.name.includes(search)).map((l) => (<tr key={l.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2">{l.name}</td><td className="py-2.5 px-2"><Badge variant="info">{l.type}</Badge></td><td className="py-2.5 px-2">{l.startDate}</td><td className="py-2.5 px-2">{l.endDate}</td><td className="py-2.5 px-2"><Badge variant={l.status === "approved" ? "success" : "warning"}>{l.status === "approved" ? "อนุมัติ" : "รออนุมัติ"}</Badge></td><td className="py-2.5 px-2 text-right">{l.status === "pending" && <><Button variant="ghost" size="sm" className="text-tu-success"><BadgeCheck size={14} /> อนุมัติ</Button></>}</td></tr>))}</tbody></table></div>
        )}

        {activeTab === "attendance" && (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ชื่อ</th><th className="py-3 px-2">วันที่</th><th className="py-3 px-2">เข้า</th><th className="py-3 px-2">ออก</th><th className="py-3 px-2">สถานะ</th></tr></thead><tbody>{MOCK_ATTENDANCE.map((a) => (<tr key={a.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2">{a.name}</td><td className="py-2.5 px-2">{a.date}</td><td className="py-2.5 px-2">{a.clockIn}</td><td className="py-2.5 px-2">{a.clockOut}</td><td className="py-2.5 px-2"><Badge variant={a.status === "present" ? "success" : a.status === "late" ? "warning" : "destructive"}>{a.status === "present" ? "มา" : a.status === "late" ? "สาย" : "ขาด"}</Badge></td></tr>))}</tbody></table></div>
        )}

        {activeTab === "payroll" && (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-tu-border text-left text-tu-text-muted"><th className="py-3 px-2">ชื่อ</th><th className="py-3 px-2">งวด</th><th className="py-3 px-2 text-right">เงินเดือน</th><th className="py-3 px-2 text-right">โบนัส</th><th className="py-3 px-2 text-right">รวม</th></tr></thead><tbody>{MOCK_PAYROLL.map((p) => (<tr key={p.id} className="border-b border-tu-border hover:bg-tu-surface-hover"><td className="py-2.5 px-2">{p.name}</td><td className="py-2.5 px-2">{p.period}</td><td className="py-2.5 px-2 text-right">{fmt(p.salary)}</td><td className="py-2.5 px-2 text-right">{fmt(p.bonus)}</td><td className="py-2.5 px-2 text-right font-bold text-tu-success">{fmt(p.total)}</td></tr>))}</tbody></table></div>
        )}

        {activeTab === "evaluation" && <div className="py-12 text-center text-tu-text-muted"><ClipboardCheck size={48} className="mx-auto mb-3 text-tu-text-muted" /><p>ระบบประเมินผลการปฏิบัติงาน</p><p className="text-sm mt-1">รอบการประเมิน: กรกฎาคม - ธันวาคม 2568</p><Button variant="outline" className="mt-4">เริ่มประเมิน</Button></div>}

        {activeTab === "training" && <div className="py-12 text-center text-tu-text-muted"><GraduationCap size={48} className="mx-auto mb-3 text-tu-text-muted" /><p>ระบบอบรมและพัฒนาบุคลากร</p><p className="text-sm mt-1">หลักสูตรอบรมที่มี: 5 หลักสูตร | ผู้เข้ารับการอบรม: 32 คน</p><Button variant="outline" className="mt-4">ดูหลักสูตรอบรม</Button></div>}
      </CardContent></Card>
    </div>
  );
}
