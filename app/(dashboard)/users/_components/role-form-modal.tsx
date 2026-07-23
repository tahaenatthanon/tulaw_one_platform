"use client";

import { useState } from "react";
import {
  LayoutDashboard, FileText, FolderKanban, Newspaper,
  CalendarRange, UserCog, ScrollText,
} from "lucide-react";
import { ModalShell } from "@/components/shared/modal-shell";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const MODULES = [
  { key: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { key: "documents", name: "Documents", icon: FileText },
  { key: "projects", name: "Projects", icon: FolderKanban },
  { key: "intranet", name: "Intranet", icon: Newspaper },
  { key: "meeting", name: "Book Meeting", icon: CalendarRange },
  { key: "users", name: "Users & Roles", icon: UserCog },
  { key: "audit", name: "Audit Log", icon: ScrollText },
];

const ACTIONS = ["view", "create", "update", "delete", "export"] as const;

const inputCls =
  "h-10 w-full rounded-lg border border-[var(--tu-border)] bg-white px-3 text-sm text-[var(--tu-text-primary)] placeholder:text-[var(--tu-text-muted)] transition-all focus:border-[var(--tu-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--tu-primary)]/10";

export function RoleFormModal({ isOpen, onClose, onComplete }: RoleFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { permissions: {} as Record<string, string[]> };
    const permissions: Record<string, string[]> = {};

    formData.forEach((v, k) => {
      if (k.startsWith("perm_")) {
        const [_, module, action] = k.split("_");
        if (!permissions[module]) permissions[module] = [];
        permissions[module].push(action);
      } else {
        body[k] = v;
      }
    });
    body.permissions = permissions;

    try {
      await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onComplete();
      onClose();
    } catch {
      // let parent handle error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title="สร้าง Role ใหม่"
      subtitle="กำหนดชื่อ คำอธิบาย และสิทธิ์ของบทบาท"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--tu-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--tu-text-secondary)] hover:bg-slate-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="role-form"
            disabled={submitting}
            className="rounded-lg bg-[var(--tu-primary)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--tu-primary-hover)] disabled:opacity-60"
          >
            {submitting ? "กำลังสร้าง..." : "สร้าง Role"}
          </button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--tu-text-secondary)]">
              ชื่อ Role <span className="text-[var(--tu-primary)]">*</span>
            </span>
            <input name="name" placeholder="เช่น Department Manager" className={inputCls} required />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[var(--tu-text-secondary)]">
              คำอธิบาย
            </span>
            <textarea
              name="description"
              rows={2}
              placeholder="อธิบายหน้าที่และขอบเขตของบทบาทนี้"
              className={`${inputCls} resize-none`}
            />
          </label>

          <div>
            <div className="mb-2 text-sm font-semibold text-[var(--tu-text-primary)]">Permission Groups</div>
            <div className="space-y-2 rounded-xl border border-[var(--tu-border)] bg-slate-50/50 p-3">
              {MODULES.map((m) => (
                <div
                  key={m.key}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <m.icon size={14} className="text-[var(--tu-text-muted)]" />
                    <span className="text-sm text-[var(--tu-text-primary)]">{m.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {ACTIONS.map((a) => (
                      <label
                        key={a}
                        className="flex cursor-pointer items-center gap-1 rounded-md border border-[var(--tu-border)] bg-white px-2 py-1 text-[11px] text-[var(--tu-text-secondary)] transition-colors hover:border-[var(--tu-primary)]/40 hover:text-[var(--tu-primary)]"
                      >
                        <input
                          type="checkbox"
                          name={`perm_${m.key}_${a}`}
                          className="h-3 w-3 accent-[var(--tu-primary)]"
                        />
                        <span className="capitalize">{a}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
