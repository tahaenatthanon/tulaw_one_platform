"use client";

import { useState } from "react";
import { DollarSign, FileText, Receipt, Landmark, ScrollText, Download, Printer, Search, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FinanceEntry = {
  id: string; date: string; description: string; accountCode: string;
  debit: number; credit: number; balance: number; category: string;
  type: "income" | "expense" | "transfer";
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(v);
}

const MOCK_GL: FinanceEntry[] = [
  { id: "1", date: "2026-07-01", description: "รับเงินงบประมาณประจำปี", accountCode: "1101-01", debit: 5000000, credit: 0, balance: 5000000, category: "เงินงบประมาณแผ่นดิน", type: "income" },
  { id: "2", date: "2026-07-03", description: "ค่าจ้างบุคลากรชั่วคราว", accountCode: "5101-01", debit: 0, credit: 85000, balance: 4915000, category: "ค่าจ้าง", type: "expense" },
  { id: "3", date: "2026-07-05", description: "ค่าเช่าห้องประชุม", accountCode: "5102-02", debit: 0, credit: 15000, balance: 4900000, category: "ค่าเช่า", type: "expense" },
  { id: "4", date: "2026-07-07", description: "โอนเงินระหว่างบัญชี", accountCode: "1101-01", debit: 0, credit: 200000, balance: 4700000, category: "โอนเงิน", type: "transfer" },
  { id: "5", date: "2026-07-08", description: "รับเงินค่าลงทะเบียนอบรม", accountCode: "4301-01", debit: 120000, credit: 0, balance: 4820000, category: "รายได้ค่าธรรมเนียม", type: "income" },
  { id: "6", date: "2026-07-10", description: "ค่าวัสดุสำนักงาน", accountCode: "5103-01", debit: 0, credit: 32500, balance: 4787500, category: "วัสดุ", type: "expense" },
  { id: "7", date: "2026-07-12", description: "ค่าซ่อมบำรุงเครื่องปรับอากาศ", accountCode: "5104-01", debit: 0, credit: 45000, balance: 4742500, category: "ซ่อมบำรุง", type: "expense" },
  { id: "8", date: "2026-07-14", description: "รับดอกเบี้ยเงินฝาก", accountCode: "4302-01", debit: 8500, credit: 0, balance: 4751000, category: "ดอกเบี้ยรับ", type: "income" },
  { id: "9", date: "2026-07-15", description: "ค่าไฟฟ้า", accountCode: "5105-01", debit: 0, credit: 68000, balance: 4683000, category: "สาธารณูปโภค", type: "expense" },
  { id: "10", date: "2026-07-16", description: "ค่าน้ำประปา", accountCode: "5105-02", debit: 0, credit: 12500, balance: 4670500, category: "สาธารณูปโภค", type: "expense" },
];

type TabKey = "gl" | "trial" | "income" | "balance" | "check";
interface TabInfo { key: TabKey; label: string; icon: typeof FileText; }

const tabs: TabInfo[] = [
  { key: "gl", label: "บัญชีแยกประเภท", icon: ScrollText },
  { key: "trial", label: "งบทดลอง", icon: FileText },
  { key: "income", label: "งบกำไรขาดทุน", icon: TrendingUp },
  { key: "balance", label: "งบดุล", icon: Landmark },
  { key: "check", label: "ทะเบียนคุมเช็ค", icon: Receipt },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("gl");
  const [search, setSearch] = useState("");
  const [data] = useState<FinanceEntry[]>(MOCK_GL);

  const filtered = data.filter((d) =>
    !search || d.description.includes(search) || d.accountCode.includes(search) || d.category.includes(search)
  );

  const totalDebit = data.reduce((s, d) => s + d.debit, 0);
  const totalCredit = data.reduce((s, d) => s + d.credit, 0);
  const netBalance = totalDebit - totalCredit;

  const byCategory = data.reduce<Record<string, { debit: number; credit: number }>>((acc, d) => {
    if (!acc[d.category]) acc[d.category] = { debit: 0, credit: 0 };
    acc[d.category].debit += d.debit;
    acc[d.category].credit += d.credit;
    return acc;
  }, {});

  const trialEntries = Object.entries(byCategory).map(([cat, val]) => ({
    category: cat, debit: val.debit, credit: val.credit,
  }));

  const incomeTotal = data.filter((d) => d.type === "income").reduce((s, d) => s + d.debit, 0);
  const expenseTotal = data.filter((d) => d.type === "expense").reduce((s, d) => s + d.credit, 0);
  const netIncome = incomeTotal - expenseTotal;

  const renderTypeIcon = (type: string) => {
    if (type === "income") return <TrendingUp size={14} className="text-tu-success" />;
    if (type === "expense") return <TrendingDown size={14} className="text-tu-error" />;
    return <Minus size={14} className="text-tu-info" />;
  };

  const renderTypeBadge = (type: string) => {
    if (type === "income") return <Badge variant="success">รายรับ</Badge>;
    if (type === "expense") return <Badge variant="destructive">รายจ่าย</Badge>;
    return <Badge variant="info">โอน</Badge>;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-tu-text-primary flex items-center gap-2">
            <DollarSign size={24} className="text-tu-primary" /> การเงินและบัญชี
          </h1>
          <p className="text-sm text-tu-text-muted">ระบบการเงิน บัญชี และงบการเงิน</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer size={14} /> พิมพ์</Button>
          <Button variant="outline" size="sm"><Download size={14} /> ส่งออก</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-tu-text-muted">รายรับรวม</p>
            <p className="text-xl font-bold text-tu-success">{formatCurrency(totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-tu-text-muted">รายจ่ายรวม</p>
            <p className="text-xl font-bold text-tu-error">{formatCurrency(totalCredit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-tu-text-muted">ยอดคงเหลือสุทธิ</p>
            <p className={cn("text-xl font-bold", netBalance >= 0 ? "text-tu-success" : "text-tu-error")}>{formatCurrency(netBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-tu-text-muted">กำไร(ขาดทุน)สุทธิ</p>
            <p className={cn("text-xl font-bold", netIncome >= 0 ? "text-tu-success" : "text-tu-error")}>{formatCurrency(netIncome)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {tabs.map((tab) => (
          <Card key={tab.key} className={cn("cursor-pointer hover:shadow-md transition-shadow", activeTab === tab.key && "ring-2 ring-tu-primary")} onClick={() => setActiveTab(tab.key)}>
            <CardContent className="pt-4 text-center">
              <tab.icon size={20} className={cn("mx-auto mb-1", activeTab === tab.key ? "text-tu-primary" : "text-tu-text-muted")} />
              <p className="text-xs font-medium text-tu-text-secondary">{tab.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
              <Input className="pl-9" placeholder="ค้นหารายการ..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {search && <Button variant="ghost" size="icon" onClick={() => setSearch("")}><X size={16} /></Button>}
          </div>

          <div className="overflow-x-auto">
            {activeTab === "gl" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tu-border text-left text-tu-text-muted">
                    <th className="py-3 px-2 font-medium">วันที่</th>
                    <th className="py-3 px-2 font-medium">รหัสบัญชี</th>
                    <th className="py-3 px-2 font-medium">รายการ</th>
                    <th className="py-3 px-2 font-medium">ประเภท</th>
                    <th className="py-3 px-2 font-medium text-right">เดบิต</th>
                    <th className="py-3 px-2 font-medium text-right">เครดิต</th>
                    <th className="py-3 px-2 font-medium text-right">ยอดคงเหลือ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                      <td className="py-2.5 px-2">{d.date}</td>
                      <td className="py-2.5 px-2 font-mono text-xs">{d.accountCode}</td>
                      <td className="py-2.5 px-2">{d.description}</td>
                      <td className="py-2.5 px-2">{renderTypeBadge(d.type)}</td>
                      <td className="py-2.5 px-2 text-right">{d.debit > 0 ? formatCurrency(d.debit) : "-"}</td>
                      <td className="py-2.5 px-2 text-right">{d.credit > 0 ? formatCurrency(d.credit) : "-"}</td>
                      <td className="py-2.5 px-2 text-right font-medium">{formatCurrency(d.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-tu-border font-semibold">
                    <td colSpan={4} className="py-3 px-2 text-right">รวม</td>
                    <td className="py-3 px-2 text-right text-tu-success">{formatCurrency(totalDebit)}</td>
                    <td className="py-3 px-2 text-right text-tu-error">{formatCurrency(totalCredit)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(netBalance)}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {activeTab === "trial" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tu-border text-left text-tu-text-muted">
                    <th className="py-3 px-2 font-medium">หมวดหมู่</th>
                    <th className="py-3 px-2 font-medium text-right">เดบิต</th>
                    <th className="py-3 px-2 font-medium text-right">เครดิต</th>
                  </tr>
                </thead>
                <tbody>
                  {trialEntries.map((e) => (
                    <tr key={e.category} className="border-b border-tu-border hover:bg-tu-surface-hover">
                      <td className="py-2.5 px-2">{e.category}</td>
                      <td className="py-2.5 px-2 text-right">{e.debit > 0 ? formatCurrency(e.debit) : "-"}</td>
                      <td className="py-2.5 px-2 text-right">{e.credit > 0 ? formatCurrency(e.credit) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-tu-border font-semibold">
                    <td className="py-3 px-2 text-right">รวม</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(totalDebit)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(totalCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {activeTab === "income" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">รายได้รวม</p><p className="text-xl font-bold text-tu-success">{formatCurrency(incomeTotal)}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">ค่าใช้จ่ายรวม</p><p className="text-xl font-bold text-tu-error">{formatCurrency(expenseTotal)}</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">กำไร(ขาดทุน)สุทธิ</p><p className={cn("text-xl font-bold", netIncome >= 0 ? "text-tu-success" : "text-tu-error")}>{formatCurrency(netIncome)}</p></CardContent></Card>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tu-border text-left text-tu-text-muted">
                      <th className="py-3 px-2 font-medium">รายการ</th>
                      <th className="py-3 px-2 font-medium text-right">จำนวนเงิน</th>
                      <th className="py-3 px-2 font-medium">ประเภท</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.filter((d) => d.type !== "transfer").map((d) => (
                      <tr key={d.id} className="border-b border-tu-border hover:bg-tu-surface-hover">
                        <td className="py-2.5 px-2">{d.description}</td>
                        <td className="py-2.5 px-2 text-right font-medium">{d.type === "income" ? formatCurrency(d.debit) : `(${formatCurrency(d.credit)})`}</td>
                        <td className="py-2.5 px-2">{renderTypeBadge(d.type)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "balance" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card>
                    <CardHeader><CardTitle className="text-base">สินทรัพย์</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {["เงินสดและเงินฝากธนาคาร", "ลูกหนี้", "วัสดุคงคลัง", "ครุภัณฑ์", "อาคารและสิ่งปลูกสร้าง"].map((item, i) => (
                        <div key={item} className="flex justify-between text-sm"><span className="text-tu-text-secondary">{item}</span><span className="font-medium">{formatCurrency([8500000, 1200000, 450000, 15000000, 50000000][i])}</span></div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t border-tu-border pt-2"><span>รวมสินทรัพย์</span><span>{formatCurrency(75150000)}</span></div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-base">หนี้สินและทุน</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {["เจ้าหนี้", "เงินสำรอง", "ทุนสะสม", "รายได้สูง(ต่ำ)กว่าค่าใช้จ่าย"].map((item, i) => (
                        <div key={item} className="flex justify-between text-sm"><span className="text-tu-text-secondary">{item}</span><span className="font-medium">{formatCurrency([3500000, 8000000, 60000000, 3650000][i])}</span></div>
                      ))}
                      <div className="flex justify-between text-sm font-bold border-t border-tu-border pt-2"><span>รวมหนี้สินและทุน</span><span>{formatCurrency(75150000)}</span></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "check" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">เช็คทั้งหมด</p><p className="text-xl font-bold">24 ฉบับ</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">เช็ครอบเรียกเก็บ</p><p className="text-xl font-bold text-tu-warning">3 ฉบับ</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><p className="text-xs text-tu-text-muted">เช็คจ่ายแล้ว</p><p className="text-xl font-bold text-tu-success">21 ฉบับ</p></CardContent></Card>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tu-border text-left text-tu-text-muted">
                      <th className="py-3 px-2 font-medium">เลขที่เช็ค</th>
                      <th className="py-3 px-2 font-medium">วันที่</th>
                      <th className="py-3 px-2 font-medium">ผู้รับ</th>
                      <th className="py-3 px-2 font-medium text-right">จำนวนเงิน</th>
                      <th className="py-3 px-2 font-medium">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { no: "CHQ-001", date: "2026-07-03", payee: "บริษัท เอ บี ซี จำกัด", amount: 85000, status: "จ่ายแล้ว" },
                      { no: "CHQ-002", date: "2026-07-05", payee: "หอประชุมธรรมศาสตร์", amount: 15000, status: "จ่ายแล้ว" },
                      { no: "CHQ-003", date: "2026-07-10", payee: "ร้านเครื่องเขียน สมายล์", amount: 32500, status: "รอเรียกเก็บ" },
                      { no: "CHQ-004", date: "2026-07-12", payee: "ช่างสมชาย แอร์เซอร์วิส", amount: 45000, status: "จ่ายแล้ว" },
                      { no: "CHQ-005", date: "2026-07-15", payee: "การไฟฟ้านครหลวง", amount: 68000, status: "รอเรียกเก็บ" },
                    ].map((chq) => (
                      <tr key={chq.no} className="border-b border-tu-border hover:bg-tu-surface-hover">
                        <td className="py-2.5 px-2 font-mono">{chq.no}</td>
                        <td className="py-2.5 px-2">{chq.date}</td>
                        <td className="py-2.5 px-2">{chq.payee}</td>
                        <td className="py-2.5 px-2 text-right">{formatCurrency(chq.amount)}</td>
                        <td className="py-2.5 px-2"><Badge variant={chq.status === "จ่ายแล้ว" ? "success" : "warning"}>{chq.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
