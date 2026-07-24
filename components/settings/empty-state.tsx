"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SearchX, Key, Plug, Database } from "lucide-react";

type EmptyStateType = "search" | "api-keys" | "integration" | "general";

const EmptyStateConfig: Record<EmptyStateType, { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description: string }> = {
  search: { icon: SearchX, title: "ไม่พบการตั้งค่าที่ค้นหา", description: "ลองใช้คำค้นหาอื่น หรือตรวจสอบตัวสะกด" },
  "api-keys": { icon: Key, title: "ยังไม่มี API Key", description: "สร้าง API Key เพื่อเชื่อมต่อระบบภายนอก" },
  integration: { icon: Plug, title: "ยังไม่มีการเชื่อมต่อระบบภายนอก", description: "เพิ่มการเชื่อมต่อเพื่อใช้งานร่วมกับระบบอื่น" },
  general: { icon: Database, title: "ไม่มีข้อมูล", description: "ยังไม่มีข้อมูลในส่วนนี้" },
};

interface EmptyStateProps {
  type?: EmptyStateType;
  /** Override defaults with custom content */
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Reusable empty state component.
 * Used across settings for No Search Results, No API Keys, No Integration, No Data.
 */
export function EmptyState({ type = "general", icon, title, description, action, className }: EmptyStateProps) {
  const config = EmptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon ? (
        <div className="mb-4 text-tu-text-muted">{icon}</div>
      ) : (
        <Icon size={48} className="text-tu-text-muted mb-4" strokeWidth={1.5} />
      )}
      <h3 className="text-sm font-semibold text-tu-text-primary mb-1">
        {title ?? config.title}
      </h3>
      <p className="text-xs text-tu-text-muted mb-4 max-w-sm">
        {description ?? config.description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
