"use client";

import { useState } from "react";
import { Share2, Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { useProjectActions } from "@/hooks/use-project-actions";
import { type ProjectData } from "@/components/editor/project-types";
import { Button } from "@/components/ui/button";

interface ProjectOwner {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

interface WorkspaceShellProps {
  project: {
    id: string;
    name: string;
  };
  ownedProjects: ProjectData[];
  sharedProjects: ProjectData[];
  isOwner: boolean;
  projectOwner: ProjectOwner;
}

export function WorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
  isOwner,
  projectOwner,
}: WorkspaceShellProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const projectActions = useProjectActions();

  const RightSidebarIcon = isRightSidebarOpen ? PanelRightClose : PanelRightOpen;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isLeftSidebarOpen}
        onSidebarToggle={() => setIsLeftSidebarOpen((isOpen) => !isOpen)}
        projectName={project.name}
        actions={
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex gap-2"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className={isRightSidebarOpen ? "bg-subtle" : ""}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="sm:hidden"
            >
              <RightSidebarIcon className="h-4 w-4" />
            </Button>
          </>
        }
      />
      <main className="relative flex flex-1 overflow-hidden bg-base">
        {isLeftSidebarOpen ? (
          <button
            type="button"
            aria-label="Close projects sidebar"
            onClick={() => setIsLeftSidebarOpen(false)}
            className="fixed inset-x-0 bottom-0 top-14 z-20 bg-base/70 backdrop-blur-sm md:hidden"
          />
        ) : null}
        
        <ProjectSidebar
          isOpen={isLeftSidebarOpen}
          onClose={() => setIsLeftSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          onNewProject={projectActions.openCreateDialog}
          onRenameProject={projectActions.openRenameDialog}
          onDeleteProject={projectActions.openDeleteDialog}
          currentRoomId={project.id}
        />

        <div className="flex-1 overflow-hidden">
          <CanvasWrapper roomId={project.id} />
        </div>

        {/* Right Sidebar Placeholder */}
        {isRightSidebarOpen && (
          <aside className="w-80 border-l border-surface-border bg-surface p-4 hidden md:block">
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <div>
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-accent" />
                <p>AI Assistant Placeholder</p>
              </div>
            </div>
          </aside>
        )}
      </main>
      <ProjectDialogs controller={projectActions} />
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        projectId={project.id}
        isOwner={isOwner}
        projectOwner={projectOwner}
      />
    </div>
  );
}
