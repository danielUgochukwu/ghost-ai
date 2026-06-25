import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { auth as triggerAuth } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let runId: string;

  try {
    const body = await req.json();
    if (!body.runId || typeof body.runId !== "string") {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }
    runId = body.runId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });

  if (!taskRun || taskRun.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  });

  return NextResponse.json({ token });
}
