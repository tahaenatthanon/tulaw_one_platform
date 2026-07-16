"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Sync a state value to a URL search param.
 * Returns [value, setter] like useState, but the value persists in the URL.
 * Falls back to localStorage when the router is not available (e.g., during SSR).
 */
export function useUrlState<T extends string>(
  key: string,
  defaultValue: T
): [T, (val: string) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawValue = searchParams?.get(key);
  const value = (rawValue ?? defaultValue) as T;

  const setValue = useCallback(
    (newVal: T) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (newVal === defaultValue || !newVal) {
        params.delete(key);
      } else {
        params.set(key, newVal);
      }
      const query = params.toString();
      const href = `${pathname}${query ? "?" + query : ""}`;
      router.push(href, { scroll: false });
    },
    [router, searchParams, pathname, key, defaultValue]
  );

  return [value, setValue as (val: string) => void];
}

/**
 * Sync a boolean state to a URL search param.
 * Returns [value, setter].
 */
export function useUrlBoolean(
  key: string,
  defaultValue = false
): [boolean, (val: boolean) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const rawValue = searchParams?.get(key);
  const value = rawValue !== null ? rawValue === "1" : defaultValue;

  const setValue = useCallback(
    (newVal: boolean) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (newVal) {
        params.set(key, "1");
      } else {
        params.delete(key);
      }
      const query = params.toString();
      const href = `${pathname}${query ? "?" + query : ""}`;
      router.push(href, { scroll: false });
    },
    [router, searchParams, pathname, key]
  );

  return [value, setValue];
}
