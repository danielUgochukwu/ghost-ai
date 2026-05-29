import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
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

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

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

  return <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects} />;
}
