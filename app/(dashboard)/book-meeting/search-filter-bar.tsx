"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  query: string;
  onQuery: (v: string) => void;
  building: string;
  onBuilding: (v: string) => void;
  capacity: string;
  onCapacity: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
};

const BUILDINGS = ["ทุกอาคาร", "อาคาร 1", "อาคาร 2", "อาคาร 3", "อาคารอเนกประสงค์"];
const CAPACITIES = ["ทุกขนาด", "1 – 10 คน", "11 – 30 คน", "31+ คน"];
const STATUSES = ["ทั้งหมด", "ว่าง", "ไม่ว่าง"];

export function SearchFilterBar(p: Props) {
  return (
    <div className="rounded-2xl border border-tu-border bg-tu-surface p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tu-text-muted" />
          <input
            value={p.query}
            onChange={(e) => p.onQuery(e.target.value)}
            placeholder="ค้นหาห้อง อาคาร"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-tu-border bg-tu-surface text-[13px] placeholder:text-tu-text-muted focus:outline-none focus:ring-2 focus:ring-tu-border-focus/25 focus:border-tu-border-focus/40 transition"
          />
        </div>

        <FilterSelect label="อาคาร" value={p.building} onChange={p.onBuilding} options={BUILDINGS} />
        <FilterSelect label="ความจุ" value={p.capacity} onChange={p.onCapacity} options={CAPACITIES} />
        <FilterSelect label="สถานะ" value={p.status} onChange={p.onStatus} options={STATUSES} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-[12px] text-tu-text-muted">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>ตัวกรองจะทำงานร่วมกับข้อมูลจริงจาก API</span>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 rounded-xl bg-tu-surface text-[13px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            <span className="text-[13px]">
              <span className="text-muted-foreground mr-1">{label}:</span>
              {o}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
