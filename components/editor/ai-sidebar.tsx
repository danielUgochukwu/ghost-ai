"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, FileText, Download, Loader2, AlertCircle, MessageSquare } from "lucide-react";
import {
  useEventListener,
  useFeedMessages,
  useCreateFeed,
  useCreateFeedMessage,
  useSelf,
} from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import ReactMarkdown from "react-markdown";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  validateAiStatusMessage,
  validateChatMessage,
  type AiStatusMessage,
  type ChatMessageData,
} from "@/types/tasks";
import type { CanvasNode, CanvasEdge } from "@/types/canvas";


interface ProjectSpec {
  id: string;
  filePath: string;
  createdAt: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  getCanvasState?: () => { nodes: CanvasNode[]; edges: CanvasEdge[] };
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

function EmptyState({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <Bot className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">
        Describe a system and Ghost AI will design it as a canvas diagram.
      </p>
      <div className="flex w-full flex-col gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPromptClick(prompt)}
            className="rounded-xl bg-subtle px-3 py-2 text-left text-xs text-ai-text transition-colors hover:bg-elevated"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ data }: { data: ChatMessageData }) {
  const isUser = data.role === "user";
  const time = new Date(data.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex flex-col gap-0.5", isUser ? "items-end" : "items-start")}>
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-xs font-medium text-copy-muted">{data.senderName}</span>
        <span className="text-[10px] text-copy-faint">{time}</span>
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
          isUser
            ? "bg-success text-base font-medium"
            : "border border-surface-border bg-elevated text-ai-text"
        )}
      >
        {data.content}
      </div>
    </div>
  );
}

