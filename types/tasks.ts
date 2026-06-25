import { z } from "zod";

export interface AiStatusMessage {
  status: "start" | "thinking" | "complete" | "error";
  message: string;
  text?: string;
}

const VALID_STATUSES = ["start", "thinking", "complete", "error"] as const;

export function validateAiStatusMessage(event: unknown): AiStatusMessage | null {
  if (typeof event !== "object" || event === null) return null;
  const v = event as Record<string, unknown>;
  if (!VALID_STATUSES.includes(v.status as (typeof VALID_STATUSES)[number])) return null;
  if (typeof v.message !== "string") return null;
  return {
    status: v.status as AiStatusMessage["status"],
    message: v.message,
    ...(typeof v.text === "string" ? { text: v.text } : {}),
  };
}

export const ChatMessageDataSchema = z.object({
  sender: z.string(),
  senderName: z.string(),
  role: z.enum(["user", "ai"]),
  content: z.string().min(1),
  timestamp: z.number(),
});

export type ChatMessageData = z.infer<typeof ChatMessageDataSchema>;

export function validateChatMessage(data: unknown): ChatMessageData | null {
  const result = ChatMessageDataSchema.safeParse(data);
  return result.success ? result.data : null;
}
