import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const { isAuthenticated, userId } = await auth();
  
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const { isAuthenticated, userId } = await auth();
  
  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let name = 'Untitled Project';
  let id: string | undefined = undefined;

  try {
    const body = await req.json();
    if (body.name && typeof body.name === 'string' && body.name.trim() !== '') {
      name = body.name.trim();
    }
    if (body.id && typeof body.id === 'string' && body.id.trim() !== '') {
      id = body.id.trim();
    }
  } catch {
    // Ignore JSON parse errors and use the default name
  }

  const project = await prisma.project.create({
    data: {
      ...(id ? { id } : {}),
      ownerId: userId,
      name,
    },
  });

  return NextResponse.json(project);
}
