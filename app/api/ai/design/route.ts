import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";
import type { designAgent } from "@/trigger/design-agent";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let prompt: string;
  let roomId: string;
  let projectId: string;

  try {
    const body = await req.json();
    if (!body.prompt || typeof body.prompt !== "string" || body.prompt.trim() === "") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }
    if (!body.roomId || typeof body.roomId !== "string") {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }
    if (!body.projectId || typeof body.projectId !== "string") {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    prompt = body.prompt.trim();
    roomId = body.roomId;
    projectId = body.projectId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const handle = await tasks.trigger<typeof designAgent>("design-agent", { prompt, roomId });

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId,
    },
  });

  return NextResponse.json({ runId: handle.id });
}
