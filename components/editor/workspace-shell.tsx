"use client";

import { useState, useRef } from "react";
import { Share2, Sparkles, LayoutTemplate, Save } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import { type ProjectData } from "@/components/editor/project-types";
import { Button } from "@/components/ui/button";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { type SaveStatus } from "@/hooks/use-autosave";

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
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveFnRef = useRef<(() => void) | null>(null);
  const projectActions = useProjectActions();

  const saveButtonLabel =
    saveStatus === "saving" ? "Saving..." :
    saveStatus === "saved" ? "Saved" :
    saveStatus === "error" ? "Error" :
    "Save";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isLeftSidebarOpen}
        onSidebarToggle={() => setIsLeftSidebarOpen((isOpen) => !isOpen)}
        projectName={project.name}
        showUserButton={false}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex gap-2"
              disabled={saveStatus === "saving"}
              onClick={() => saveFnRef.current?.()}
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{saveButtonLabel}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex gap-2"
              onClick={() => setIsTemplatesModalOpen(true)}
            >
              <LayoutTemplate className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex gap-2"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className={isRightSidebarOpen ? "flex gap-2" : ""}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Ai</span>
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
          <CanvasWrapper
            roomId={project.id}
            pendingTemplate={pendingTemplate}
            onTemplateApplied={() => setPendingTemplate(null)}
            onSaveReady={(fn) => {
              saveFnRef.current = fn;
            }}
            onSaveStatusChange={setSaveStatus}
          />
        </div>

        <AiSidebar
          isOpen={isRightSidebarOpen}
          onClose={() => setIsRightSidebarOpen(false)}
        />
      </main>
      <ProjectDialogs controller={projectActions} />
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        projectId={project.id}
        isOwner={isOwner}
        projectOwner={projectOwner}
      />
      <StarterTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onImport={(template) => {
          setPendingTemplate(template);
          setIsTemplatesModalOpen(false);
        }}
      />
    </div>
  );
}
