# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Backend API routes

## Current Goal

- Await the next feature specification after completing `20-ai-sidebar-shell`.

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
- `10-liveblocks-setup`: Installed `@liveblocks/node`. Updated `liveblocks.config.ts` with `Presence` (cursor position, `isThinking`) and `UserMeta` (id, name, avatar, cursorColor). Created `lib/liveblocks.ts` with a lazy-initialized cached `Liveblocks` node client and a deterministic `getCursorColor` helper. Created `POST /api/liveblocks-auth` which verifies Clerk auth, checks project access via `getProjectAccess`, ensures the Liveblocks room exists with `getOrCreateRoom`, and returns a session token with user name, avatar, and cursor color attached. Build passes.
- `11-base-canvas`: Created `types/canvas.ts` with `NodeData`, `CanvasNode`, `CanvasEdge`, `NODE_SHAPES`, and `NODE_COLORS`. Created `components/editor/canvas-flow.tsx` which uses `useLiveblocksFlow({ suspense: true })` to wire React Flow to Liveblocks-synced nodes and edges, with dot-pattern `Background`, `MiniMap`, `fitView`, and `ConnectionMode.Loose`. Created `components/editor/canvas-wrapper.tsx` which sets up `LiveblocksProvider` (auth endpoint `/api/liveblocks-auth`), `RoomProvider` (initial cursor presence), `ClientSideSuspense` loading fallback, and a class-based `LiveblocksErrorBoundary`. Replaced the canvas placeholder in `workspace-shell.tsx` with `<CanvasWrapper roomId={project.id} />`. Build passes.
- `12-shape-panel`: Created `components/editor/canvas-node.tsx` — a `canvasNode` custom node renderer that fills its RF container with a bordered rectangle, centered label, and 4 source handles at each side; text color is looked up from `NODE_COLORS` by fill. Created `components/editor/shape-panel.tsx` — a pill-shaped `Panel position="bottom-center"` toolbar with 6 draggable icon buttons (rectangle, diamond, circle, pill, cylinder, hexagon); drag start sets `application/ghost-shape` MIME payload with shape name and default size. Updated `canvas-flow.tsx`: added `nodeTypes = { canvasNode: CanvasNodeRenderer }`, captured `ReactFlowInstance` via `onInit` ref, added `onDragOver` (guards on MIME type) and `onDrop` (reads payload, converts screen→canvas via `screenToFlowPosition`, calls `onNodesChange([{ type: "add", item: newNode }])` with a shape/timestamp/counter ID). Build passes.
- `13-node-shape`: Replaced placeholder node renderer in `canvas-node.tsx` with shape-aware rendering — rectangle, pill, and circle use CSS border-radius, while diamond, hexagon, and cylinder render as inline SVGs that scale with node size via `preserveAspectRatio="none"`. Border color is `var(--border-default)` at rest and `var(--accent-primary)` when selected; SVG stroke uses `style` prop so CSS custom properties resolve correctly. Added a drag ghost preview to `shape-panel.tsx` — on drag start the browser default ghost is suppressed via a 1×1 transparent PNG, a `GhostPreview` component is portal-rendered at 50 % of the default node size and tracks the cursor via a `mousemove` listener; it clears on `dragend`. `npx tsc --noEmit` passes.
- `14-node-editing`: Added `NodeResizer` (from `@xyflow/react`) to `canvas-node.tsx` — visible only when selected, accent-colored handles, minimum 80×40 size. Added inline label editing via a `textarea` overlay that appears on double-click, tracked with `isEditing`/`editValue` state; commits on blur or Escape, prevents canvas drag/pan via `nodrag nopan` classes and pointer event stopPropagation. Label updates flow through `useReactFlow().updateNodeData()` which fires `onNodesChange` in controlled mode and syncs to Liveblocks. `npx tsc --noEmit` passes.
- `15-node-color-toolbar`: Added `ColorToolbar` component in `canvas-node.tsx` — a pill-shaped floating toolbar rendered above selected nodes using `position: absolute; bottom: 100%`. Shows one swatch per `NODE_COLORS` entry. Active swatch displays a double-ring using its paired text color (`box-shadow: 0 0 0 2px bg-elevated, 0 0 0 3.5px text`); hover on inactive swatches shows a tight text-color glow (`0 0 6px 2px text55`). Clicking a swatch calls `updateNodeData(id, { color: fill })` which syncs to Liveblocks; text color is derived automatically from fill via `getTextColor`. `nodrag nopan` classes and pointer event `stopPropagation` prevent drag/pan interference. `npx tsc --noEmit` passes.
- `17-canvas-ergonomics`: Added a `ControlBar` component inside `canvas-flow.tsx` — a pill-shaped `Panel position="bottom-left"` with zoom-out, fit-view, and zoom-in buttons (wired to `useReactFlow()` with animated `duration`), a thin divider, and undo/redo buttons (wired to `useUndo`/`useRedo`/`useCanUndo`/`useCanRedo` from `@liveblocks/react`; disabled state is visually dimmed via `disabled:opacity-30`). Created `hooks/useKeyboardShortcuts.ts` — listens on `window`, skips editable targets, handles `+`/`=` zoom in, `-` zoom out, `Ctrl/Cmd+Z` undo, `Ctrl/Cmd+Shift+Z` and `Ctrl/Cmd+Y` redo. Hook accepts a minimal `ZoomControls` structural interface for type safety. Removed `MiniMap`. `npx tsc --noEmit` passes.
- `18-starter-templates`: Created `components/editor/starter-templates.ts` — defines `CanvasTemplate` interface and `CANVAS_TEMPLATES` array with three predefined templates (Microservices, CI/CD Pipeline, Event-Driven System) using shared `CanvasNode`/`CanvasEdge` types and the existing `NODE_COLORS` palette. Created `components/editor/starter-templates-modal.tsx` — Dialog with a scrollable grid of template cards; each card shows a lightweight inline SVG preview (bounds-fitted, draws simplified node shapes and edge lines without a React Flow instance), template name, description, and an Import button. Updated `canvas-flow.tsx` to accept `pendingTemplate`/`onTemplateApplied` props — a `useEffect` clears all current nodes and edges then adds the template nodes and edges via `onNodesChange`/`onEdgesChange`, then fires `fitView`. Updated `canvas-wrapper.tsx` to forward these props. Updated `workspace-shell.tsx` — added `isTemplatesModalOpen` and `pendingTemplate` state, a `LayoutTemplate` navbar button, and the `StarterTemplatesModal` render. `npm run build` passes.
- `19-presence-avatars-cursors`: Renamed `isThinking` → `thinking` in `liveblocks.config.ts` and `canvas-wrapper.tsx` initial presence. Created `components/editor/presence-avatars.tsx` — a React Flow `Panel position="top-right"` that reads `useOthers()`, filters out the current Clerk user by ID, renders up to 5 collaborator avatar chips (profile photo or initials, cursor-color ring, overlapping stack, +N overflow), shows a divider only when collaborators exist, and renders the Clerk `UserButton` for the current user. Created `components/editor/live-cursors.tsx` — renders other participants' cursors as an `absolute inset-0` overlay inside ReactFlow; uses `useViewport()` to convert stored flow-space cursor coordinates to CSS pixel positions, then renders a colored SVG pointer and name badge per participant. Updated `canvas-flow.tsx` — added `useUpdateMyPresence`, `handleMouseMove` (broadcasts `screenToFlowPosition` coords), and `handleMouseLeave` (clears cursor to null) wired to `<ReactFlow onMouseMove/onMouseLeave>`; added `<LiveCursors />` and `<PresenceAvatars />` as children of ReactFlow. `npm run build` passes.
- `20-ai-sidebar-shell`: Created `components/editor/ai-sidebar.tsx` — a floating fixed-position sidebar that mirrors the left `ProjectSidebar` slide animation (translates out to the right when closed). Header has a `Bot` icon, "AI Workspace" title, "Collaborate with Ghost AI" subtitle, and close button. Two-tab layout using shadcn `Tabs`: "AI Architect" tab has a scrollable chat area with an empty state (bot icon, description, starter prompt chips styled as `bg-subtle text-ai-text` pills), user/assistant message bubbles, and an auto-resizing `Textarea` with a send button (`bg-ai text-white`); "Specs" tab has a `Generate Spec` button and a static demo spec card. Replaced the inline placeholder aside in `workspace-shell.tsx` with `<AiSidebar>`. `npm run build` passes.
- `21-canvas-autosave`: Installed `@vercel/blob`. Created `app/api/projects/[projectId]/canvas/route.ts` with `GET` (reads `canvasJsonPath` from Prisma, fetches JSON from Vercel Blob) and `PUT` (deletes old blob, uploads new canvas JSON to `canvas/{projectId}.json`, stores URL on the project record). Created `hooks/use-autosave.ts` — debounces saves by 2 s, skips initial mount, tracks `idle | saving | saved | error` status. Updated `canvas-flow.tsx`: accepts `projectId` prop, calls `useAutosave`, loads saved canvas into an empty room on first mount via the GET route, and renders a `SaveStatusPanel` (`Panel position="top-left"`) showing saving/saved/error state. Updated `canvas-wrapper.tsx` to forward `roomId` as `projectId` to `CanvasFlow`. No Prisma migration needed — `canvasJsonPath` field already existed. `npm run build` passes.

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
