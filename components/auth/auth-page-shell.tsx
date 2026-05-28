import type { ReactNode } from "react";

interface AuthPageShellProps {
  children: ReactNode;
}

const authFeatures = [
  "Create private architecture projects.",
  "Collaborate in protected workspaces.",
  "Generate specs from signed-in sessions.",
];

const authPanelMarks = Array.from({ length: 20 }, (_, index) => index);

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="flex items-center justify-center bg-base px-4 py-6 font-sans text-copy-primary sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden bg-base lg:min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-surface px-8 py-8 lg:flex lg:flex-col">
          <div
            aria-hidden="true"
            className="absolute inset-0 grid grid-cols-4 grid-rows-5 text-copy-primary/15"
          >
            {authPanelMarks.map((mark) => (
              <span
                key={mark}
                className="flex items-center justify-center text-2xl font-light"
              >
                +
              </span>
            ))}
          </div>
          <div className="absolute inset-0 bg-base/35" aria-hidden="true" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border-subtle bg-accent-dim text-sm font-semibold text-copy-primary">
              GA
            </div>
            <span className="text-sm font-semibold tracking-normal text-copy-primary">
              Ghost AI
            </span>
          </div>

          <div className="relative mt-auto max-w-lg pb-30">
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal text-primary">
              Your Systems.
              <br />
              Your Teams.
              <br />
              Your Specs.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-copy-secondary">
              A protected workspace for shaping architecture diagrams with AI
              and collaborators.
            </p>
            <ul className="mt-8 space-y-2 text-sm leading-6 text-copy-secondary">
              {authFeatures.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex min-h-dvh items-center justify-center bg-base px-4 py-8 sm:px-6 lg:min-h-0 lg:px-14">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
