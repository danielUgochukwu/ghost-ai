"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { EditorHome } from "@/components/editor/editor-home";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import { type ProjectData } from "@/components/editor/project-types";

interface EditorShellProps {
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
}

export function EditorShell({ ownedProjects, sharedProjects }: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const projectActions = useProjectActions();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <main className="relative flex-1 bg-base">
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Close projects sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-x-0 bottom-0 top-14 z-20 bg-base/70 backdrop-blur-sm md:hidden"
          />
        ) : null}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          onNewProject={projectActions.openCreateDialog}
          onRenameProject={projectActions.openRenameDialog}
          onDeleteProject={projectActions.openDeleteDialog}
        />
        <EditorHome onNewProject={projectActions.openCreateDialog} />
      </main>
      <ProjectDialogs controller={projectActions} />
    </div>
  );
}
