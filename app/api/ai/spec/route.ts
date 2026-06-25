import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getProjectAccess } from "@/lib/project-access";
import type { generateSpec } from "@/trigger/generate-spec";

const BodySchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(
    z.object({
      role: z.enum(["user", "ai"]),
      content: z.string(),
      senderName: z.string().optional(),
    })
  ),
  nodes: z.array(z.unknown()),
  edges: z.array(z.unknown()),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const raw = await req.json();
    const result = BodySchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    body = result.data;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { roomId, chatHistory, nodes, edges } = body;

  const access = await getProjectAccess(roomId);
  if (!access.hasAccess || !access.project) {
    const status = access.reason === "not_found" ? 404 : access.reason === "unauthenticated" ? 401 : 403;
    return NextResponse.json({ error: "Project not found or access denied" }, { status });
  }

  const projectId = access.project.id;

  const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
    projectId,
    roomId,
    chatHistory,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodes: nodes as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    edges: edges as any,
  });

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId,
    },
  });

  return NextResponse.json({ runId: handle.id });
}
