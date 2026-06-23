import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; collaboratorId: string }> }
) {
  const { projectId, collaboratorId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden - only owners can remove collaborators" }, { status: 403 });
  }

  try {
    await prisma.projectCollaborator.delete({
      where: {
        id: collaboratorId,
        projectId: projectId, // ensures we only delete collaborators for this project
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Prisma throws if no record matches the where clause
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
