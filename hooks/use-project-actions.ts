"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { type ProjectData } from "@/components/editor/project-types";

type ProjectDialog = "create" | "rename" | "delete" | null;

interface ProjectFormState {
  name: string;
}

function createSlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "new-project";
}

function generateShortId() {
  return Math.random().toString(36).substring(2, 6);
}

export function useProjectActions() {
  const router = useRouter();
  const [activeDialog, setActiveDialog] = useState<ProjectDialog>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [form, setForm] = useState<ProjectFormState>({ name: "" });
  const [isLoading, setIsLoading] = useState(false);

  const slugPreview = useMemo(() => createSlug(form.name), [form.name]);
  const hasProjectName = form.name.trim().length > 0;

  function closeDialog() {
    setActiveDialog(null);
    setSelectedProject(null);
    setForm({ name: "" });
    setIsLoading(false);
  }

  function openCreateDialog() {
    setSelectedProject(null);
    setForm({ name: "" });
    setActiveDialog("create");
  }

  function openRenameDialog(project: ProjectData) {
    if (project.access !== "owner") {
      return;
    }

    setSelectedProject(project);
    setForm({ name: project.name });
    setActiveDialog("rename");
  }

  function openDeleteDialog(project: ProjectData) {
    if (project.access !== "owner") {
      return;
    }

    setSelectedProject(project);
    setForm({ name: project.name });
    setActiveDialog("delete");
  }

  function setProjectName(name: string) {
    setForm({ name });
  }

  async function submitCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name || isLoading) {
      return;
    }

    setIsLoading(true);
    const roomId = `proj-${slugPreview}-${generateShortId()}`;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: roomId, name }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      router.push(`/editor/${roomId}`);
      closeDialog();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  async function submitRenameProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!selectedProject || !name || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      router.refresh();
      closeDialog();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  async function submitDeleteProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProject || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      // If we were inside the editor and deleted the active project,
      // we'd redirect to `/editor`. Here we are on the editor home,
      // so we just refresh.
      router.refresh();
      closeDialog();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return {
    activeDialog,
    formName: form.name,
    hasProjectName,
    isLoading,
    selectedProject,
    slugPreview,
    closeDialog,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    setProjectName,
    submitCreateProject,
    submitDeleteProject,
    submitRenameProject,
  };
}

export type ProjectActionsController = ReturnType<typeof useProjectActions>;
