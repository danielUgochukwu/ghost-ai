# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Backend API routes

## Current Goal

- Await the next feature specification after completing `09-share-dialog`.

## Completed

- `01-design-system`: shadcn/ui is initialized, required primitives are installed, `lucide-react` is installed, `cn()` is available, and the global theme is dark-only.
- `02-editor`: base editor navbar, floating project sidebar shell, and reusable editor dialog content pattern are implemented.
- `03-auth`: Clerk is wired into the app with `ClerkProvider`, themed sign-in/sign-up pages, protected-first `proxy.ts`, root redirects, `/editor` route target, and the editor navbar user menu.
- `03-auth` UI polish: auth pages now use a screenshot-inspired 50/50 desktop split, a token-colored left brand panel, dark right form area, and explicit Geist Sans application.
- `04-project-dialog`: editor home screen, project dialog state hook, create/rename/delete dialogs, owned project sidebar actions, shared project action hiding, mock project data, and mobile sidebar scrim are implemented.
- `05-prisma`: Prisma schema and database layer are initialized. The `Project` and `ProjectCollaborator` models are created with appropriate indexes and relations. `lib/prisma.ts` acts as a cached singleton branching for Accelerate and PrismaPg. The first migration has been successfully executed and the generated client is type-safe.
- `06-project-apis`: Backend REST API routes for listing, creating, renaming, and deleting projects implemented using the App Router. Authenticated endpoints with proper ownership checks.
- `07-wire-editor-home`: Wired the editor home sidebar and dialogs to the real project API. Replaced mock data with server-side Prisma data fetching in `app/editor/page.tsx`, created `useProjectActions` hook to manage dialog state and API mutations (create, rename, delete), and updated the `POST /api/projects` route to accept client-generated room IDs.
- `08-editor-workspace-shell`: Built the `/editor/[roomId]` workspace shell with server-side access checks. Implemented `components/editor/access-denied.tsx`, `lib/project-access.ts` for evaluating user access against database models, `components/editor/workspace-shell.tsx` for layout containing canvas and sidebars placeholders, and updated `EditorNavbar` and `ProjectSidebar` to accommodate the workspace views. Type-checked successfully.
- `09-share-dialog`: Implemented the Share Dialog UI in the workspace allowing owners to invite and manage collaborators. Built `app/api/projects/[projectId]/collaborators` endpoints to retrieve, add, and remove project collaborators dynamically. Integrated Clerk's Backend API (`clerkClient().users.getUserList`) to enrich collaborator emails with real display names and avatars. Included Copy Link functionality via `navigator.clipboard`.

## In Progress

- None.

## Next Up

- Wait for the next feature specification.

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui semantic CSS variables are mapped to the Ghost AI dark theme tokens in `app/globals.css`, and the root layout applies the `dark` class to prevent light-mode styling.
- Editor-specific dialog styling is composed in `components/editor/editor-dialog.tsx` on top of the generated shadcn dialog primitives, keeping `components/ui/*` unchanged.
- Clerk route protection is implemented in root-level `proxy.ts` using a protected-first policy; sign-in and sign-up paths are derived from Clerk's standard public env vars with app-route fallbacks.
- Clerk appearance is centralized in `lib/clerk-appearance.ts`, using `@clerk/ui`'s dark theme with app CSS variable overrides and no hardcoded auth colors.

## Session Notes

- Started `04-project-dialog` after reading `context/feature-specs/04-project-dialog.md` and the required project context files.
- Implemented `04-project-dialog` using mock project data only: editor home New Project CTA, sidebar create/rename/delete wiring, live slug preview, rename autofocus and Enter submit, destructive delete confirmation, owned-only sidebar actions, and mobile outside-tap scrim.
- Verification passed with `npm run lint` and `npx tsc --noEmit`. An existing Next dev server is running at `http://localhost:3000`.
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
- Verified Clerk proxy and skill-eval findings: updated `proxy.ts` to use the full Clerk handler signature, updated the Clerk skill eval to reference `proxy.ts`, and replaced an internal Clerk appearance type import with the public `@clerk/nextjs/types` provider prop type so validation passes.
- Verified the Clerk basic-auth template path alias finding: updated the template `tsconfig.json` `@/*` mapping to match its root-level `app` directory.
- Verified the Clerk middleware strategy reference filename mapping: updated the docs to identify `proxy.ts` as the Next.js 16+ convention and `middleware.ts` as the Next.js <=15 filename.
- Verified the Clerk API-route reference authorization helper finding: updated the docs so `auth()` is awaited and `has()` is called synchronously when setting `isAdmin`.
- Started `05-prisma` after reviewing `context/feature-specs/05-prisma.md`.
- Implemented `Project` and `ProjectCollaborator` models in `prisma/models/project.prisma`.
- Created `lib/prisma.ts` Prisma Client singleton with branch logic for Prisma Postgres Accelerate vs standard `@prisma/adapter-pg`.
- Configured `prisma.config.ts` to load `.env.local` to securely pass `DATABASE_URL` via environment variables.
- Verified schema and database sync with `npx prisma migrate dev --name add_project_models`. Generated typed client using Prisma v7 module loading. Build passed.
- Started `06-project-apis` after reading the feature spec and project context.
- Implemented `/api/projects` GET and POST, and `/api/projects/[projectId]` PATCH and DELETE endpoints.
- Enforced project owner authentication checks across all endpoints.
- Resolved Prisma client TypeScript strictness issues by unifying the client return type when missing the Accelerate extension.
- Verification passed with `npm run lint`, `npx.cmd tsc --noEmit`, and `npm run build`.
