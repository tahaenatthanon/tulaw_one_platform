"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, required, helperText, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-tu-text-secondary">
        {label}
        {required && <span className="text-tu-error ml-0.5">*</span>}
      </label>
      {children}
      {helperText && !error && <p className="text-xs text-tu-text-muted">{helperText}</p>}
      {error && <p className="text-xs text-tu-error">{error}</p>}
    </div>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function FormInput({ label, error, required, helperText, className, ...props }: FormInputProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText} className={className}>
      <Input {...props} className={cn(error && "border-tu-error focus:ring-tu-error/20", className)} />
    </FormField>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function FormTextarea({ label, error, required, helperText, className, ...props }: FormTextareaProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <textarea
        {...props}
        className={cn(
          "flex min-h-[80px] w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm text-tu-text-primary placeholder:text-tu-text-muted focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition resize-y",
          error && "border-tu-error",
          className
        )}
      />
    </FormField>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, error, required, helperText, options, className, ...props }: FormSelectProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <select
        {...props}
        className={cn(
          "flex h-10 w-full rounded-[--radius-input] border border-tu-border bg-tu-surface px-3 py-2 text-sm text-tu-text-primary focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none transition",
          error && "border-tu-error",
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  );
}
