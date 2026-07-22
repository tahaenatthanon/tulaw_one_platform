"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-tu-border bg-tu-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-tu-border-focus focus:ring-2 focus:ring-tu-border-focus/20 outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
