"use client";

import { useState } from "react";
import {
  Plus, Copy, CheckCircle, Trash2, Eye,
} from "lucide-react";
import { EmptyState } from "./empty-state";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string;
  createdAt: string;
  lastUsed: string;
  status?: "active" | "revoked";
}

interface ApiKeyTableProps {
  settings: Record<string, Record<string, unknown>>;
}

/**
 * Enterprise API Key management table.
 * Replaces the old card-list layout with a proper data table.
 * Keeps all original create/copy/revoke logic intact.
 */
export function ApiKeyTable({ settings }: ApiKeyTableProps) {
  const keys = (settings.apiKeys || []) as unknown as ApiKey[];

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState("read:docs, read:announcements");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localKeys, setLocalKeys] = useState<ApiKey[]>(keys);

  // Sync from props when settings change
  useState(() => {
    setLocalKeys(keys);
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    const k: ApiKey = {
      id: String(Date.now()),
      name: newName.trim(),
      key: "top_sk_" + Math.random().toString(36).slice(2, 10) + "..." + Math.random().toString(36).slice(2, 6),
      permissions: newPerms,
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: "-",
      status: "active",
    };
    setLocalKeys([k, ...localKeys]);
    setNewName("");
    setNewPerms("read:docs, read:announcements");
    setCreateOpen(false);
  };

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRevoke = (id: string) => {
    setLocalKeys(localKeys.map(k => k.id === id ? { ...k, status: "revoked" as const } : k));
  };

  if (localKeys.length === 0 && !createOpen) {
    return (
      <EmptyState
        type="api-keys"
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-[--radius-btn] bg-tu-primary px-4 py-2 text-sm font-medium text-white hover:bg-tu-primary-hover transition-colors"
          >
            <Plus size={16} className="inline mr-1.5" />
            สร้าง API Key
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-tu-text-muted">
          {localKeys.length} รายการ — จัดการ API Key สำหรับเชื่อมต่อระบบภายนอก
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors"
        >
          <Plus size={14} />สร้าง API Key
        </button>
      </div>

      {/* Create Form */}
      {createOpen && (
        <div className="bg-tu-surface border border-tu-border rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-tu-text-primary">สร้าง API Key ใหม่</h4>
          <div>
            <label className="text-xs font-medium text-tu-text-secondary block mb-1">ชื่อ API Key</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="เช่น Production API, Development Key"
              className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-tu-text-secondary block mb-1">Permissions (comma-separated)</label>
            <input
              type="text"
              value={newPerms}
              onChange={e => setNewPerms(e.target.value)}
              placeholder="read:docs, read:announcements"
              className="w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm outline-none focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="rounded-[--radius-btn] border border-tu-border px-3 py-2 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-[--radius-btn] bg-tu-primary px-3 py-2 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50"
            >
              สร้าง
            </button>
          </div>
        </div>
      )}

      {/* Table — Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-tu-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-tu-surface border-b border-tu-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-tu-text-secondary">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tu-text-secondary">API Key</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tu-text-secondary">Permissions</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tu-text-secondary">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tu-text-secondary">Created</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-tu-text-secondary">Last Used</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-tu-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tu-border">
            {localKeys.map((k) => (
              <tr key={k.id} className="hover:bg-tu-secondary-soft/30 transition-colors">
                <td className="px-4 py-3 text-tu-text-primary font-medium">{k.name}</td>
                <td className="px-4 py-3">
                  <code className="text-[11px] bg-tu-bg px-2 py-0.5 rounded text-tu-text-secondary">{k.key}</code>
                </td>
                <td className="px-4 py-3 text-xs text-tu-text-secondary">{k.permissions}</td>
                <td className="px-4 py-3">
                  {k.status === "revoked" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-tu-error/10 px-2 py-0.5 text-[10px] font-medium text-tu-error">Revoked</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-tu-success/10 px-2 py-0.5 text-[10px] font-medium text-tu-success">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-tu-text-muted">{k.createdAt}</td>
                <td className="px-4 py-3 text-xs text-tu-text-muted">{k.lastUsed}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleCopy(k.key, k.id)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
                      title="คัดลอก"
                    >
                      {copiedId === k.id
                        ? <><CheckCircle size={12} className="text-tu-success" />คัดลอกแล้ว</>
                        : <><Copy size={12} />คัดลอก</>}
                    </button>
                    <button
                      onClick={() => handleRevoke(k.id)}
                      disabled={k.status === "revoked"}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-tu-error hover:bg-tu-error/10 transition-colors disabled:opacity-30"
                      title="เพิกถอน"
                    >
                      <Trash2 size={12} />เพิกถอน
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — Mobile */}
      <div className="md:hidden space-y-3">
        {localKeys.map((k) => (
          <div key={k.id} className="bg-tu-surface border border-tu-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-tu-text-primary">{k.name}</h4>
              {k.status === "revoked" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-tu-error/10 px-2 py-0.5 text-[10px] font-medium text-tu-error">Revoked</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-tu-success/10 px-2 py-0.5 text-[10px] font-medium text-tu-success">Active</span>
              )}
            </div>
            <code className="block text-[11px] bg-tu-bg px-2 py-1 rounded text-tu-text-secondary break-all">{k.key}</code>
            <p className="text-xs text-tu-text-muted">Permissions: <span className="text-tu-text-secondary font-medium">{k.permissions}</span></p>
            <div className="flex items-center justify-between text-[10px] text-tu-text-muted">
              <span>สร้าง: {k.createdAt}</span>
              <span>ใช้ล่าสุด: {k.lastUsed}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-tu-border">
              <button
                onClick={() => handleCopy(k.key, k.id)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
              >
                {copiedId === k.id ? <><CheckCircle size={12} className="text-tu-success" />คัดลอกแล้ว</> : <><Copy size={12} />คัดลอก</>}
              </button>
              <button
                onClick={() => handleRevoke(k.id)}
                disabled={k.status === "revoked"}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-tu-error hover:bg-tu-error/10 transition-colors disabled:opacity-30"
              >
                <Trash2 size={12} />เพิกถอน
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
