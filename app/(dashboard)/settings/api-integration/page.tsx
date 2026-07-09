"use client";

import { Plug, Plus, Key } from "lucide-react";

const apiClients = [
  { id: "1", name: "Mobile App", key: "sk-mob-****a1b2", status: "active", created: "2025-06-15" },
  { id: "2", name: "ระบบ ERP", key: "sk-erp-****c3d4", status: "active", created: "2025-05-20" },
];

export default function ApiIntegrationPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-tu-text-primary">API Integration</h1>
          <p className="text-tu-text-muted text-sm mt-1">จัดการ API Keys สำหรับระบบภายนอก</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[--radius-btn] bg-tu-primary px-4 py-2.5 text-sm font-medium text-tu-text-inverse hover:bg-tu-primary-hover transition-colors">
          <Plus size={18} />
          สร้าง API Key
        </button>
      </div>

      <div className="space-y-3">
        {apiClients.map((client) => (
          <div
            key={client.id}
            className="bg-tu-surface rounded-[--radius-card] border border-tu-border p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tu-primary-soft">
                <Key size={20} className="text-tu-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-tu-text-primary">{client.name}</h3>
                <code className="text-xs text-tu-text-muted font-mono">{client.key}</code>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-full bg-tu-success/10 text-tu-success font-medium">
                ใช้งาน
              </span>
              <span className="text-xs text-tu-text-muted">{client.created}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
