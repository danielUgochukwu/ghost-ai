"use client";

import { useOthers } from "@liveblocks/react";
import { useViewport } from "@xyflow/react";
import { useAuth } from "@clerk/nextjs";

export function LiveCursors() {
  const { userId } = useAuth();
  const others = useOthers();
  const { x: vpX, y: vpY, zoom } = useViewport();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {others.map(({ connectionId, presence, info, id }) => {
        if (id === userId || !presence.cursor) return null;

        const x = presence.cursor.x * zoom + vpX;
        const y = presence.cursor.y * zoom + vpY;
        const color = info?.cursorColor ?? "#888888";
        const name = info?.name ?? "Unknown";

        return (
          <div
            key={connectionId}
            className="absolute pointer-events-none select-none"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 0L0 14L4 10L7 17L9 16L6 9L11 9Z"
                fill={color}
                stroke="#000000"
                strokeWidth="0.5"
              />
            </svg>
            <div
              className="absolute left-4 top-3 rounded-full px-2 py-0.5 text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
