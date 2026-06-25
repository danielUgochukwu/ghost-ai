import { task } from "@trigger.dev/sdk";
import { generateText, tool, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { getLiveblocksClient } from "@/lib/liveblocks";
import { mutateFlow } from "@liveblocks/react-flow/node";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_SHAPES, NODE_COLORS } from "@/types/canvas";

const AI_USER_ID = "ai-ghost";
const AI_CURSOR_COLOR = "#6457f9";

const VALID_FILLS = new Set(NODE_COLORS.map((c) => c.fill));

function safeShape(s: string | undefined): CanvasNode["data"]["shape"] {
  return NODE_SHAPES.includes(s as never) ? (s as CanvasNode["data"]["shape"]) : "rectangle";
}

function safeColor(c: string | undefined): string {
  return c && VALID_FILLS.has(c) ? c : NODE_COLORS[0].fill;
}

interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

export const designAgent = task({
  id: "design-agent",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
    factor: 2,
  },
  run: async (payload: DesignAgentPayload, { ctx }) => {
    const { prompt, roomId } = payload;
    const liveblocks = getLiveblocksClient();

    // Non-fatal helpers — a missing or invalid room must not abort canvas work.
    async function setAiPresence(
      cursor: { x: number; y: number } | null,
      thinking: boolean,
      ttl: number
    ) {
      try {
        await liveblocks.setPresence(roomId, {
          userId: AI_USER_ID,
          data: { cursor, thinking },
          userInfo: { name: "Ghost AI", avatar: "", cursorColor: AI_CURSOR_COLOR },
          ttl,
        });
      } catch {
        // Presence is informational — don't abort on failure.
      }
    }

    async function broadcastStatus(
      status: "start" | "thinking" | "complete" | "error",
      message: string
    ) {
      try {
        await liveblocks.broadcastEvent(roomId, { type: "ai-status", status, message });
      } catch {
        // Status broadcast is informational — don't abort on failure.
      }
    }

    // Build tools that close over roomId and liveblocks.
    // Each execute() immediately applies the change to the live canvas.
    const canvasTools = {
      addNode: tool({
        description:
          "Add a new node to the canvas. Use descriptive kebab-case IDs like 'api-gateway' or 'user-db'. " +
          "Shapes: rectangle (default), diamond (decision), circle (event), pill (service), cylinder (database), hexagon (external). " +
          `Color fills: ${NODE_COLORS.map((c) => c.fill).join(", ")}.`,
        inputSchema: z.object({
          id: z.string().describe("Unique kebab-case node ID, e.g. 'api-gateway'"),
          label: z.string().describe("Human-readable node label"),
          shape: z
            .enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"])
            .describe("Node shape"),
          color: z.string().describe("Hex fill color from the allowed palette"),
          x: z.number().describe("X canvas position in pixels"),
          y: z.number().describe("Y canvas position in pixels"),
          width: z.number().optional().describe("Width in pixels, default 160"),
          height: z.number().optional().describe("Height in pixels, default 60"),
        }),
        execute: async ({ id, label, shape, color, x, y, width, height }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
            const node: CanvasNode = {
              id,
              type: "canvasNode",
              position: { x, y },
              data: { label, color: safeColor(color), shape: safeShape(shape) },
              width: width ?? 160,
              height: height ?? 60,
            };
            flow.addNode(node);
          });
          return { added: id, x, y };
        },
      }),

      moveNode: tool({
        description: "Move an existing node to a new canvas position.",
        inputSchema: z.object({
          id: z.string().describe("ID of the node to move"),
          x: z.number().describe("New X position"),
          y: z.number().describe("New Y position"),
        }),
        execute: async ({ id, x, y }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
            flow.updateNode(id, { position: { x, y } });
          });
          return { moved: id, x, y };
        },
      }),

      resizeNode: tool({
        description: "Resize an existing node.",
        inputSchema: z.object({
          id: z.string().describe("ID of the node to resize"),
          width: z.number().describe("New width in pixels"),
          height: z.number().describe("New height in pixels"),
        }),
        execute: async ({ id, width, height }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
            flow.updateNode(id, { width, height });
          });
          return { resized: id, width, height };
        },
      }),

      updateNodeData: tool({
        description: "Update the label, shape, or color of an existing node.",
        inputSchema: z.object({
          id: z.string().describe("ID of the node to update"),
          label: z.string().optional().describe("New label"),
          shape: z
            .enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"])
            .optional()
            .describe("New shape"),
          color: z.string().optional().describe("New hex fill color from the allowed palette"),
        }),
        execute: async ({ id, label, shape, color }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
            flow.updateNodeData(id, (data) => ({
              ...data,
              ...(label !== undefined && { label }),
              ...(shape !== undefined && { shape: safeShape(shape) }),
              ...(color !== undefined && { color: safeColor(color) }),
            }));
          });
          return { updated: id };
        },
      }),

      deleteNode: tool({
        description: "Remove a node from the canvas.",
        inputSchema: z.object({
          id: z.string().describe("ID of the node to delete"),
        }),
        execute: async ({ id }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
            flow.removeNode(id);
          });
          return { deleted: id };
        },
      }),

      addEdge: tool({
        description: "Connect two nodes with a directed edge.",
        inputSchema: z.object({
          id: z.string().describe("Unique edge ID, e.g. 'gateway-to-auth'"),
          source: z.string().describe("Source node ID"),
          target: z.string().describe("Target node ID"),
          label: z.string().optional().describe("Optional edge label"),
        }),
        execute: async ({ id, source, target, label }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
            const edge: CanvasEdge = {
              id,
              type: "canvasEdge",
              source,
              target,
              data: { label: label ?? "" },
            };
            flow.addEdge(edge);
          });
          return { added: id, source, target };
        },
      }),

      deleteEdge: tool({
        description: "Remove an edge from the canvas.",
        inputSchema: z.object({
          id: z.string().describe("ID of the edge to delete"),
        }),
        execute: async ({ id }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
            flow.removeEdge(id);
          });
          return { deleted: id };
        },
      }),
    };

    try {
      await setAiPresence({ x: 400, y: 300 }, true, 3599);
      await broadcastStatus("start", "Ghost AI is analyzing your request…");

      // Read current canvas state to give the model context.
      let existingNodes: CanvasNode[] = [];
      let existingEdges: CanvasEdge[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks as any, roomId }, (flow) => {
        existingNodes = [...flow.nodes];
        existingEdges = [...flow.edges];
      });

      await broadcastStatus("thinking", "Building architecture design…");

      const colorPalette = NODE_COLORS.map(
        (c) => `fill="${c.fill}" (text="${c.text}")`
      ).join(", ");

      const systemPrompt = `You are Ghost AI, an expert system architecture designer embedded in a collaborative canvas editor.
Your job is to build a complete system architecture diagram by calling canvas tools one action at a time.

## Node shapes and when to use them
- rectangle — general-purpose service or component (default)
- diamond — decision gateway or load balancer
- circle — event, trigger, or endpoint
- pill — running service or process
- cylinder — database or persistent storage
- hexagon — external system or boundary (third-party, CDN, client)

## Allowed color fills
${colorPalette}
Use "#1F1F1F" (neutral dark) as the default. Assign colors semantically:
- Blue (#10233D) → infrastructure, API layers
- Purple (#2E1938) → auth, identity
- Orange (#331B00) → messaging, queues, async
- Red (#3C1618) → critical path, gateways
- Pink (#3A1726) → storage, media
- Green (#0F2E18) → data processing, pipelines
- Teal (#062822) → external services, third-party

## Layout rules
- Default node size: 160×60 px. Important hubs: 200×70 px.
- Space nodes at least 120 px horizontally, 100 px vertically.
- Lay out left-to-right for request flows; top-to-bottom for data pipelines.
- Keep the entire layout within roughly x: 0–1400, y: 0–900.
- Group related services close together.
- After adding all nodes, wire them with addEdge in logical data-flow order.

## Current canvas state
Nodes (${existingNodes.length}):
${existingNodes.length > 0
  ? existingNodes.map((n) => `  id="${n.id}" label="${n.data.label}" shape=${n.data.shape} color=${n.data.color} pos=(${Math.round(n.position.x)},${Math.round(n.position.y)})`).join("\n")
  : "  (empty — start fresh)"}

Edges (${existingEdges.length}):
${existingEdges.length > 0
  ? existingEdges.map((e) => `  id="${e.id}" ${e.source} → ${e.target}`).join("\n")
  : "  (none)"}

Call tools to build the design. Add all nodes first, then connect them with edges.
When the design is complete, respond with a short summary of what you built.`;

      let lastCursorPos = { x: 400, y: 300 };

      const googleAI = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_AI_API_KEY,
      });

      const { text } = await generateText({
        model: googleAI("gemini-2.5-flash"),
        system: systemPrompt,
        prompt: `Design request: ${prompt}`,
        tools: canvasTools,
        stopWhen: stepCountIs(40),
        onStepFinish: async ({ toolResults }) => {
          // Move the AI cursor to the position of the most recently added node.
          for (const r of toolResults ?? []) {
            const output = r.output as Record<string, unknown>;
            if (typeof output?.x === "number" && typeof output?.y === "number") {
              lastCursorPos = { x: output.x as number, y: output.y as number };
            }
          }
          await setAiPresence(lastCursorPos, true, 3599);
        },
      });

      await broadcastStatus("complete", text || "Design complete.");

      // Clear AI presence with a short TTL so it expires quickly.
      await setAiPresence(null, false, 2);

      return { runId: ctx.run.id };
    } catch (error) {
      await broadcastStatus("error", "Ghost AI encountered an error. Please try again.");
      await setAiPresence(null, false, 2);
      throw error;
    }
  },
});
