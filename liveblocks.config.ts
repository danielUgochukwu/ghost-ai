// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {};

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        cursorColor: string;
      };
    };

    RoomEvent:
      | { type: "ai-status"; status: "start" | "thinking" | "complete" | "error"; message: string; text?: string }
      | { type: "ai-action"; action: string };

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
