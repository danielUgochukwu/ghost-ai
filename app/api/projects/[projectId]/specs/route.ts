import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getProjectAccess } from "@/lib/project-access";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getProjectAccess(projectId);
  if (!access.hasAccess || !access.project) {
    const status =
      access.reason === "not_found" ? 404 : access.reason === "unauthenticated" ? 401 : 403;
    return NextResponse.json({ error: "Project not found or access denied" }, { status });
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, filePath: true, createdAt: true },
  });

  return NextResponse.json({ specs });
}
