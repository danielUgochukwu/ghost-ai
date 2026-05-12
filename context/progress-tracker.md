# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Authentication setup

## Current Goal

- Await the next feature unit after completing `03-auth` auth-page UI polish.

## Completed

- `01-design-system`: shadcn/ui is initialized, required primitives are installed, `lucide-react` is installed, `cn()` is available, and the global theme is dark-only.
- `02-editor`: base editor navbar, floating project sidebar shell, and reusable editor dialog content pattern are implemented.
- `03-auth`: Clerk is wired into the app with `ClerkProvider`, themed sign-in/sign-up pages, protected-first `proxy.ts`, root redirects, `/editor` route target, and the editor navbar user menu.
- `03-auth` UI polish: auth pages now use a screenshot-inspired 50/50 desktop split, a token-colored left brand panel, dark right form area, and explicit Geist Sans application.

## In Progress

- None.

## Next Up

- Select the next feature spec or foundation unit.

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui semantic CSS variables are mapped to the Ghost AI dark theme tokens in `app/globals.css`, and the root layout applies the `dark` class to prevent light-mode styling.
- Editor-specific dialog styling is composed in `components/editor/editor-dialog.tsx` on top of the generated shadcn dialog primitives, keeping `components/ui/*` unchanged.
- Clerk route protection is implemented in root-level `proxy.ts` using a protected-first policy; sign-in and sign-up paths are derived from Clerk's standard public env vars with app-route fallbacks.
- Clerk appearance is centralized in `lib/clerk-appearance.ts`, using `@clerk/ui`'s dark theme with app CSS variable overrides and no hardcoded auth colors.

## Session Notes

- Initialized shadcn/ui with the Radix Nova preset, added the required primitive components, and mapped shadcn semantic variables to the Ghost AI dark theme in `app/globals.css`.
- Verification passed with `npm run lint`, `npx tsc --noEmit`, a direct `cn()` merge check, and a scan for default light tokens. `npm run build` was blocked by the existing `next/font/google` network fetch after escalation was declined.
- Started `02-editor` after reading the editor feature spec and required project context files.
- Implemented `components/editor/editor-navbar.tsx`, `components/editor/project-sidebar.tsx`, and `components/editor/editor-dialog.tsx`.
- Verification passed with `npm run lint` and `npx tsc --noEmit`.
- Started `03-auth` after reading `context/feature-specs/03-auth.md`, the required project context files, the local Next.js 16 Proxy docs, and the local Clerk Next.js patterns skill.
- Installed `@clerk/ui` for Clerk's dark theme support.
- Implemented the auth provider, shared Clerk appearance, auth route helpers, protected-first proxy, sign-in/sign-up routes, root redirect behavior, editor route shell, and editor `UserButton`.
- Verification passed with `npm run lint`, `npx tsc --noEmit`, and `npm run build`. The production build requires network access for the existing `next/font/google` Geist font fetch.
- Started auth-page UI polish from the provided screenshot: desktop auth pages now use a centered 50/50 split frame, the left panel uses the app AI accent token with subtle plus marks, the right side keeps the Clerk form on the dark workspace background, and the root body explicitly applies Geist Sans.
- Verification passed with `npm run lint`, `npx tsc --noEmit`, a token/style scan for auth files, and `npm run build`. An existing dev server is available at `http://localhost:3001`, and `/sign-up` returns 200.
