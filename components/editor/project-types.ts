export type ProjectAccess = "owner" | "collaborator";

export interface ProjectData {
  id: string;
  name: string;
  access: ProjectAccess;
  updatedLabel: string;
}