function getFilename(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function getSpecDisplayName(createdAt: string): string {
  return new Date(createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SpecListItem({
  spec,
  onPreview,
  onDownload,
}: {
  spec: ProjectSpec;
  onPreview: (spec: ProjectSpec) => void;
  onDownload: (specId: string) => void;
}) {
  const displayName = getSpecDisplayName(spec.createdAt);
  const fullDate = new Date(spec.createdAt).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group flex items-center gap-2 rounded-xl border border-surface-border bg-elevated p-3 transition-colors hover:border-border-subtle">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        onClick={() => onPreview(spec)}
      >
        <FileText className="h-4 w-4 shrink-0 text-ai-text" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-copy-primary">Architecture Spec</p>
          <p className="text-[10px] text-copy-faint">{displayName} · {fullDate}</p>
        </div>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Download spec"
        onClick={(e) => {
          e.stopPropagation();
          onDownload(spec.id);
        }}
        className="shrink-0 text-copy-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-copy-primary"
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="mb-3 mt-6 text-base font-bold text-copy-primary first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 mt-5 text-sm font-semibold text-copy-primary">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-4 text-sm font-medium text-copy-primary">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-3 text-sm leading-relaxed text-copy-secondary">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm text-copy-secondary">{children}</li>
        ),
        pre: ({ children }) => (
          <pre className="mb-3 overflow-x-auto rounded-xl bg-subtle p-3 text-xs">{children}</pre>
        ),
        code: ({ children, className }) =>
          className ? (
            <code className={cn("font-mono text-copy-primary", className)}>{children}</code>
          ) : (
            <code className="rounded px-1 py-0.5 bg-subtle font-mono text-xs text-ai-text">
              {children}
            </code>
          ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-2 border-surface-border pl-3 italic text-copy-muted">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-4 border-surface-border" />,
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-ai-text underline hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function AiSidebar({ isOpen, onClose, roomId, getCanvasState }: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState("architect");
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [latestStatus, setLatestStatus] = useState<AiStatusMessage | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);

  // Specs state
  const [specs, setSpecs] = useState<ProjectSpec[]>([]);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [specsError, setSpecsError] = useState(false);
  const [previewSpec, setPreviewSpec] = useState<ProjectSpec | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Spec generation run tracking
  const [specRunId, setSpecRunId] = useState<string | null>(null);
  const [specToken, setSpecToken] = useState<string | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [specGenError, setSpecGenError] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatFeedId = `ai-chat-${roomId}`;

  const self = useSelf();
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const { messages, isLoading: isChatLoading } = useFeedMessages(chatFeedId);

  const validMessages = (messages ?? [])
    .map((m) => validateChatMessage(m.data))
    .filter((m): m is ChatMessageData => m !== null);

  const isRunning = !!runId;
  const isDisabled = isSending || isRunning;

  const createFeedMessageRef = useRef(createFeedMessage);
  useEffect(() => {
    createFeedMessageRef.current = createFeedMessage;
  }, [createFeedMessage]);

  useRealtimeRun(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: isRunning,
    onComplete: (completedRun, err) => {
      const content =
        !err && completedRun.status === "COMPLETED"
          ? "Done! Your canvas has been updated."
          : "Something went wrong. Please try again.";

      createFeedMessageRef.current(chatFeedId, {
        sender: "ghost-ai",
        senderName: "Ghost AI",
        role: "ai",
        content,
        timestamp: Date.now(),
      }).catch(() => {});

      setRunId(null);
      setPublicToken(null);
      setLatestStatus(null);
    },
  });

  useRealtimeRun(specRunId ?? undefined, {
    accessToken: specToken ?? undefined,
    enabled: !!specRunId,
    onComplete: (_completedRun, _err) => {
      setSpecRunId(null);
      setSpecToken(null);
      setIsGeneratingSpec(false);
      // Refresh the spec list after generation completes
      fetchSpecsList();
    },
  });

  useEffect(() => {
    createFeed(chatFeedId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatFeedId]);

  useEventListener(({ event }) => {
    if (event.type !== "ai-status") return;
    const validated = validateAiStatusMessage(event);
    if (!validated) return;
    setLatestStatus(validated);
  });

  useEffect(() => {
    if (validMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [validMessages.length]);

  function fetchSpecsList() {
    setSpecsLoading(true);
    setSpecsError(false);
    fetch(`/api/projects/${roomId}/specs`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch specs");
        return r.json() as Promise<{ specs: ProjectSpec[] }>;
      })
      .then(({ specs: data }) => setSpecs(data ?? []))
      .catch(() => setSpecsError(true))
      .finally(() => setSpecsLoading(false));
  }

  // Fetch specs whenever the sidebar is opened
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (isOpen) fetchSpecsList(); }, [isOpen, roomId]);

  async function handleGenerateSpec() {
    if (isGeneratingSpec) return;
    setIsGeneratingSpec(true);
    setSpecGenError(false);

    try {
      const { nodes, edges } = getCanvasState?.() ?? { nodes: [], edges: [] };

      const specRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory: validMessages.map((m) => ({
            role: m.role as "user" | "ai",
            content: m.content,
            senderName: m.senderName,
          })),
          nodes,
          edges,
        }),
      });

      if (!specRes.ok) throw new Error("Failed to start spec generation");
      const { runId: newRunId } = (await specRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get spec token");
      const { token } = (await tokenRes.json()) as { token: string };

      setSpecRunId(newRunId);
      setSpecToken(token);
    } catch {
      setIsGeneratingSpec(false);
      setSpecGenError(true);
    }
  }

  function openPreview(spec: ProjectSpec) {
    setPreviewSpec(spec);
    setPreviewContent(null);
    setPreviewError(false);
    setPreviewLoading(true);
    fetch(`/api/projects/${roomId}/specs/${spec.id}/download`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch spec content");
        return r.text();
      })
      .then((text) => {
        setPreviewContent(text);
      })
      .catch(() => {
        setPreviewError(true);
      })
      .finally(() => {
        setPreviewLoading(false);
      });
  }

  function downloadSpec(specId: string) {
    const a = document.createElement("a");
    a.href = `/api/projects/${roomId}/specs/${specId}/download`;
    a.click();
  }

  async function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed || isDisabled) return;

    setSendError(false);
    setInputValue("");
    setIsSending(true);

    try {
      await createFeedMessage(chatFeedId, {
        sender: self?.id ?? "anonymous",
        senderName: self?.info?.name ?? "Unknown",
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      });

      const designRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, roomId, projectId: roomId }),
      });

      if (!designRes.ok) throw new Error("Failed to start AI design");
      const { runId: newRunId } = (await designRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      });

      if (!tokenRes.ok) throw new Error("Failed to get run token");
      const { token } = (await tokenRes.json()) as { token: string };

      setRunId(newRunId);
      setPublicToken(token);
      setActiveTab("chat");
    } catch {
      setSendError(true);
      setInputValue(trimmed);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handlePromptClick(prompt: string) {
    setInputValue(prompt);
    textareaRef.current?.focus();
  }

  return (
    <>
      <aside
        aria-label="AI sidebar"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        className={cn(
          "fixed right-4 top-18 z-30 flex h-[calc(100dvh-5.5rem)] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-surface-border bg-base/95 text-copy-primary shadow-2xl backdrop-blur-xl transition-transform duration-200 ease-out",
          isOpen
            ? "translate-x-0"
            : "translate-x-[calc(100%+2rem)] pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-surface-border p-4 pb-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <Bot className="mt-0.5 h-5 w-5 shrink-0 text-ai-text" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-copy-primary">AI Workspace</p>
              <p className="text-xs text-copy-muted">Collaborate with Ghost AI</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close AI sidebar"
            onClick={onClose}
            className="shrink-0 text-copy-muted hover:bg-subtle hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status strip — only visible while a run is active */}
        {isRunning && (
          <div className="flex shrink-0 items-center gap-2 border-b border-surface-border bg-success/10 px-4 py-2">
            <Loader2 className="h-3 w-3 shrink-0 animate-spin text-success" />
            <span className="truncate text-xs text-success">
              {latestStatus?.message ?? "Ghost AI is working…"}
            </span>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === "specs") fetchSpecsList(); }} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 grid shrink-0 grid-cols-3 bg-elevated">
            <TabsTrigger
              value="architect"
              className="text-copy-muted data-active:bg-ai/20 data-active:text-ai-text"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="text-copy-muted data-active:bg-ai/20 data-active:text-ai-text"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="text-copy-muted data-active:bg-ai/20 data-active:text-ai-text"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          {/* AI Architect Tab — input only */}
          <TabsContent
            value="architect"
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 mt-3"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <EmptyState onPromptClick={handlePromptClick} />
            </div>

            {sendError && (
              <div className="mt-2 flex shrink-0 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Failed to send message. Please try again.
              </div>
            )}

            <div className="mt-3 shrink-0 rounded-xl border border-surface-border bg-elevated p-2">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                placeholder={isRunning ? "Ghost AI is working…" : "Ask Ghost AI anything…"}
                className="min-h-18 max-h-40 resize-none border-none bg-transparent p-1 text-sm text-copy-primary placeholder:text-copy-muted focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isDisabled}
                  className="gap-1.5 bg-success text-base hover:bg-success/90 disabled:opacity-40"
                >
                  {isSending || isRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {isRunning ? "Working…" : isSending ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab — conversation history */}
          <TabsContent
            value="chat"
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 mt-3"
          >
            <div className="min-h-0 flex-1 overflow-y-auto space-y-3 pr-1">
              {isChatLoading ? (
                <div className="flex flex-1 items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-copy-faint" />
                </div>
              ) : validMessages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-copy-faint" />
                  <p className="text-sm text-copy-muted">No conversation yet.</p>
                  <p className="text-xs text-copy-faint">
                    Start by typing a prompt in the AI Architect tab.
                  </p>
                </div>
              ) : (
                <>
                  {validMessages.map((data, i) => (
                    <ChatMessage key={(messages ?? [])[i]?.id ?? i} data={data} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </TabsContent>

          {/* Specs Tab */}
          <TabsContent
            value="specs"
            className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 mt-3"
          >
            {specsLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-copy-faint" />
              </div>
            ) : specsError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <AlertCircle className="h-5 w-5 text-state-error" />
                <p className="text-xs text-copy-muted">Failed to load specs.</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-copy-faint"
                  onClick={fetchSpecsList}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <Button
                  type="button"
                  onClick={handleGenerateSpec}
                  disabled={isGeneratingSpec}
                  className="w-full shrink-0 gap-2 bg-ai text-white hover:bg-ai/90 disabled:opacity-60"
                >
                  {isGeneratingSpec ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {isGeneratingSpec ? "Generating…" : "Generate Spec"}
                </Button>

                {specGenError && (
                  <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Failed to generate spec. Please try again.
                  </div>
                )}

                {specs.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                    <FileText className="h-8 w-8 text-copy-faint" />
                    <p className="text-sm text-copy-muted">No specs yet.</p>
                    <p className="text-xs text-copy-faint">
                      Click &quot;Generate Spec&quot; to create one from your canvas.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="min-h-0 flex-1">
                    <div className="flex flex-col gap-2 pr-1">
                      {specs.map((spec) => (
                        <SpecListItem
                          key={spec.id}
                          spec={spec}
                          onPreview={openPreview}
                          onDownload={downloadSpec}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </aside>

      {/* Spec Preview Modal */}
      <Dialog open={!!previewSpec} onOpenChange={(open) => !open && setPreviewSpec(null)}>
        <DialogContent
          className="flex max-h-[80dvh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-3xl border-surface-border bg-surface p-0"
          onEscapeKeyDown={() => setPreviewSpec(null)}
        >
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-3 border-b border-surface-border p-5 pb-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <FileText className="h-4 w-4 shrink-0 text-ai-text" />
              <DialogTitle className="truncate text-sm font-medium text-copy-primary">
                {previewSpec ? `Architecture Spec — ${getSpecDisplayName(previewSpec.createdAt)}` : ""}
              </DialogTitle>
            </div>
            {previewSpec && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => downloadSpec(previewSpec.id)}
                className="shrink-0 gap-1.5 text-copy-muted hover:text-copy-primary"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            )}
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="p-5">
              {previewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-copy-faint" />
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <AlertCircle className="h-6 w-6 text-state-error" />
                  <p className="text-sm text-copy-muted">Failed to load spec content.</p>
                </div>
              ) : previewContent !== null ? (
                <MarkdownContent content={previewContent} />
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
