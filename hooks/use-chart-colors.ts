"use client";

import { useEffect, useState } from "react";

export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  info: string;
  error: string;
  muted: string;
  secondaryActive: string;
}

const DEFAULT_COLORS: ChartColors = {
  primary: "#A31D1D",
  secondary: "#FDB813",
  success: "#16A34A",
  warning: "#E5A800",
  info: "#0284C7",
  error: "#DC2626",
  muted: "#9CA3AF",
  secondaryActive: "#C99200",
};

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(DEFAULT_COLORS);

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      primary: style.getPropertyValue("--tu-primary").trim() || DEFAULT_COLORS.primary,
      secondary: style.getPropertyValue("--tu-secondary").trim() || DEFAULT_COLORS.secondary,
      success: style.getPropertyValue("--tu-success").trim() || DEFAULT_COLORS.success,
      warning: style.getPropertyValue("--tu-warning").trim() || DEFAULT_COLORS.warning,
      info: style.getPropertyValue("--tu-info").trim() || DEFAULT_COLORS.info,
      error: style.getPropertyValue("--tu-error").trim() || DEFAULT_COLORS.error,
      muted: style.getPropertyValue("--tu-text-muted").trim() || DEFAULT_COLORS.muted,
      secondaryActive: style.getPropertyValue("--tu-secondary-active").trim() || DEFAULT_COLORS.secondaryActive,
    });
  }, []);

  return colors;
}

/** Returns an array of chart colors for multi-series charts */
export function useChartPalette(): string[] {
  const c = useChartColors();
  return [c.primary, c.info, c.secondary, c.success, c.warning, c.muted];
}
