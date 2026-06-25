"use client";

import "@xyflow/react/dist/style.css";

import { useRef, useCallback, useEffect } from "react";
import { useUpdateMyPresence } from "@liveblocks/react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  ConnectionMode,
  useReactFlow,
  useNodes,
  useEdges,
  type ReactFlowInstance,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, CloudOff, CheckCircle2, Loader2 } from "lucide-react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { ShapePanel, SHAPE_DRAG_TYPE, type ShapeDragPayload } from "@/components/editor/shape-panel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { PresenceAvatars } from "@/components/editor/presence-avatars";
import { LiveCursors } from "@/components/editor/live-cursors";
import { useAutosave, type SaveStatus } from "@/hooks/use-autosave";

const nodeTypes = { canvasNode: CanvasNodeRenderer };
const edgeTypes = { canvasEdge: CanvasEdgeRenderer };

let nodeCounter = 0;

// Rendered inside the ReactFlow tree so it can use useReactFlow()
function ControlBar() {
  const rf = useReactFlow<CanvasNode, CanvasEdge>();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ rfInstance: rf, undo, redo });

  return (
    <Panel position="bottom-left" className="mb-2 ml-2">
      <div className="flex items-center rounded-full bg-elevated border border-surface-border shadow-lg px-1 py-1">
        <button
          onClick={() => rf.zoomOut({ duration: 200 })}
          className="flex items-center justify-center w-8 h-8 rounded-full text-copy-secondary hover:text-copy-primary hover:bg-surface-hover transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} />
        </button>

        <button
          onClick={() => rf.fitView({ duration: 300, padding: 0.1 })}
          className="flex items-center justify-center w-8 h-8 rounded-full text-copy-secondary hover:text-copy-primary hover:bg-surface-hover transition-colors"
          aria-label="Fit view"
        >
          <Maximize2 size={14} />
        </button>

        <button
          onClick={() => rf.zoomIn({ duration: 200 })}
          className="flex items-center justify-center w-8 h-8 rounded-full text-copy-secondary hover:text-copy-primary hover:bg-surface-hover transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} />
        </button>

        <div className="w-px h-5 bg-surface-border mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex items-center justify-center w-8 h-8 rounded-full text-copy-secondary hover:text-copy-primary hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Undo"
        >
          <Undo2 size={14} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex items-center justify-center w-8 h-8 rounded-full text-copy-secondary hover:text-copy-primary hover:bg-surface-hover transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Redo"
        >
          <Redo2 size={14} />
        </button>
      </div>
    </Panel>
  );
}

function SaveStatusPanel({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <Panel position="top-left" className="ml-2 mt-2 pointer-events-none">
      <div className="flex items-center gap-1.5 rounded-full bg-elevated border border-surface-border shadow-sm px-3 py-1.5 text-xs text-copy-secondary">
        {status === "saving" && (
          <>
            <Loader2 size={11} className="animate-spin" />
            <span>Saving…</span>
          </>
        )}
        {status === "saved" && (
          <>
            <CheckCircle2 size={11} className="text-brand" />
            <span>Saved</span>
          </>
        )}
        {status === "error" && (
          <>
            <CloudOff size={11} className="text-destructive" />
            <span>Error saving</span>
          </>
        )}
      </div>
    </Panel>
  );
}

function DeleteHandler({
  onNodesChange,
  onEdgesChange,
}: {
  onNodesChange: (changes: NodeChange<CanvasNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<CanvasEdge>[]) => void;
}) {
  const nodes = useNodes<CanvasNode>();
  const edges = useEdges<CanvasEdge>();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const selectedNodes = nodes.filter((n) => n.selected);
      const selectedEdges = edges.filter((edge) => edge.selected);

      if (selectedNodes.length > 0) {
        onNodesChange(selectedNodes.map((n) => ({ type: "remove" as const, id: n.id })));
      }
      if (selectedEdges.length > 0) {
        onEdgesChange(selectedEdges.map((edge) => ({ type: "remove" as const, id: edge.id })));
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, onNodesChange, onEdgesChange]);

  return null;
}

interface CanvasFlowProps {
  projectId: string;
  pendingTemplate?: CanvasTemplate | null;
  onTemplateApplied?: () => void;
  onSaveReady?: (fn: () => void) => void;
  onSaveStatusChange?: (status: SaveStatus) => void;
  onStateReady?: (fn: () => { nodes: CanvasNode[]; edges: CanvasEdge[] }) => void;
}

