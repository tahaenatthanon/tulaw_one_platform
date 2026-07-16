"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/fetcher";

interface ImportResult {
  message: string;
  updated: number;
  skipped: number;
  errors?: string[];
}

interface UserImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function UserImportDialog({ isOpen, onClose, onComplete }: UserImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
        return;
      }
      setFile(selected);
      setError(null);
      setResult(null);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await fetchApi<ImportResult>("/api/users/import-csv", {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set content-type for FormData
      });
      setResult(data);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-tu-border">
            <h3 className="text-base font-semibold text-tu-text-primary">Import CSV</h3>
            <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-tu-surface-hover">
              <X size={18} className="text-tu-text-secondary" />
            </button>
          </div>

          <div className="px-5 py-4 space-y-4">
            <p className="text-xs text-tu-text-secondary">
              อัปโหลดไฟล์ CSV เพื่อกำหนด Role หรืออัปเดตข้อมูลผู้ใช้<br />
              <strong>ไม่รองรับการสร้าง LDAP User ใหม่</strong> ผ่าน CSV Import
            </p>
            <p className="text-xs text-tu-text-muted">
              รูปแบบ: email, role (สูงสุด 500 แถว, ขนาดไฟล์ไม่เกิน 5MB)
            </p>

            {/* File drop zone */}
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
                file ? "border-tu-primary bg-tu-primary-soft/30" : "border-tu-border hover:border-tu-primary/50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <>
                  <FileText size={32} className="text-tu-primary mb-2" />
                  <p className="text-sm font-medium text-tu-text-primary">{file.name}</p>
                  <p className="text-xs text-tu-text-muted mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-tu-text-muted mb-2" />
                  <p className="text-sm text-tu-text-secondary">คลิกเพื่อเลือกไฟล์ CSV</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-tu-error bg-tu-error/5 rounded-lg px-3 py-2">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {result && (
              <div className="rounded-lg bg-tu-success/5 border border-tu-success/20 px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-tu-success mb-1">
                  <CheckCircle size={14} />
                  {result.message}
                </div>
                <p className="text-xs text-tu-text-secondary">อัปเดต: {result.updated} | ข้าม: {result.skipped}</p>
                {result.errors?.map((err, i) => (
                  <p key={i} className="text-xs text-tu-warning mt-1">{err}</p>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-5 py-3 border-t border-tu-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-tu-border px-3 py-1.5 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="rounded-md bg-tu-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังอัปโหลด..." : "อัปโหลด"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
