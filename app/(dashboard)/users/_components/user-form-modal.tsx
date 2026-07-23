"use client";

import { useState } from "react";
import { ModalShell } from "@/components/shared/modal-shell";

interface UserFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  user?: {
    id: string;
    name: string;
    email: string;
    position?: string;
    department?: string;
    role?: string;
    status?: string;
  };
  departments: Array<{ id: number; name: string }>;
  roles: Array<{ roleCode: string; nameTh: string }>;
  onClose: () => void;
  onComplete: () => void;
}

const inputCls =
  "h-10 w-full rounded-lg border border-[var(--tu-border)] bg-white px-3 text-sm text-[var(--tu-text-primary)] placeholder:text-[var(--tu-text-muted)] transition-all focus:border-[var(--tu-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--tu-primary)]/10";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--tu-text-secondary)]">
        {label} {required && <span className="text-[var(--tu-primary)]">*</span>}
      </span>
      {children}
    </label>
  );
}

export function UserFormModal({ isOpen, mode, user, departments, roles, onClose, onComplete }: UserFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const title = mode === "create" ? "เพิ่มผู้ใช้งานใหม่" : "แก้ไขผู้ใช้งาน";
  const subtitle = mode === "create"
    ? "สร้างบัญชีผู้ใช้และกำหนดสิทธิ์เริ่มต้น"
    : "ปรับปรุงข้อมูลและบทบาทของผู้ใช้";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};
    formData.forEach((v, k) => { body[k] = v; });

    try {
      if (mode === "create") {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else if (user) {
        await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      onComplete();
      onClose();
    } catch {
      // let parent handle error via refresh
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title={title}
      subtitle={subtitle}
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
            form="user-form"
            disabled={submitting}
            className="rounded-lg bg-[var(--tu-primary)] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--tu-primary-hover)] disabled:opacity-60"
          >
            {submitting ? "กำลังบันทึก..." : mode === "create" ? "สร้างผู้ใช้งาน" : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อ - นามสกุล" required>
            <input
              name="name"
              defaultValue={user?.name}
              placeholder="เช่น นายสมชาย ใจดี"
              className={inputCls}
              required
            />
          </Field>
          <Field label="อีเมล" required>
            <input
              name="email"
              type="email"
              defaultValue={user?.email}
              placeholder="name@law.tu.ac.th"
              className={inputCls}
              required
            />
          </Field>
          <Field label="ตำแหน่ง">
            <input
              name="position"
              defaultValue={user?.position}
              placeholder="เช่น เจ้าหน้าที่บริหาร"
              className={inputCls}
            />
          </Field>
          <Field label="หน่วยงาน" required>
            <select name="department" defaultValue={user?.department} className={inputCls} required>
              <option value="">เลือกหน่วยงาน</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Role" required>
            <select name="role" defaultValue={user?.role} className={inputCls} required>
              {roles.map((r) => (
                <option key={r.roleCode} value={r.roleCode}>{r.nameTh}</option>
              ))}
            </select>
          </Field>
          <Field label="สถานะ">
            <select name="status" defaultValue={user?.status ?? "ACTIVE"} className={inputCls}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="MFA_PENDING">MFA Pending</option>
            </select>
          </Field>
        </div>
      </form>
    </ModalShell>
  );
}
