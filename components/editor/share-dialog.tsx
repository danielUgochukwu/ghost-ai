"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, Link as LinkIcon, Mail, Trash2, Loader2 } from "lucide-react";
import { EditorDialogContent } from "@/components/editor/editor-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Collaborator {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface ProjectOwner {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  isOwner: boolean;
  projectOwner: ProjectOwner;
}

function Avatar({ name, email, avatarUrl }: { name: string | null; email: string | null; avatarUrl: string | null }) {
  const initial = (name?.[0] ?? email?.[0] ?? "?").toUpperCase();
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium text-copy-muted">
      {initial}
    </div>
  );
}

export function ShareDialog({ isOpen, onClose, projectId, isOwner, projectOwner }: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollaborators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) throw new Error("Failed to load collaborators");
      setCollaborators(await res.json());
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      loadCollaborators();
    }
  }, [isOpen, loadCollaborators]);

  function handleClose() {
    setInviteEmail("");
    setError(null);
    onClose();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to invite");
      setCollaborators((prev) => [...prev, data]);
      setInviteEmail("");
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemove(collaboratorId: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators/${collaboratorId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove");
      setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
    } catch (err: any) {
      setError(err.message ?? "An error occurred");
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalCount = 1 + collaborators.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <EditorDialogContent
        title="Share project"
        description="Invite collaborators, copy the workspace link, and manage access."
        className="space-y-4"
      >
        <div className="">
          {/* Workspace link card */}
          <div className="rounded-xl border border-surface-border bg-subtle p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-copy-primary">
                  Workspace link
                </p>
                <p className="mt-0.5 text-xs text-copy-muted">
                  Share a direct link with teammates after you grant them
                  access.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 border border-surface-border"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                <span className="ml-1.5">
                  {copied ? "Copied!" : "Copy link"}
                </span>
              </Button>
            </div>
          </div>

          {/* Invite by email (owner only) */}
          {isOwner && (
            <form onSubmit={handleInvite}>
              <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-subtle px-4 py-3">
                <div className="flex flex-1 items-center gap-3 px-3 py-2">
                  <Mail className="h-4 w-4 text-copy-muted" />

                  <Input
                    type="email"
                    placeholder="Invite by email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                    className="border"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isInviting || !inviteEmail.trim()}
                  className="shrink-0 bg-brand text-white hover:bg-brand/90"
                >
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Invite"
                  )}
                </Button>
              </div>
            </form>
          )}

          {error && <p className="text-sm text-error">{error}</p>}

          {/* People with access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">People with access</p>

              {!isLoading && (
                <p className="text-xs text-copy-muted">{totalCount} total</p>
              )}
            </div>

            <div className="rounded-2xl border border-surface-border bg-subtle p-4">
              {/* Owner */}
              <div className="flex items-center gap-3">
                <Avatar
                  name={projectOwner.name}
                  email={projectOwner.email}
                  avatarUrl={projectOwner.avatarUrl}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {projectOwner.name ?? projectOwner.email}
                    </p>

                    <span className="shrink-0 border border-surface-border px-2 py-1 rounded-md font-semibold uppercase tracking-wide text-brand">
                      Owner
                    </span>
                  </div>

                  <p className="truncate text-xs text-copy-muted">
                    {projectOwner.email}
                  </p>
                </div>
              </div>

              {/* Collaborators */}
              {collaborators.length > 0 && (
                <div className="mt-4 space-y-4 border-t border-surface-border pt-4">
                  {collaborators.map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <Avatar
                        name={c.name}
                        email={c.email}
                        avatarUrl={c.avatarUrl}
                      />

                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {c.name ?? c.email}
                        </p>

                        {c.name && (
                          <p className="text-xs text-copy-muted">{c.email}</p>
                        )}
                      </div>

                      {isOwner && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </EditorDialogContent>
    </Dialog>
  );
}
