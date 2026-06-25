import { schemaTask, metadata, logger } from "@trigger.dev/sdk";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "ai"]),
  content: z.string(),
  senderName: z.string().optional(),
});

const CanvasNodeSchema = z.object({
  id: z.string(),
  data: z.object({
    label: z.string(),
    shape: z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]),
    color: z.string(),
  }),
  position: z.object({ x: z.number(), y: z.number() }),
  width: z.number().optional(),
  height: z.number().optional(),
});

const CanvasEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  data: z.object({ label: z.string().optional() }).optional(),
});

const GenerateSpecSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(ChatMessageSchema),
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
});

const SHAPE_DESCRIPTIONS: Record<string, string> = {
  rectangle: "general service/component",
  diamond: "decision gateway/load balancer",
  circle: "event/trigger/endpoint",
  pill: "running service/process",
  cylinder: "database/persistent storage",
  hexagon: "external system/boundary",
};

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: GenerateSpecSchema,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10_000,
    factor: 2,
  },
  run: async (payload) => {
    const { projectId, chatHistory, nodes, edges } = payload;

    logger.info("Starting spec generation", {
      projectId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatMessages: chatHistory.length,
    });

    metadata.set("status", "starting");
    metadata.set("progress", 0);

    const nodeList = nodes
      .map((n) => {
        const shapeDesc = SHAPE_DESCRIPTIONS[n.data.shape] ?? n.data.shape;
        return `- **${n.data.label}** (id: \`${n.id}\`, type: ${shapeDesc})`;
      })
      .join("\n");

    const edgeList = edges
      .map((e) => {
        const label = e.data?.label ? ` [${e.data.label}]` : "";
        const sourceLabel = nodes.find((n) => n.id === e.source)?.data.label ?? e.source;
        const targetLabel = nodes.find((n) => n.id === e.target)?.data.label ?? e.target;
        return `- **${sourceLabel}** → **${targetLabel}**${label}`;
      })
      .join("\n");

    const chatContext =
      chatHistory.length > 0
        ? chatHistory
            .map((m) => {
              const speaker = m.role === "user" ? (m.senderName ?? "User") : "Ghost AI";
              return `**${speaker}**: ${m.content}`;
            })
            .join("\n\n")
        : "(No prior conversation)";

    const systemPrompt = `You are Ghost AI, a senior systems architect. Your task is to produce a clear, structured technical specification in Markdown based on a system architecture diagram and a conversation with the user.

Write the spec as if it will be handed to an engineering team to implement from scratch. Be precise, complete, and actionable.

## Output format

Use this exact Markdown structure:

# Technical Specification: [System Name]

## Overview
Brief description of what this system does and why it exists.

## Architecture Summary
High-level description of the architecture pattern and key design decisions.

## Components

For each component or service, write a section:

### [Component Name]
- **Type**: [Service / Database / API Gateway / etc.]
- **Purpose**: What this component does
- **Responsibilities**: Bullet list of its main responsibilities
- **Interfaces**: What it exposes or consumes

## Data Flow
Step-by-step description of the main request/data flows through the system.

## Integration Points
List of external systems, third-party services, or cross-boundary connections.

## Key Design Decisions
Notable architectural choices and the reasoning behind them.

## Non-Functional Requirements
Performance, scalability, reliability, security, or observability considerations visible in the architecture.

---

Keep the spec factual and grounded in the diagram. Do not invent components or flows not present in the canvas.`;

    const userPrompt = `## Canvas Architecture

### Nodes (${nodes.length} components)
${nodeList || "(empty canvas)"}

### Connections (${edges.length} edges)
${edgeList || "(no connections)"}

## Conversation History
${chatContext}

Generate a complete technical specification for this system.`;

    metadata.set("status", "generating");
    metadata.set("progress", 25);

    logger.info("Calling Gemini for spec generation");

    const googleAI = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });

    const { text } = await generateText({
      model: googleAI("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    metadata.set("status", "saving");
    metadata.set("progress", 90);

    logger.info("Uploading spec to Vercel Blob", { projectId, charCount: text.length });

    const blob = await put(`specs/${projectId}/${Date.now()}.md`, text, {
      access: "private",
      contentType: "text/markdown",
      addRandomSuffix: true,
    });

    const specRecord = await prisma.projectSpec.create({
      data: {
        projectId,
        filePath: blob.url,
      },
    });

    metadata.set("status", "complete");
    metadata.set("progress", 100);

    logger.info("Spec generation complete", { specId: specRecord.id, blobUrl: blob.url });

    return { spec: text, specId: specRecord.id };
  },
});
