"use client";

import { useMemo, useState, type FormEvent } from "react";

import type { MockProject } from "@/components/editor/project-types";

type ProjectDialog = "create" | "rename" | "delete" | null;

interface ProjectFormState {
  name: string;
}

const INITIAL_PROJECTS: MockProject[] = [
  {
    id: "proj-ghost-commerce",
    name: "Ghost Commerce",
    slug: "ghost-commerce",
    access: "owner",
    updatedLabel: "Updated today",
  },
  {
    id: "proj-realtime-ops",
    name: "Realtime Ops Console",
    slug: "realtime-ops-console",
    access: "owner",
    updatedLabel: "Updated yesterday",
  },
  {
    id: "proj-observability-mesh",
    name: "Observability Mesh",
    slug: "observability-mesh",
    access: "collaborator",
    updatedLabel: "Shared workspace",
  },
];

function createSlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "new-project";
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>(INITIAL_PROJECTS);
  const [activeDialog, setActiveDialog] = useState<ProjectDialog>(null);
  const [selectedProject, setSelectedProject] = useState<MockProject | null>(
    null
  );
  const [form, setForm] = useState<ProjectFormState>({ name: "" });
  const [isLoading, setIsLoading] = useState(false);

  const ownedProjects = useMemo(
    () => projects.filter((project) => project.access === "owner"),
    [projects]
  );

  const sharedProjects = useMemo(
    () => projects.filter((project) => project.access === "collaborator"),
    [projects]
  );

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

  function openRenameDialog(project: MockProject) {
    if (project.access !== "owner") {
      return;
    }

    setSelectedProject(project);
    setForm({ name: project.name });
    setActiveDialog("rename");
  }

  function openDeleteDialog(project: MockProject) {
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

  function submitCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name || isLoading) {
      return;
    }

    setIsLoading(true);
    setProjects((currentProjects) => [
      {
        id: `proj-${slugPreview}-${Date.now()}`,
        name,
        slug: slugPreview,
        access: "owner",
        updatedLabel: "Created just now",
      },
      ...currentProjects,
    ]);
    closeDialog();
  }

  function submitRenameProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!selectedProject || !name || isLoading) {
      return;
    }

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              name,
              slug: createSlug(name),
              updatedLabel: "Renamed just now",
            }
          : project
      )
    );
    closeDialog();
  }

  function submitDeleteProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProject || isLoading) {
      return;
    }

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== selectedProject.id)
    );
    closeDialog();
  }

  return {
    activeDialog,
    formName: form.name,
    hasProjectName,
    isLoading,
    ownedProjects,
    selectedProject,
    sharedProjects,
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

export type ProjectDialogController = ReturnType<typeof useProjectDialogs>;
