export type ProjectAccess = "owner" | "collaborator";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  access: ProjectAccess;
  updatedLabel: string;
}
