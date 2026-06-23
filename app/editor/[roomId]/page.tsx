import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import { getProjectAccess } from "@/lib/project-access";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/workspace-shell";
import { prisma } from "@/lib/prisma";
import type { ProjectData } from "@/components/editor/project-types";

function formatUpdatedLabel(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `Updated ${minutes}m ago`;
  if (hours < 24) return `Updated ${hours}h ago`;
  if (days === 1) return `Updated yesterday`;
  if (days < 7) return `Updated ${days} days ago`;
  return `Updated on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { roomId } = await params;
  
  const access = await getProjectAccess(roomId);

  if (access.reason === "unauthenticated") {
    redirect("/sign-in");
  }

  if (!access.hasAccess || !access.project) {
    return <AccessDenied />;
  }

  const { userId, email } = access.identity!;

  // Fetch the project owner's display info from Clerk
  const clerk = await clerkClient();
  const ownerClerkUser = await clerk.users.getUser(access.project.ownerId);
  const ownerPrimaryEmail = ownerClerkUser.primaryEmailAddress?.emailAddress ?? null;
  const projectOwner = {
    name: `${ownerClerkUser.firstName ?? ""} ${ownerClerkUser.lastName ?? ""}`.trim() || null,
    email: ownerPrimaryEmail,
    avatarUrl: ownerClerkUser.imageUrl ?? null,
  };

  // Fetch owned projects
  const ownedDbProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });

  const ownedProjects: ProjectData[] = ownedDbProjects.map((p) => ({
    id: p.id,
    name: p.name,
    access: "owner",
    updatedLabel: formatUpdatedLabel(p.updatedAt),
  }));

  // Fetch shared projects (where user is a collaborator)
  let sharedProjects: ProjectData[] = [];
  if (email) {
    const sharedDbProjects = await prisma.project.findMany({
      where: {
        collaborators: {
          some: { email },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    sharedProjects = sharedDbProjects.map((p) => ({
      id: p.id,
      name: p.name,
      access: "collaborator",
      updatedLabel: formatUpdatedLabel(p.updatedAt),
    }));
  }

  return (
    <WorkspaceShell
      project={{ id: access.project.id, name: access.project.name }}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      isOwner={access.isOwner}
      projectOwner={projectOwner}
    />
  );
}
