import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { put, del, get } from "@vercel/blob";
import { NextResponse } from "next/server";

async function resolveAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });
  if (!project) return null;

  const { currentUser } = await import("@clerk/nextjs/server");
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const isOwner = project.ownerId === userId;
  const isCollaborator = Boolean(
    email && project.collaborators.some((c) => c.email === email)
  );

  if (!isOwner && !isCollaborator) return null;
  return project;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await resolveAccess(projectId, userId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!project.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  const result = await get(project.canvasJsonPath, { access: "private" });
  if (!result || result.statusCode !== 200 || result.stream === null) {
    return NextResponse.json({ error: "Failed to load canvas" }, { status: 502 });
  }

  const data = await new Response(result.stream).json();
  return NextResponse.json(data);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await resolveAccess(projectId, userId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (project.canvasJsonPath) {
    try {
      await del(project.canvasJsonPath);
    } catch {
      // Ignore if blob no longer exists
    }
  }

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}
