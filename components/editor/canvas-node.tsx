"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NODE_COLORS, type CanvasNode } from "@/types/canvas";

function getTextColor(fill: string): string {
  return NODE_COLORS.find((c) => c.fill === fill)?.text ?? "#EDEDED";
}

export function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  return (
    <div
      style={{ background: data.color, color: getTextColor(data.color) }}
      className="flex h-full w-full items-center justify-center rounded-xl border border-surface-border px-3 py-2"
    >
      <span className="text-sm font-medium leading-tight">{data.label}</span>
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="source" position={Position.Right} id="source-right" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="target" position={Position.Left} id="target-left" />
    </div>
  );
}
