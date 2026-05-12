import type { Appearance } from "@clerk/ui/internal";
import { dark } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorBackground: "var(--bg-surface)",
    colorForeground: "var(--text-primary)",
    colorMuted: "var(--bg-subtle)",
    colorMutedForeground: "var(--text-muted)",
    colorInput: "var(--bg-elevated)",
    colorInputForeground: "var(--text-primary)",
    colorBorder: "var(--border-default)",
    colorRing: "var(--accent-primary)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    fontFamily: "var(--font-geist-sans)",
    fontFamilyButtons: "var(--font-geist-sans)",
    borderRadius: "var(--radius)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full",
    card: "w-full border-0 bg-transparent shadow-none",
    header: "text-center",
    footer: "bg-transparent",
    main: "gap-4",
    socialButtonsBlockButton:
      "border-surface-border-subtle bg-base text-copy-primary shadow-none hover:bg-subtle",
    dividerLine: "bg-surface-border",
    dividerText: "text-copy-muted",
    formFieldInput:
      "border-surface-border-subtle bg-elevated text-copy-primary shadow-none",
    formButtonPrimary:
      "bg-ai text-copy-primary shadow-none hover:bg-ai/90",
    footerActionLink: "text-brand hover:text-brand",
    headerTitle: "text-copy-primary",
    headerSubtitle: "text-copy-secondary",
    identityPreviewEditButton: "text-brand hover:text-brand",
    userButtonPopoverCard: "border border-surface-border bg-elevated shadow-none",
    userButtonPopoverActionButton:
      "text-copy-secondary hover:bg-subtle hover:text-copy-primary",
    userButtonTrigger:
      "rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  },
} satisfies Appearance;
