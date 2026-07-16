"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonHighlightProps {
  data: unknown;
  maxHeight?: number;
  className?: string;
  label?: string;
}

function highlightJson(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(?:[^"\\]|\\.)*")\s*:/g,
      '<span class="json-key">$1</span>:'
    )
    .replace(
      /:\s*("(?:[^"\\]|\\.)*")/g,
      ': <span class="json-string">$1</span>'
    )
    .replace(
      /:\s*(-?\d+\.?\d*)/g,
      ': <span class="json-number">$1</span>'
    )
    .replace(
      /:\s*(true|false)/g,
      ': <span class="json-boolean">$1</span>'
    )
    .replace(
      /:\s*(null)/g,
      ': <span class="json-null">$1</span>'
    );
}

export function JsonHighlight({ data, maxHeight = 200, className, label }: JsonHighlightProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (data === null || data === undefined || data === "" || data === "N/A") {
    return (
      <div className={cn("rounded-lg bg-tu-bg p-4 text-sm text-tu-text-muted italic", className)}>
        N/A
      </div>
    );
  }

  const jsonStr = typeof data === "string"
    ? (() => { try { return JSON.stringify(JSON.parse(data), null, 2); } catch { return data; } })()
    : JSON.stringify(data, null, 2);

  const highlighted = highlightJson(jsonStr);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("rounded-lg border border-tu-border bg-tu-bg overflow-hidden", className)}>
      {label && (
        <div className="flex items-center justify-between px-3 py-2 bg-tu-surface border-b border-tu-border">
          <span className="text-xs font-medium text-tu-text-secondary">{label}</span>
          <button onClick={handleCopy} className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-tu-text-muted hover:bg-tu-surface-hover transition-colors">
            {copied ? <Check size={12} className="text-tu-success" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      <pre
        className={cn(
          "p-3 text-xs font-mono leading-relaxed overflow-auto transition-all",
          !expanded && `max-h-[${maxHeight}px]`
        )}
        style={{ maxHeight: expanded ? "none" : maxHeight }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      {jsonStr.split("\n").length > 15 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-1 border-t border-tu-border bg-tu-surface px-3 py-1.5 text-xs text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
        >
          {expanded ? (
            <><ChevronDown size={14} />Collapse</>
          ) : (
            <><ChevronRight size={14} />Expand</>
          )}
        </button>
      )}
    </div>
  );
}
