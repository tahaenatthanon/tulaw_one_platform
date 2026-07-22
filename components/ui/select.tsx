"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value: string
  onValueChange: (v: string) => void
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: (v: boolean) => void
}>({ value: "", onValueChange: () => {}, open: false, setOpen: () => {} })

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none",
        className
      )}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
  const { value } = React.useContext(SelectContext)
  return <span className={!value ? "text-muted-foreground" : ""}>{children ?? value ?? placeholder}</span>
}

function SelectContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = React.useContext(SelectContext)
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        className={cn(
          "absolute z-50 mt-1 w-full rounded-xl border border-tu-border bg-tu-surface p-1 shadow-lg max-h-60 overflow-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

function SelectItem({
  value: itemValue,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value, onValueChange, setOpen } = React.useContext(SelectContext)
  return (
    <div
      onClick={() => { onValueChange(itemValue); setOpen(false) }}
      className={cn(
        "cursor-pointer rounded-lg px-2 py-1.5 text-sm hover:bg-tu-surface-hover transition-colors",
        value === itemValue && "bg-tu-primary/10 text-tu-primary font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
