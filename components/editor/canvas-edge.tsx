"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";

const STROKE_IDLE = "var(--border-default)";
const STROKE_ACTIVE = "var(--accent-primary)";

export function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data?.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const cancelEditRef = useRef(false);
  const [inputWidth, setInputWidth] = useState(60);

  const label = data?.label ?? "";
  const isActive = selected || isHovered;
  const markerId = `ghost-arrow-${id}`;
  const strokeColor = isActive ? STROKE_ACTIVE : STROKE_IDLE;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  useEffect(() => {
    if (sizerRef.current) {
      setInputWidth(Math.max(60, sizerRef.current.offsetWidth + 16));
    }
  }, [editValue]);

  const startEditing = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      cancelEditRef.current = false;
      setEditValue(label);
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    },
    [label]
  );

  const commitEdit = useCallback(() => {
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }
    setIsEditing(false);
    updateEdgeData(id, { label: editValue });
  }, [id, editValue, updateEdgeData]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        cancelEditRef.current = true;
        setIsEditing(false);
        setEditValue(label);
      } else if (e.key === "Enter") {
        e.preventDefault();
        commitEdit();
      }
    },
    [label, commitEdit]
  );

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>

      {/* Visible edge — pointer events disabled so the hit area handles them */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        style={{
          stroke: strokeColor,
          color: strokeColor,
          opacity: isActive ? 1 : 0.45,
          transition: "stroke 0.15s, color 0.15s, opacity 0.15s",
          pointerEvents: "none",
        }}
      />

      {/* Invisible wide hit area for easier hover and click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={startEditing}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <div
              className="relative flex items-center"
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                ref={sizerRef}
                className="invisible absolute whitespace-pre px-2 text-xs"
                aria-hidden
              >
                {editValue || " "}
              </span>
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ width: inputWidth }}
                className="rounded-full border border-surface-border bg-elevated px-2 py-0.5 text-center text-xs text-copy-primary outline-none focus:border-brand"
                aria-label="Edge label"
                placeholder="Label"
              />
            </div>
          ) : label ? (
            <div
              className="cursor-pointer select-none rounded-full border border-surface-border bg-elevated px-2 py-0.5 text-xs text-copy-primary"
              onDoubleClick={startEditing}
            >
              {label}
            </div>
          ) : isActive ? (
            <div
              className="cursor-pointer select-none rounded-full border border-dashed border-surface-border px-2 py-0.5 text-xs text-copy-muted opacity-40"
              onDoubleClick={startEditing}
            >
              label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
