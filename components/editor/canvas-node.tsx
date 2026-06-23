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
      <Handle type="source" position={Position.Top} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
    </div>
  );
}
