"use client"

import { UserButton } from "@clerk/nextjs"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  projectName?: string
  actions?: React.ReactNode
  className?: string
  showUserButton?: boolean
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  actions,
  className,
  showUserButton = true,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header
      className={cn(
        "grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-surface-border bg-surface px-4 text-copy-primary",
        className
      )}
    >
      <div className="flex items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
          aria-controls="project-sidebar"
          onClick={onSidebarToggle}
          className="text-copy-secondary hover:bg-subtle hover:text-copy-primary"
        >
          <SidebarIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-w-0 items-center justify-center">
        {projectName && (
          <span className="truncate text-sm font-medium text-copy-primary">
            {projectName}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {actions}
        {showUserButton && <UserButton />}
      </div>
    </header>
  );
}
