"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

interface GhostState {
  shape: NodeShape;
  width: number;
  height: number;
}

function ShapeGhost({ shape }: { shape: NodeShape }) {
  switch (shape) {
    case "rectangle":
      return <div className="h-full w-full rounded-xl border-2 border-brand bg-elevated" />;
    case "pill":
      return <div className="h-full w-full rounded-full border-2 border-brand bg-elevated" />;
    case "circle":
      return <div className="h-full w-full rounded-full border-2 border-brand bg-elevated" />;
    case "diamond":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <polygon
            points="50,2 98,50 50,98 2,50"
            strokeWidth="3"
            style={{ fill: "var(--bg-elevated)", stroke: "var(--accent-primary)" }}
          />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <polygon
            points="50,2 97,26 97,74 50,98 3,74 3,26"
            strokeWidth="3"
            style={{ fill: "var(--bg-elevated)", stroke: "var(--accent-primary)" }}
          />
        </svg>
      );
    case "cylinder":
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <rect x="1" y="15" width="98" height="70" style={{ fill: "var(--bg-elevated)" }} />
          <line
            x1="1" y1="15" x2="1" y2="85"
            strokeWidth="2.5"
            style={{ stroke: "var(--accent-primary)" }}
          />
          <line
            x1="99" y1="15" x2="99" y2="85"
            strokeWidth="2.5"
            style={{ stroke: "var(--accent-primary)" }}
          />
          <path
            d="M 1,85 A 49,14 0 0,1 99,85"
            fill="none"
            strokeWidth="2.5"
            style={{ stroke: "var(--accent-primary)" }}
          />
          <ellipse
            cx="50" cy="15" rx="49" ry="14"
            strokeWidth="2.5"
            style={{ fill: "var(--bg-elevated)", stroke: "var(--accent-primary)" }}
          />
        </svg>
      );
    default:
      return null;
  }
}

export function ShapePanel() {
  const [ghost, setGhost] = useState<GhostState | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const isDragging = ghost !== null;

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [isDragging]);

  function handleDragStart(e: React.DragEvent, entry: ShapeEntry) {
    const payload: ShapeDragPayload = {
      shape: entry.shape,
      width: entry.width,
      height: entry.height,
    };
    e.dataTransfer.setData(SHAPE_DRAG_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";

    // Suppress browser's default drag ghost image
    const img = new Image();
    img.src =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==";
    e.dataTransfer.setDragImage(img, 0, 0);

    setGhost({ shape: entry.shape, width: entry.width, height: entry.height });
    setCursorPos({ x: e.clientX, y: e.clientY });
  }

  function handleDragEnd() {
    setGhost(null);
  }

  const previewW = ghost ? ghost.width / 2 : 0;
  const previewH = ghost ? ghost.height / 2 : 0;

  return (
    <>
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
                onDragEnd={handleDragEnd}
                title={entry.shape}
                className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-colors hover:bg-subtle hover:text-copy-primary active:cursor-grabbing"
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </Panel>

      {ghost &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: cursorPos.x - previewW / 2,
              top: cursorPos.y - previewH / 2,
              width: previewW,
              height: previewH,
              pointerEvents: "none",
              zIndex: 9999,
              opacity: 0.65,
            }}
          >
            <ShapeGhost shape={ghost.shape} />
          </div>,
          document.body
        )}
    </>
  );
}
