"use client"

import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject?: () => void
  className?: string
}

function EmptyProjectState({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-surface-border-subtle bg-subtle/60 px-6 text-center text-sm text-copy-muted">
      {label}
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  className,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-label="Project sidebar"
      aria-hidden={!isOpen}
      className={cn(
        "fixed left-4 top-[4.5rem] z-30 flex h-[calc(100dvh-5.5rem)] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-surface-border bg-sidebar p-4 text-copy-primary shadow-2xl backdrop-blur-xl transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close projects sidebar"
          onClick={onClose}
          className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="mt-5 min-h-0 flex-1">
        <TabsList className="grid w-full grid-cols-2 bg-subtle">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="mt-4">
          <EmptyProjectState label="No projects yet." />
        </TabsContent>
        <TabsContent value="shared" className="mt-4">
          <EmptyProjectState label="No shared projects yet." />
        </TabsContent>
      </Tabs>

      <Button
        type="button"
        className="mt-4 w-full gap-2"
        onClick={onNewProject}
      >
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </aside>
  )
}
