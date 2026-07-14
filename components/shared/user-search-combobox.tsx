"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  firstNameTh: string;
  lastNameTh: string;
  email: string;
  departmentName: string;
}

interface UserSearchComboboxProps {
  onSelect: (user: { userId: string; name: string; department: string }) => void;
  excludeUserIds: string[];
}

export function UserSearchCombobox({ onSelect, excludeUserIds }: UserSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  const search = useCallback(
    (q: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (q.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }
      setLoading(true);
      timerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/projects/users/search?q=${encodeURIComponent(q)}`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setResults(json.data.filter((u: SearchResult) => !excludeUserIds.includes(u.id)));
          } else {
            setResults([]);
          }
        } catch {
          setResults([]);
        }
        setLoading(false);
        setShowDropdown(true);
      }, 300);
    },
    [excludeUserIds]
  );

  const handleSelect = (user: SearchResult) => {
    onSelect({
      userId: user.id,
      name: `${user.firstNameTh} ${user.lastNameTh}`,
      department: user.departmentName,
    });
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1 rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 focus-within:border-tu-border-focus focus-within:ring-2 focus-within:ring-tu-border-focus/20 transition">
        <Search size={14} className="text-tu-text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder="ค้นหาผู้ใช้..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-tu-text-muted"
        />
        {loading && <Loader size={14} className="text-tu-text-muted animate-spin" />}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 w-full bg-tu-surface border border-tu-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto py-1">
          {results.length === 0 && !loading ? (
            <p className="text-xs text-tu-text-muted px-3 py-3 text-center">ไม่พบผู้ใช้</p>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-tu-surface-hover transition-colors"
              >
                <span className="font-medium text-tu-text-primary">
                  {user.firstNameTh} {user.lastNameTh}
                </span>
                <span className="text-tu-text-muted ml-2 text-xs">{user.departmentName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
