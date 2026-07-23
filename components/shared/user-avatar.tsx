"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

/** Extract initials from a Thai name (handles prefixes like นาย, นางสาว, รศ., etc.) */
function initials(name: string): string {
  const parts = name
    .replace(/^(รศ|ผศ|ศ|อ|ดร|นาย|นางสาว|นาง)\.?\s*/g, "")
    .split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Map a user id/email/name to a consistent color from the design palette */
const AVATAR_COLORS = [
  "#A31D1D", "#D97706", "#2563EB", "#16A34A",
  "#7C3AED", "#EA580C", "#0891B2", "#DB2777",
  "#0EA5E9", "#65A30D",
];

export function getAvatarColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function UserAvatar({ name, color, size = 40, className }: UserAvatarProps) {
  const bgColor = color ?? getAvatarColor(name);

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-white shadow-sm ring-2 ring-white",
        className,
      )}
      style={{
        backgroundColor: bgColor,
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
    >
      {initials(name)}
    </div>
  );
}
