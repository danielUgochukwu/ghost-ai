"use client";

import { useEffect } from "react";

interface ZoomControls {
  zoomIn(options?: { duration?: number }): void;
  zoomOut(options?: { duration?: number }): void;
}

interface UseKeyboardShortcutsOptions {
  rfInstance: ZoomControls | null;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({ rfInstance, undo, redo }: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (isEditableTarget(e.target)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.shiftKey && (e.key === "Z" || e.key === "z")) {
        e.preventDefault();
        redo();
        return;
      }

      if (ctrl && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }

      if (ctrl && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        undo();
        return;
      }

      if (!ctrl) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          rfInstance?.zoomIn({ duration: 200 });
          return;
        }
        if (e.key === "-") {
          e.preventDefault();
          rfInstance?.zoomOut({ duration: 200 });
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rfInstance, undo, redo]);
}
