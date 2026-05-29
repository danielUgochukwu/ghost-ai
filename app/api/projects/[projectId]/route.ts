import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let name;
  try {
    const body = await req.json();
    name = body.name;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    name = name.trim();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  });

  return NextResponse.json(updatedProject);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

    const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

 try {
    await prisma.project.delete({
      where: { 
        id: projectId,
        ownerId: userId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    // Prisma throws if no record matches the where clause
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }

}
