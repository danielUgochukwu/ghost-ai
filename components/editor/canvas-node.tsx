"use client";

import { useState, useRef, useCallback } from "react";
import { Handle, Position, NodeResizer, useReactFlow, type NodeProps } from "@xyflow/react";
import { NODE_COLORS, type CanvasNode, type CanvasEdge } from "@/types/canvas";

function getTextColor(fill: string): string {
  return NODE_COLORS.find((c) => c.fill === fill)?.text ?? "#EDEDED";
}

const BORDER_IDLE = "var(--border-default)";
const BORDER_ACTIVE = "var(--accent-primary)";
const MIN_WIDTH = 80;
const MIN_HEIGHT = 40;

function ColorToolbar({ id, activeColor }: { id: string; activeColor: string }) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();

  return (
    <div
      className="nodrag nopan absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-surface-border bg-elevated px-2.5 py-1.5 shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map(({ fill, text }) => {
        const isActive = fill === activeColor;
        return (
          <button
            key={fill}
            type="button"
            aria-label="Set node color"
            className="h-5 w-5 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: fill,
              boxShadow: isActive
                ? `0 0 0 2px var(--bg-elevated), 0 0 0 3.5px ${text}`
                : undefined,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.boxShadow = `0 0 6px 2px ${text}55`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.boxShadow = "";
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              updateNodeData(id, { color: fill });
            }}
          />
        );
      })}
    </div>
  );
}

export function CanvasNodeRenderer({ id, data, selected }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const skipBlurCommitRef = useRef(false);

  const textColor = getTextColor(data.color);
  const stroke = selected ? BORDER_ACTIVE : BORDER_IDLE;

  const startEditing = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditValue(data.label);
      setIsEditing(true);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    },
    [data.label]
  );

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    updateNodeData(id, { label: editValue });
  }, [id, editValue, updateNodeData]);

   const handleBlur = useCallback(() => {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false;
      return;
    }
    commitEdit();
  }, [commitEdit]);


  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
         e.preventDefault();
        skipBlurCommitRef.current = true;
        setIsEditing(false);
        setEditValue(data.label);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        skipBlurCommitRef.current = true;
        commitEdit();
      }
    },
    [data.label, commitEdit]
  );

  function renderLabel() {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Node label"
          placeholder="Label"
          className="nodrag nopan w-full resize-none border-0 bg-transparent text-center text-sm font-medium leading-tight outline-none"
          style={{ color: textColor }}
          rows={2}
        />
      );
    }
    return (
      <span
        className="cursor-default select-none text-sm font-medium leading-tight"
        style={{ color: textColor }}
        onDoubleClick={startEditing}
      >
        {data.label || <span style={{ opacity: 0.35 }}>Label</span>}
      </span>
    );
  }

  function renderShape() {
    switch (data.shape) {
      case "rectangle":
        return (
          <div
            style={{ background: data.color, borderColor: stroke }}
            className="flex h-full w-full items-center justify-center rounded-xl border px-3 py-2"
          >
            {renderLabel()}
          </div>
        );

      case "pill":
        return (
          <div
            style={{ background: data.color, borderColor: stroke }}
            className="flex h-full w-full items-center justify-center rounded-full border px-3 py-2"
          >
            {renderLabel()}
          </div>
        );

      case "circle":
        return (
          <div
            style={{ background: data.color, borderColor: stroke }}
            className="flex h-full w-full items-center justify-center rounded-full border"
          >
            {renderLabel()}
          </div>
        );

      case "diamond":
        return (
          <div className="relative h-full w-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <polygon
                points="50,2 98,50 50,98 2,50"
                fill={data.color}
                strokeWidth="2"
                style={{ stroke }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {renderLabel()}
            </div>
          </div>
        );

      case "hexagon":
        return (
          <div className="relative h-full w-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <polygon
                points="50,2 97,26 97,74 50,98 3,74 3,26"
                fill={data.color}
                strokeWidth="2"
                style={{ stroke }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {renderLabel()}
            </div>
          </div>
        );

      case "cylinder":
        return (
          <div className="relative h-full w-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <rect x="1" y="15" width="98" height="70" fill={data.color} />
              <line x1="1" y1="15" x2="1" y2="85" strokeWidth="1.5" style={{ stroke }} />
              <line x1="99" y1="15" x2="99" y2="85" strokeWidth="1.5" style={{ stroke }} />
              <path
                d="M 1,85 A 49,14 0 0,1 99,85"
                fill="none"
                strokeWidth="1.5"
                style={{ stroke }}
              />
              <ellipse
                cx="50"
                cy="15"
                rx="49"
                ry="14"
                fill={data.color}
                strokeWidth="1.5"
                style={{ stroke }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {renderLabel()}
            </div>
          </div>
        );

      default:
        return (
          <div
            style={{ background: data.color, borderColor: stroke }}
            className="flex h-full w-full items-center justify-center rounded-xl border px-3 py-2"
          >
            {renderLabel()}
          </div>
        );
    }
  }

  return (
    <div className="relative h-full w-full">
      <NodeResizer
        color={BORDER_ACTIVE}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        isVisible={!!selected}
        handleStyle={{ width: 8, height: 8, borderRadius: 2, opacity: 0.85 }}
      />
      {selected && <ColorToolbar id={id} activeColor={data.color} />}
      {renderShape()}
      <Handle
        type="source"
        position={Position.Top}
        id="handle-top"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="handle-top-target"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="handle-right"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="handle-right-target"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="handle-bottom"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="handle-bottom-target"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="handle-left"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="handle-left-target"
        className="h-2.5! w-2.5! rounded-full! border! border-black/40! bg-white!"
      />
    </div>
  );
}
