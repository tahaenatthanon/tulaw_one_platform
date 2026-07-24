"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const ALLOWED_EXTENSIONS = ".png, .jpg, .jpeg, .svg, .webp";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

interface LogoUploadProps {
  currentLogo?: string | null;
  onLogoChange: (file: File | null) => void;
  /** Preview URL from parent (object URL) */
  previewUrl?: string | null;
  disabled?: boolean;
}

/**
 * Logo upload component with file validation, preview, and error handling.
 * Supports PNG, JPG, SVG, WebP up to 2MB.
 */
export function LogoUpload({ currentLogo, onLogoChange, previewUrl, disabled }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const displaySrc = previewUrl || currentLogo || null;

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `ประเภทไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ ${ALLOWED_EXTENSIONS}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `ขนาดไฟล์เกินกำหนด กรุณาเลือกไฟล์ขนาดไม่เกิน 2MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onLogoChange(file);
    },
    [validateFile, onLogoChange],
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    setError(null);
    onLogoChange(null);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS}
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="เลือกไฟล์โลโก้"
        disabled={disabled}
      />

      {/* Preview / Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors
          ${isDragOver ? "border-tu-primary bg-tu-primary-soft" : "border-tu-border bg-tu-bg hover:border-tu-border-focus"}
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {/* Logo Preview / Placeholder */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-tu-border bg-tu-surface overflow-hidden">
          {displaySrc ? (
            <img
              src={displaySrc}
              alt="Logo Preview"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Upload size={28} className="text-tu-text-muted" />
          )}
        </div>

        {/* Info & Actions */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-tu-text-muted mb-2">
            ขนาดแนะนำ: 512×512 px, PNG พื้นหลังโปร่งใส
            <br />
            รองรับไฟล์ PNG, JPG, SVG, WebP — ขนาดสูงสุด 2MB
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleBrowse}
              className="rounded-[--radius-btn] bg-tu-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-tu-primary-hover transition-colors"
            >
              <Upload size={12} className="inline mr-1" />
              {displaySrc ? "เปลี่ยนโลโก้" : "อัปโหลดโลโก้"}
            </button>
            {displaySrc && (
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-[--radius-btn] border border-tu-border px-3 py-1.5 text-xs font-medium text-tu-text-secondary hover:bg-tu-surface-hover hover:text-tu-error transition-colors"
              >
                <X size={12} className="inline mr-1" />
                ลบโลโก้
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-tu-error/30 bg-tu-error/10 px-3 py-2 text-xs text-tu-error">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto shrink-0 hover:text-tu-error/70">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Validation Passed */}
      {!error && displaySrc && !previewUrl?.startsWith("blob:") && (
        <div className="flex items-center gap-2 rounded-lg border border-tu-success/30 bg-tu-success/10 px-3 py-2 text-xs text-tu-success">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>โลโก้ปัจจุบันถูกบันทึกแล้ว</span>
        </div>
      )}
    </div>
  );
}