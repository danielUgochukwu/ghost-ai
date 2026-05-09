"use client"

import type * as React from "react"

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface EditorDialogContentProps
  extends React.ComponentProps<typeof DialogContent> {
  title: string
  description?: string
  footerActions?: React.ReactNode
}

export function EditorDialogContent({
  title,
  description,
  footerActions,
  children,
  className,
  ...props
}: EditorDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "gap-6 rounded-3xl border border-surface-border bg-elevated p-6 text-copy-primary shadow-2xl ring-0 sm:max-w-md",
        className
      )}
      {...props}
    >
      <DialogHeader className="gap-2">
        <DialogTitle className="text-lg text-copy-primary">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="text-copy-muted">
            {description}
          </DialogDescription>
        ) : null}
      </DialogHeader>

      {children}

      {footerActions ? (
        <DialogFooter className="mx-0 mb-0 rounded-none border-surface-border bg-transparent p-0">
          {footerActions}
        </DialogFooter>
      ) : null}
    </DialogContent>
  )
}
