"use client";

import { Dialog, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorDialogContent } from "@/components/editor/editor-dialog";
import type { ProjectDialogController } from "@/hooks/use-project-dialogs";

interface ProjectDialogsProps {
  controller: ProjectDialogController;
}

export function ProjectDialogs({ controller }: ProjectDialogsProps) {
  const isOpen = controller.activeDialog !== null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          controller.closeDialog();
        }
      }}
    >
      {controller.activeDialog === "create" ? (
        <EditorDialogContent
          title="Create Project"
          description="Name the architecture workspace before opening the canvas."
          footerActions={
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="create-project-form"
                disabled={!controller.hasProjectName || controller.isLoading}
              >
                Create Project
              </Button>
            </>
          }
        >
          <form
            id="create-project-form"
            className="space-y-4"
            onSubmit={controller.submitCreateProject}
          >
            <div className="space-y-2">
              <label
                htmlFor="create-project-name"
                className="text-sm font-medium text-copy-secondary"
              >
                Project name
              </label>
              <Input
                id="create-project-name"
                name="projectName"
                value={controller.formName}
                onChange={(event) =>
                  controller.setProjectName(event.target.value)
                }
                placeholder="Payments platform"
                className="border-surface-border-subtle bg-subtle/40 text-copy-primary placeholder:text-copy-faint"
              />
            </div>

            <div className="rounded-xl border border-surface-border bg-surface px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-normal text-copy-faint">
                Slug preview
              </p>
              <p className="mt-1 break-all font-mono text-sm text-brand">
                {controller.slugPreview}
              </p>
            </div>
          </form>
        </EditorDialogContent>
      ) : null}

      {controller.activeDialog === "rename" && controller.selectedProject ? (
        <EditorDialogContent
          title="Rename Project"
          description={`Current project name: ${controller.selectedProject.name}`}
          footerActions={
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="rename-project-form"
                disabled={!controller.hasProjectName || controller.isLoading}
              >
                Rename Project
              </Button>
            </>
          }
        >
          <form
            id="rename-project-form"
            className="space-y-2"
            onSubmit={controller.submitRenameProject}
          >
            <label
              htmlFor="rename-project-name"
              className="text-sm font-medium text-copy-secondary"
            >
              Project name
            </label>
            <Input
              id="rename-project-name"
              name="projectName"
              value={controller.formName}
              onChange={(event) =>
                controller.setProjectName(event.target.value)
              }
              autoFocus
              className="border-surface-border-subtle bg-subtle/40 text-copy-primary"
            />
          </form>
        </EditorDialogContent>
      ) : null}

      {controller.activeDialog === "delete" && controller.selectedProject ? (
        <EditorDialogContent
          title="Delete Project"
          description={`Delete ${controller.selectedProject.name}? This only removes the mock project from this screen.`}
          footerActions={
            <>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form="delete-project-form"
                variant="destructive"
                disabled={controller.isLoading}
              >
                Delete Project
              </Button>
            </>
          }
        >
          <form
            id="delete-project-form"
            onSubmit={controller.submitDeleteProject}
          />
        </EditorDialogContent>
      ) : null}
    </Dialog>
  );
}
