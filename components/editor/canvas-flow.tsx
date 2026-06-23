"use client";

import "@xyflow/react/dist/style.css";

import { useRef, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { ShapePanel, SHAPE_DRAG_TYPE, type ShapeDragPayload } from "@/components/editor/shape-panel";

const nodeTypes = { canvasNode: CanvasNodeRenderer };

let nodeCounter = 0;

export function CanvasFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });

  const rfInstance = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);

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
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      connectionMode={ConnectionMode.Loose}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onInit={handleInit}
      fitView
    >
      <Background variant={BackgroundVariant.Dots} />
      <MiniMap />
      <ShapePanel />
    </ReactFlow>
  );
}
