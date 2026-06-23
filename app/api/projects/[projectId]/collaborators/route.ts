import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Need to ensure the caller has access (either owner or already a collaborator)
  // But wait, do we have the user's email to check if they are a collaborator?
  // We can just rely on the fact that if they reached this route from the UI, they already passed the page-level access check.
  // However, for API security, we should check it.
  
  // Actually, we can fetch the current user's email from clerk if they are not the owner.
  let hasAccess = project.ownerId === userId;
  
  if (!hasAccess) {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const primaryEmail = user.primaryEmailAddress?.emailAddress;
    if (primaryEmail && project.collaborators.some((c) => c.email === primaryEmail)) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Enrich with Clerk user data
  const emails = project.collaborators.map((c) => c.email);
  let clerkUsers: any[] = [];
  
  if (emails.length > 0) {
    try {
      const clerk = await clerkClient();
      const response = await clerk.users.getUserList({
        emailAddress: emails,
      });
      clerkUsers = response.data;
    } catch (e) {
      console.error("Failed to fetch Clerk users", e);
    }
  }

  const enrichedCollaborators = project.collaborators.map((collaborator) => {
    const clerkUser = clerkUsers.find((u) => 
      u.emailAddresses.some((e: any) => e.emailAddress === collaborator.email)
    );
    
    return {
      id: collaborator.id,
      email: collaborator.email,
      name: clerkUser ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null : null,
      avatarUrl: clerkUser?.imageUrl || null,
      createdAt: collaborator.createdAt,
    };
  });

  return NextResponse.json(enrichedCollaborators);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
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
    return NextResponse.json({ error: "Forbidden - only owners can invite" }, { status: 403 });
  }

  let email;
  try {
    const body = await req.json();
    email = body.email;
    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    email = email.trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Prevent inviting owner
  const clerk = await clerkClient();
  const ownerUser = await clerk.users.getUser(userId);
  if (ownerUser.primaryEmailAddress?.emailAddress?.toLowerCase() === email) {
    return NextResponse.json({ error: "Cannot invite the project owner" }, { status: 400 });
  }

  try {
    const newCollaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email,
      },
    });

    // Enrich immediately
    let name = null;
    let avatarUrl = null;
    try {
      const response = await clerk.users.getUserList({ emailAddress: [email] });
      const clerkUser = response.data[0];
      if (clerkUser) {
        name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null;
        avatarUrl = clerkUser.imageUrl || null;
      }
    } catch (e) {
      console.error("Failed to fetch Clerk user for new collaborator", e);
    }

    return NextResponse.json({
      id: newCollaborator.id,
      email: newCollaborator.email,
      name,
      avatarUrl,
      createdAt: newCollaborator.createdAt,
    });
  } catch (error: any) {
    // Unique constraint violation for projectId + email
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Collaborator already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
