# Project Context — TourItVirtually

## What This App Is

A virtual tourism platform where users explore an interactive 3D globe, click on destination pins, and launch immersive 360° virtual tours directly in-browser (iframe). The tour files themselves are panoramic HTML tours built with Pano2VR, hosted on Cloudflare R2 — not in this repo.

The long-term vision: a growing library of Indian (and global) off-beat destinations, each with a 360° tour, affiliate booking links, and an AI travel assistant.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| 3D Globe | Three.js (WebGL) |
| Animation | Framer Motion + GSAP |
| AI Chat | Vercel AI SDK v6 + Anthropic claude-sonnet |
| Database | Supabase (PostgreSQL) |
| Tour CDN | Cloudflare R2 |
| Deployment | Vercel |

---

## App Structure

```
/                     → redirects to /earth
/earth                → main 3D globe experience
/archive              → grid/filter browse view of all locations
/api/ai               → AI chat route (Anthropic)
```

### Key Component Files

```
app/
  earth/
    page.tsx              → server component, loads locations.json, renders EarthPageClient
    EarthPageClient.tsx   → client wrapper, lazy-loads EarthClient (ssr:false)
  archive/
    page.tsx              → server component
    ArchiveClient.tsx     → client: hero slider + location cards
  components/
    Earth/
      EarthGlobe.tsx      → Three.js WebGL globe with country pins and location markers
      EarthClient.tsx     → wraps EarthGlobe + LocationModal + ChatInterface
      LocationModal.tsx   → slide-up modal with thumbnail, description, iframe tour, book links
      types.ts            → Location and CountryPin TypeScript interfaces
    Archive/
      HeroSlider.tsx      → auto-scrolling featured destination slider
      LocationCard.tsx    → card with thumbnail, category badge, description
      CategoryFilter.tsx  → pill filters (adventure, pilgrimages, unexplored, etc.)
    Chat/
      ChatInterface.tsx   → collapsible AI chat panel on the earth page
    Navbar.tsx            → top navigation bar
  api/
    ai/route.ts           → POST handler, streams Anthropic response via AI SDK
data/
  locations.json          → source of truth for all destinations (id, name, coords, tourUrl, etc.)
```

---

## Data Flow

1. `data/locations.json` is the canonical location list. Each entry has:
   - `id`, `name`, `city`, `state`, `country`, `countryCode`
   - `coordinates` — lat/lng for globe pin placement
   - `thumbnail` — served from `/public/thumbnails/` (in the repo, ~2.7MB total)
   - `tourUrl` — **full URL to the Pano2VR HTML file on Cloudflare R2** (NOT a local path)
   - `category` — adventure | unexplored | pilgrimages | places of worship | historical | world heritage | get aways
   - `affiliate.hotel` and `affiliate.experience` — MakeMyTrip / Booking.com links

2. Pages import `locations.json` as a static import (server-side at build time).

3. `LocationModal.tsx` renders `location.tourUrl` in an `<iframe>` when the user clicks "View Virtual Tour".

---

## Tour Files — Cloudflare R2 (NOT in the repo)

The `public/tours/` folder is **gitignored**. Tour files (~1.5GB) live on Cloudflare R2.

**Current state:** R2 bucket not yet set up. All `tourUrl` fields in `locations.json` use the placeholder `https://REPLACE_WITH_R2_URL/tours/...`.

**When R2 is ready:**
1. Upload the local `public/tours/` folder to the R2 bucket (preserving directory structure)
2. Enable public access on the bucket (or set up a custom domain)
3. Replace every `https://REPLACE_WITH_R2_URL` in `data/locations.json` with the real R2 base URL
4. Uncomment the R2 hostname in `next.config.ts` `remotePatterns`
5. Add `NEXT_PUBLIC_TOURS_BASE_URL` to Vercel environment variables

Tour folder naming structure in R2 should match:
```
tours/india/andhra-pradesh/<district>/<location-id>/<TourName>.html
```

---

## Supabase

**Project ID:** `hhjevofbfbovcwzpahjo`
**Dashboard:** https://supabase.com/dashboard/project/hhjevofbfbovcwzpahjo

Tables created:
- `locations` — mirrors `data/locations.json`, allows dynamic updates without redeployment
- `tour_views` — analytics: tracks which tour was viewed and when

Environment variables needed (add in Vercel dashboard):
```
NEXT_PUBLIC_SUPABASE_URL=https://hhjevofbfbovcwzpahjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase project settings>
```

---

## Environment Variables

See `.env.example` for all required vars. Copy to `.env.local` for local dev:
```
ANTHROPIC_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_TOURS_BASE_URL=...   (set after R2 is configured)
```

---

## Branches

| Branch | Purpose |
|---|---|
| `master` | Clean baseline — Claude manages this |
| `codex/ui-layout` | Codex UI work — frontend-only changes |

**For Codex:** work only on `codex/ui-layout`. Focus on UI layout, visual polish, and component structure. Do not modify `data/locations.json`, `app/api/`, or any Supabase integration code. When done, Claude will review and merge back to `master`.

---

## Current Status (as of 2026-04-05)

- [x] Core app structure built: globe, archive, modal, chat
- [x] 7 locations in `data/locations.json` (all Andhra Pradesh, India)
- [x] Thumbnails in `public/thumbnails/` (committed to repo, small)
- [x] Repo cleaned — tour files removed from git, now gitignored
- [x] Supabase tables created (`locations`, `tour_views`)
- [x] Deployed on Vercel
- [ ] R2 bucket not yet set up — tour iframes will not load until this is done
- [ ] Supabase not yet wired into the app (locations still loaded from JSON)
- [ ] UI layout / visual polish (Codex task)
- [ ] AI chat needs real system prompt tuned for travel assistant role

---

## What Codex Should Work On

1. **Visual polish on `/earth`** — globe page layout, navbar styling, loading states
2. **Archive page** (`/archive`) — hero slider, location cards, category filter UX
3. **LocationModal** — thumbnail display, tour button state, affiliate CTA styling
4. **Mobile responsiveness** — the globe and modals need mobile layout attention
5. **General design system** — consistent spacing, typography, color tokens in Tailwind

Do NOT touch: `app/api/`, `data/locations.json`, Supabase client code (when added), or anything that affects data fetching logic.
