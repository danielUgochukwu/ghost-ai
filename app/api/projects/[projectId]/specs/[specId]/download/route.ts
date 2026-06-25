import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getProjectAccess } from "@/lib/project-access";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  const { projectId, specId } = await params;

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

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
  });

  if (!spec) {
    return NextResponse.json({ error: "Spec not found" }, { status: 404 });
  }

  if (spec.projectId !== projectId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await get(spec.filePath, { access: "private" });
  if (!result || result.statusCode !== 200 || result.stream === null) {
    return NextResponse.json({ error: "Failed to fetch spec file" }, { status: 502 });
  }

  const filename = `spec-${specId}.md`;

  return new Response(result.stream, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
