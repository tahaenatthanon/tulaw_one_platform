"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
}

export function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  className,
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[var(--tu-surface)] shadow-2xl",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--tu-border)] px-6 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[var(--tu-text-primary)]">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--tu-text-muted)]">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--tu-text-muted)] hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-auto px-6 py-5">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--tu-border)] bg-slate-50/60 px-6 py-3">
          {footer}
        </div>
      </div>
    </div>
  );
}
