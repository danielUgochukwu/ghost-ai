"use client";

import { Square, Diamond, Circle, Pill, Database, Hexagon } from "lucide-react";
import { Panel } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import type { NodeShape } from "@/types/canvas";

export const SHAPE_DRAG_TYPE = "application/ghost-shape";

export interface ShapeDragPayload {
  shape: NodeShape;
  width: number;
  height: number;
}

interface ShapeEntry {
  shape: NodeShape;
  Icon: LucideIcon;
  width: number;
  height: number;
}

const SHAPES: ShapeEntry[] = [
  { shape: "rectangle", Icon: Square, width: 160, height: 80 },
  { shape: "diamond", Icon: Diamond, width: 140, height: 140 },
  { shape: "circle", Icon: Circle, width: 100, height: 100 },
  { shape: "pill", Icon: Pill, width: 160, height: 72 },
  { shape: "cylinder", Icon: Database, width: 120, height: 100 },
  { shape: "hexagon", Icon: Hexagon, width: 140, height: 120 },
];

export function ShapePanel() {
  function handleDragStart(e: React.DragEvent, entry: ShapeEntry) {
    const payload: ShapeDragPayload = {
      shape: entry.shape,
      width: entry.width,
      height: entry.height,
    };
    e.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <Panel position="bottom-center">
      <div className="mb-4 flex items-center gap-1 rounded-full border border-surface-border bg-elevated px-3 py-2 shadow-lg">
        {SHAPES.map((entry) => {
          const Icon = entry.Icon;
          return (
            <button
              key={entry.shape}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, entry)}
              title={entry.shape}
              className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing"
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
