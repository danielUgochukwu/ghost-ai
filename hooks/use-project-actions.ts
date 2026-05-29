"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

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
  const params = useParams<{ projectId?: string }>();
  const [activeDialog, setActiveDialog] = useState<ProjectDialog>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );
  const [form, setForm] = useState<ProjectFormState>({ name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugPreview = useMemo(() => createSlug(form.name), [form.name]);
  const hasProjectName = form.name.trim().length > 0;

  function closeDialog() {
    setActiveDialog(null);
    setSelectedProject(null);
    setForm({ name: "" });
    setIsLoading(false);
    setError(null);
  }

  function openCreateDialog() {
    setSelectedProject(null);
    setForm({ name: "" });
    setError(null);
    setActiveDialog("create");
  }

  function openRenameDialog(project: ProjectData) {
    if (project.access !== "owner") {
      return;
    }

    setSelectedProject(project);
    setForm({ name: project.name });
    setError(null);
    setActiveDialog("rename");
  }

  function openDeleteDialog(project: ProjectData) {
    if (project.access !== "owner") {
      return;
    }

    setSelectedProject(project);
    setForm({ name: project.name });
    setError(null);
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
    setError(null);
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
        let errorMessage = "Failed to create project";
        try {
          const data = await response.json();
          if (data.error) errorMessage = data.error;
        } catch {}
        throw new Error(errorMessage);
      }

      router.push(`/editor/${roomId}`);
      closeDialog();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create project");
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
    setError(null);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to rename project";
        try {
          const data = await response.json();
          if (data.error) errorMessage = data.error;
        } catch {}
        throw new Error(errorMessage);
      }

      router.refresh();
      closeDialog();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to rename project");
      setIsLoading(false);
    }
  }

  async function submitDeleteProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProject || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete project";
        try {
          const data = await response.json();
          if (data.error) errorMessage = data.error;
        } catch {}
        throw new Error(errorMessage);
      }

      // If we were inside the editor and deleted the active project,
      // redirect to `/editor`. Otherwise, just refresh.
      if (params.projectId === selectedProject.id) {
        router.push("/editor");
      } else {
        router.refresh();
      }
      closeDialog();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete project");
      setIsLoading(false);
    }
  }

  return {
    activeDialog,
    formName: form.name,
    hasProjectName,
    error,
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
