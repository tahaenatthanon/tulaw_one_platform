"use client";

import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    name: "แดชบอร์ด",
    permissions: [
      { code: "DASHBOARD_VIEW", name: "ดูแดชบอร์ด" },
      { code: "DASHBOARD_MANAGE", name: "จัดการแดชบอร์ด" },
    ],
  },
  {
    name: "ศูนย์กลางแอปพลิเคชัน",
    permissions: [
      { code: "APPLICATION_HUB_VIEW", name: "ดูศูนย์กลางแอป" },
      { code: "APPLICATION_HUB_MANAGE", name: "จัดการศูนย์กลางแอป" },
      { code: "APPLICATION_HUB_PIN", name: "ปักหมุดแอป" },
    ],
  },
  {
    name: "อินทราเน็ต",
    permissions: [
      { code: "INTRANET_VIEW", name: "ดูข่าวสาร" },
      { code: "INTRANET_CREATE", name: "สร้างข่าวสาร" },
      { code: "INTRANET_EDIT", name: "แก้ไขข่าวสาร" },
      { code: "INTRANET_DELETE", name: "ลบข่าวสาร" },
      { code: "INTRANET_PUBLISH", name: "เผยแพร่ข่าวสาร" },
    ],
  },
  {
    name: "ผู้ใช้งานและสิทธิ์",
    permissions: [
      { code: "USERS_VIEW", name: "ดูผู้ใช้งาน" },
      { code: "USERS_CREATE", name: "สร้างผู้ใช้งาน" },
      { code: "USERS_EDIT", name: "แก้ไขผู้ใช้งาน" },
      { code: "USERS_DELETE", name: "ลบผู้ใช้งาน" },
      { code: "USERS_MANAGE_ROLES", name: "จัดการบทบาท" },
      { code: "USERS_MANAGE_PERMISSIONS", name: "จัดการสิทธิ์" },
      { code: "USERS_AD_SYNC", name: "ซิงค์ AD" },
      { code: "USERS_BULK_IMPORT", name: "นำเข้าผู้ใช้งาน" },
    ],
  },
];

export default function PermissionManagementPage() {
  const [search, setSearch] = useState("");

  const filtered = groups
    .map((g) => ({
      ...g,
      permissions: g.permissions.filter(
        (p) =>
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((g) => g.permissions.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-[var(--tu-text-primary)]">จัดการสิทธิ์</h2>
        <p className="text-[var(--tu-text-muted)] text-sm mt-1">กำหนดสิทธิ์การเข้าถึงแต่ละโมดูล</p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--tu-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาสิทธิ์..."
          className="w-full h-11 rounded-xl border border-transparent bg-slate-50 pl-10 pr-4 text-sm text-[var(--tu-text-primary)] placeholder:text-[var(--tu-text-muted)] transition-all focus:border-[var(--tu-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--tu-primary)]/10"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((group) => (
          <div
            key={group.name}
            className="rounded-2xl border border-[var(--tu-border)] bg-[var(--tu-surface)] shadow-sm"
          >
            <div className="px-5 py-3 border-b border-[var(--tu-border)] bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[var(--tu-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--tu-text-primary)]">{group.name}</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.permissions.map((perm) => (
                  <div
                    key={perm.code}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--tu-border)] text-sm"
                  >
                    <code className="text-[11px] text-[var(--tu-primary)] font-mono bg-[var(--tu-primary-soft)] px-1.5 py-0.5 rounded">
                      {perm.code}
                    </code>
                    <span className="text-[var(--tu-text-secondary)]">{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-[var(--tu-text-muted)]">
        แสดง {filtered.length} จาก {groups.length} กลุ่มสิทธิ์ (รวม {groups.reduce((s, g) => s + g.permissions.length, 0)} สิทธิ์)
      </div>
    </div>
  );
}
