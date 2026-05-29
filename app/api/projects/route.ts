import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET() {
  const {userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let name = "Untitled Project";
  let id: string | undefined = undefined;

  try {
    const body = await req.json();
    if (body.name && typeof body.name === "string" && body.name.trim() !== "") {
      name = body.name.trim();
    }
    if (body.id && typeof body.id === "string" && body.id.trim() !== "") {
      id = body.id.trim();
    }
  } catch {
    // Ignore JSON parse errors and use the default name
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...(id ? { id } : {}),
        ownerId: userId,
        name,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A project with this ID already exists" },
        { status: 409 }
      );
    }
    throw error;
  }
}
