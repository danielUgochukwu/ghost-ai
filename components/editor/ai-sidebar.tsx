"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, FileText, Download } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm",
          isUser
            ? "border-2 border-brand/50 bg-accent-dim text-copy-primary"
            : "border border-surface-border bg-elevated text-ai-text"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function DemoSpecCard() {
  return (
    <div className="rounded-2xl border border-surface-border bg-elevated p-4">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ai-text" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-copy-primary">Microservices Architecture</p>
          <p className="mt-1 text-xs text-copy-muted line-clamp-2">
            A scalable e-commerce backend with API gateway, auth service, product catalog,
            order management, and notification services.
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled
          className="gap-1.5 text-copy-faint"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </Button>
      </div>
    </div>
  );
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, role: "user", content: trimmed },
    ]);
    setInputValue("");
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
    <aside
      aria-label="AI sidebar"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={cn(
        "fixed right-4 top-[4.5rem] z-30 flex h-[calc(100dvh-5.5rem)] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-surface-border bg-base/95 text-copy-primary shadow-2xl backdrop-blur-xl transition-transform duration-200 ease-out",
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

      {/* Tabs */}
      <Tabs defaultValue="architect" className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 grid shrink-0 grid-cols-2 bg-elevated">
          <TabsTrigger
            value="architect"
            className="text-copy-muted data-active:bg-ai/20 data-active:text-ai-text"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="text-copy-muted data-active:bg-ai/20 data-active:text-ai-text"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        {/* AI Architect Tab */}
        <TabsContent
          value="architect"
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 mt-3"
        >
          <div className="min-h-0 flex-1 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 ? (
              <EmptyState onPromptClick={handlePromptClick} />
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="mt-3 shrink-0 rounded-xl border border-surface-border bg-elevated p-2">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Ghost AI anything…"
              className="min-h-[72px] max-h-[160px] resize-none border-none bg-transparent p-1 text-sm text-copy-primary placeholder:text-copy-muted focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                size="sm"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="gap-1.5 bg-ai text-white hover:bg-ai/90 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent
          value="specs"
          className="flex flex-col gap-3 overflow-y-auto px-4 pb-4 mt-3"
        >
          <Button
            type="button"
            className="w-full gap-2 bg-ai text-white hover:bg-ai/90"
          >
            <FileText className="h-4 w-4" />
            Generate Spec
          </Button>
          <DemoSpecCard />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