export function CanvasFlow({ projectId, pendingTemplate, onTemplateApplied, onSaveReady, onSaveStatusChange, onStateReady }: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });

  const updateMyPresence = useUpdateMyPresence();
  const rfInstance = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);
  const { status: saveStatus, save } = useAutosave(projectId, nodes, edges);

  useEffect(() => {
    onSaveReady?.(save);
  }, [save, onSaveReady]);

  useEffect(() => {
    onSaveStatusChange?.(saveStatus);
  }, [saveStatus, onSaveStatusChange]);

  useEffect(() => {
    if (!onStateReady) return;
    onStateReady(() => ({ nodes: nodesRef.current, edges: edgesRef.current }));
  }, [onStateReady]);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);
  onNodesChangeRef.current = onNodesChange;
  onEdgesChangeRef.current = onEdgesChange;

  // Load saved canvas on first mount.
  // If Liveblocks already has nodes (collaborative session), fit view and return.
  // Otherwise load the saved snapshot from the API.
  useEffect(() => {
    if (nodesRef.current.length > 0 || edgesRef.current.length > 0) {
      setTimeout(
        () => rfInstance.current?.fitView({ duration: 300, padding: 0.12 }),
        150
      );
      return;
    }

    fetch(`/api/projects/${projectId}/canvas`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null) => {
        if (!data || !data.nodes?.length) return;
        onNodesChangeRef.current(
          data.nodes.map((n) => ({ type: "add" as const, item: n }))
        );
        onEdgesChangeRef.current(
          data.edges.map((e) => ({ type: "add" as const, item: e }))
        );
        setTimeout(
          () => rfInstance.current?.fitView({ duration: 300, padding: 0.12 }),
          150
        );
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!pendingTemplate) return;
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    onNodesChange([
      ...currentNodes.map((n) => ({ type: "remove" as const, id: n.id })),
      ...pendingTemplate.nodes.map((n) => ({ type: "add" as const, item: n })),
    ]);
    onEdgesChange([
      ...currentEdges.map((e) => ({ type: "remove" as const, id: e.id })),
      ...pendingTemplate.edges.map((e) => ({ type: "add" as const, item: e })),
    ]);

    onTemplateApplied?.();
    setTimeout(() => rfInstance.current?.fitView({ duration: 300, padding: 0.12 }), 150);
  }, [pendingTemplate, onNodesChange, onEdgesChange, onTemplateApplied]);

  const handleConnect = useCallback(
    (params: Connection) => {
      const newEdge: CanvasEdge = {
        id: crypto.randomUUID(),
        source: params.source,
        sourceHandle: params.sourceHandle ?? null,
        target: params.target,
        targetHandle: params.targetHandle ?? null,
        type: "canvasEdge",
        data: { label: "" },
      };
      onEdgesChange([{ type: "add", item: newEdge }]);
    },
    [onEdgesChange]
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance<CanvasNode, CanvasEdge>) => {
      rfInstance.current = instance;
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(SHAPE_DRAG_TYPE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!rfInstance.current) return;

      const raw = e.dataTransfer.getData(SHAPE_DRAG_TYPE);
      if (!raw) return;

      const payload = JSON.parse(raw) as ShapeDragPayload;
      const flowCursor = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      const position = {
        x: flowCursor.x - payload.width / 2,
        y: flowCursor.y - payload.height / 2,
      };

      const newNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${++nodeCounter}`,
        type: "canvasNode",
        position,
        data: {
          label: "",
          color: NODE_COLORS[0].fill,
          shape: payload.shape,
        },
        width: payload.width,
        height: payload.height,
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [onNodesChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!rfInstance.current) return;
      const pos = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });
      updateMyPresence({ cursor: pos });
    },
    [updateMyPresence]
  );

  const handleMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  return (
    <ReactFlow<CanvasNode, CanvasEdge>
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onDelete={onDelete}
      connectionMode={ConnectionMode.Loose}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onInit={handleInit}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Background variant={BackgroundVariant.Dots} />
      <LiveCursors />
      <ControlBar />
      <DeleteHandler onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
      <ShapePanel />
      <PresenceAvatars />
      <SaveStatusPanel status={saveStatus} />
    </ReactFlow>
  );
}
