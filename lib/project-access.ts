import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getProjectAccess(roomId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return { hasAccess: false, project: null, reason: "unauthenticated" };
  }

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress;

  const project = await prisma.project.findUnique({
    where: { id: roomId },
    include: {
      collaborators: true,
    },
  });

  if (!project) {
    return { hasAccess: false, project: null, reason: "not_found" };
  }

  const isOwner = project.ownerId === userId;
  const isCollaborator = Boolean(
    primaryEmail && project.collaborators.some((c) => c.email === primaryEmail)
  );

  if (!isOwner && !isCollaborator) {
    return { hasAccess: false, project: null, reason: "unauthorized" };
  }

  return {
    hasAccess: true,
    project,
    isOwner,
    isCollaborator,
    identity: {
      userId,
      email: primaryEmail,
    },
  };
}
