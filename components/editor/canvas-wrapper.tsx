"use client";

import { Component, type ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react";
import { CanvasFlow } from "@/components/editor/canvas-flow";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { SaveStatus } from "@/hooks/use-autosave";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class LiveblocksErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center text-copy-muted">
          <p>Unable to connect to the canvas. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CanvasWrapperProps {
  roomId: string;
  pendingTemplate?: CanvasTemplate | null;
  onTemplateApplied?: () => void;
  onSaveReady?: (fn: () => void) => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
}

export function CanvasWrapper({ roomId, pendingTemplate, onTemplateApplied, onSaveReady, onSaveStatusChange }: CanvasWrapperProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <LiveblocksErrorBoundary>
          <ClientSideSuspense
            fallback={
              <div className="flex h-full items-center justify-center text-copy-muted">
                <p>Loading canvas…</p>
              </div>
            }
          >
            {() => (
              <CanvasFlow
                projectId={roomId}
                pendingTemplate={pendingTemplate}
                onTemplateApplied={onTemplateApplied}
                onSaveReady={onSaveReady}
                onSaveStatusChange={onSaveStatusChange}
              />
            )}
          </ClientSideSuspense>
        </LiveblocksErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
