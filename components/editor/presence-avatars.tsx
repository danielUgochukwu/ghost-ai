"use client";

import { useOthers } from "@liveblocks/react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Panel } from "@xyflow/react";

function CollaboratorAvatar({
  name,
  avatar,
  cursorColor,
  index,
}: {
  name: string;
  avatar: string;
  cursorColor: string;
  index: number;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  return (
    <div
      className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden"
      style={{
        marginLeft: index === 0 ? 0 : "-8px",
        zIndex: 10 - index,
        boxShadow: `0 0 0 2px #18181c, 0 0 0 3.5px ${cursorColor}`,
      }}
      title={name}
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-elevated text-xs font-medium text-copy-secondary">
          {initials || "?"}
        </div>
      )}
    </div>
  );
}

export function PresenceAvatars() {
  const { userId } = useAuth();
  const others = useOthers();

  const collaborators = others.filter((other) => other.id !== userId);
  const visible = collaborators.slice(0, 5);
  const overflow = collaborators.length - visible.length;

  return (
    <Panel position="top-right" className="mt-2 mr-2">
      <div className="flex items-center gap-2">
        {visible.length > 0 && (
          <div className="flex items-center">
            {visible.map((other, index) => (
              <CollaboratorAvatar
                key={other.connectionId}
                name={other.info?.name ?? "?"}
                avatar={other.info?.avatar ?? ""}
                cursorColor={other.info?.cursorColor ?? "#888888"}
                index={index}
              />
            ))}
            {overflow > 0 && (
              <div
                className="relative h-8 w-8 shrink-0 rounded-full flex items-center justify-center bg-elevated text-xs font-medium text-copy-secondary border border-surface-border"
                style={{ marginLeft: "-8px", zIndex: 5 }}
              >
                +{overflow}
              </div>
            )}
          </div>
        )}

        {visible.length > 0 && (
          <div className="w-px h-5 bg-surface-border" />
        )}

        <UserButton />
      </div>
    </Panel>
  );
}
