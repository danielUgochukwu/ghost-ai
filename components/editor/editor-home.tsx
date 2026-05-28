"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorHomeProps {
  onNewProject: () => void;
}

export function EditorHome({ onNewProject }: EditorHomeProps) {
  return (
    <section className="flex h-full min-h-[calc(100dvh-3.5rem)] items-center justify-center px-6 py-12 text-center">
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-normal text-copy-primary sm:text-4xl">
          Create a project or open an existing one
        </h1>
        <p className="mt-4 text-sm leading-6 text-copy-muted sm:text-base">
          Start a new architecture workspace, or choose a project from the
          sidebar.
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-6 gap-2"
          onClick={onNewProject}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </section>
  );
}
