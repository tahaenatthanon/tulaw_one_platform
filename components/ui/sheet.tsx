"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  children: React.ReactNode
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-y-0 right-0 z-50 flex">{children}</div>
    </div>
  )
}

function SheetContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full sm:max-w-[440px] bg-tu-surface h-full shadow-xl overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
}

export { Sheet, SheetContent, SheetHeader, SheetTitle }
