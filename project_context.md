# Project Context

## Project

- Name: `tour-it-virtually`
- Stack: Next.js 15 App Router, React 18, TypeScript, Tailwind CSS
- Notable libraries: `three`, `framer-motion`, `gsap`, `ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`

## Current App Shape

- `/` redirects to `/earth`
- `/earth` is the main immersive experience with:
  - `Navbar`
  - `EarthPageClient`
  - `ChatInterface`
- `/archive` renders an archive experience backed by `data/locations.json`
- `/api/ai` exists for AI-driven interactions

## Existing Frontend Areas

- 3D earth and location interaction components in `app/components/Earth/*`
- Archive browsing components in `app/components/Archive/*`
- Shared navigation in `app/components/Navbar.tsx`
- Chat UI in `app/components/Chat/ChatInterface.tsx`

## Working Notes For Codex

- Primary focus for Codex work should stay on UI layout and frontend presentation
- Use the dedicated Codex branch as the isolated working surface
- Keep merge-ready changes scoped so Claude can later bring them back into `master`

## Handoff Intent

- `master` is the upstream baseline branch
- The Codex working branch contains `progress_log.md` and future UI/frontend changes
- Claude can review the progress log and merge selected frontend work back into `master`
