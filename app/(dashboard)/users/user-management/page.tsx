"use client";

import { useState } from "react";
import { Search, UserPlus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const mockUsers = [
  { id: "1", name: "ผู้ดูแล ระบบ", email: "admin@tulaw.ac.th", department: "สำนักงานคณะ", role: "Super Admin", status: "active" },
  { id: "2", name: "สมชาย ใจดี", email: "somchai@tulaw.ac.th", department: "ฝ่ายวิชาการ", role: "System Admin", status: "active" },
  { id: "3", name: "สมศรี รักเรียน", email: "somsri@tulaw.ac.th", department: "ฝ่ายการเงิน", role: "Dean", status: "active" },
  { id: "4", name: "วิชัย มั่นคง", email: "wichai@tulaw.ac.th", department: "ฝ่ายเทคโนโลยี", role: "Dept Admin", status: "active" },
  { id: "5", name: "นภา สดใส", email: "napa@tulaw.ac.th", department: "ฝ่ายวิจัย", role: "User", status: "inactive" },
  { id: "6", name: "ธนา ปัญญา", email: "thana@tulaw.ac.th", department: "ฝ่ายกิจการนักศึกษา", role: "Viewer", status: "active" },
];

export default function UserManagementPage() {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-tu-text-primary">จัดการผู้ใช้งาน</h1>
          <p className="text-tu-text-muted text-sm mt-1">จัดการข้อมูลผู้ใช้งานในระบบ</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-tu-text-inverse hover:bg-tu-primary-hover transition-colors">
          <UserPlus size={18} />
          เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tu-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาผู้ใช้งาน..."
          className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface pl-9 pr-4 py-2.5 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition"
        />
      </div>

      {/* Table */}
      <div className="bg-tu-surface rounded-[--radius-card] border border-tu-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-tu-bg border-b border-tu-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">ชื่อ</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden sm:table-cell">อีเมล</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden md:table-cell">หน่วยงาน</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase hidden lg:table-cell">บทบาท</th>
              <th className="px-4 py-3 text-xs font-semibold text-tu-text-secondary uppercase">สถานะ</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tu-border">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-tu-surface-hover transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tu-primary-soft text-tu-primary text-xs font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-tu-text-primary">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden sm:table-cell">{user.email}</td>
                <td className="px-4 py-3 text-sm text-tu-text-secondary hidden md:table-cell">{user.department}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-xs px-2 py-1 rounded-full bg-tu-secondary-soft text-tu-text-primary font-medium">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full border font-medium",
                      user.status === "active"
                        ? "bg-tu-success/10 text-tu-success border-tu-success/20"
                        : "bg-tu-text-muted/10 text-tu-text-muted border-tu-text-muted/20"
                    )}
                  >
                    {user.status === "active" ? "ใช้งาน" : "ระงับ"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1 rounded-md text-tu-text-muted hover:bg-tu-surface-hover transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
