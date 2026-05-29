"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectData } from "@/components/editor/project-types";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
  onNewProject: () => void;
  onRenameProject: (project: ProjectData) => void;
  onDeleteProject: (project: ProjectData) => void;
  className?: string;
}

function EmptyProjectState({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-surface-border-subtle bg-subtle/60 px-6 text-center text-sm text-copy-muted">
      {label}
    </div>
  );
}

interface ProjectListProps {
  projects: ProjectData[];
  emptyLabel: string;
  canManage: boolean;
  onRenameProject: (project: ProjectData) => void;
  onDeleteProject: (project: ProjectData) => void;
}

function ProjectList({
  projects,
  emptyLabel,
  canManage,
  onRenameProject,
  onDeleteProject,
}: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyProjectState label={emptyLabel} />;
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-copy-primary">
              {project.name}
            </p>
            <p className="mt-1 truncate text-xs text-copy-muted">
              {project.updatedLabel}
            </p>
          </div>

          {canManage ? (
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename ${project.name}`}
                onClick={() => onRenameProject(project)}
                className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${project.name}`}
                onClick={() => onDeleteProject(project)}
                className="text-copy-muted hover:bg-subtle hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects = [],
  sharedProjects = [],
  onNewProject,
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  return (
    <aside
      id="project-sidebar"
      aria-label="Project sidebar"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={cn(
        "fixed left-4 top-[4.5rem] z-30 flex h-[calc(100dvh-5.5rem)] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-surface-border bg-sidebar p-4 text-copy-primary shadow-2xl backdrop-blur-xl transition-transform duration-200 ease-out",
        isOpen
          ? "translate-x-0"
          : "-translate-x-[calc(100%+2rem)] pointer-events-none",
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
        <TabsContent value="my-projects" className="mt-4 min-h-0 overflow-y-auto pr-1">
          <ProjectList
            projects={ownedProjects}
            emptyLabel="No projects yet."
            canManage
            onRenameProject={onRenameProject}
            onDeleteProject={onDeleteProject}
          />
        </TabsContent>
        <TabsContent value="shared" className="mt-4 min-h-0 overflow-y-auto pr-1">
          <ProjectList
            projects={sharedProjects}
            emptyLabel="No shared projects yet."
            canManage={false}
            onRenameProject={onRenameProject}
            onDeleteProject={onDeleteProject}
          />
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
  );
}
