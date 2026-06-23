"use client";

import "@xyflow/react/dist/style.css";

import { useRef, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  ConnectionMode,
  useReactFlow,
  type ReactFlowInstance,
  type Connection,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import { useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { ShapePanel, SHAPE_DRAG_TYPE, type ShapeDragPayload } from "@/components/editor/shape-panel";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

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

interface CanvasFlowProps {
  pendingTemplate?: CanvasTemplate | null;
  onTemplateApplied?: () => void;
}

export function CanvasFlow({ pendingTemplate, onTemplateApplied }: CanvasFlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });

  const rfInstance = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

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
      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

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
      fitView
    >
      <Background variant={BackgroundVariant.Dots} />
      <ControlBar />
      <ShapePanel />
    </ReactFlow>
  );
}
