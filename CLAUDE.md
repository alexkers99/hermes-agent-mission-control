# Mission Control Dashboard — Design Context for Claude Code

## What this is

A Mission Control dashboard for monitoring and directing a fleet of AI agents.
Next.js 16 App Router, Prisma 6 on Neon Postgres, Tailwind v4, NextAuth,
deployed on Vercel.

**Live:** https://hermes-agent-mission-control-iota.vercel.app/
**GitHub:** alexkers99/hermes-agent-mission-control

Push to main → Vercel auto-deploys.

---

## Architecture in 30 seconds

- **Source of truth** = Postgres tables (`AgentState`, `Mission`, `Idea`, etc.)
- **Agents self-report** by POSTing to `/api/agents/state` with a shared
  secret (`INTERNAL_API_SECRET` in env).
- **Dashboard is read-only** — pages fetch directly from Prisma.
- **No background jobs, no WebSockets, no push.** Agents heartbeat on
  their own schedule; pages re-render on navigate. Keep it simple.

## Data flow

```
Agent (Python/TS)
     │  POST /api/agents/state  (Authorization: Bearer $INTERNAL_API_SECRET)
     ▼
Next.js route handler → prisma.agentState.upsert → Postgres
                                                     ▲
Dashboard page (server component) ── prisma.read ───┘
     ▼
  Browser
```

---

## Design System (src/app/globals.css)

This is a **deep-space command center** aesthetic — dark, data-dense,
telemetry-grade. All colors are defined as CSS custom properties on `:root`.
Do NOT add new CSS variables without checking the palette first.

### Palette

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#09090b` | Page background (zinc-950) |
| `--bg-alt` | `#0c0c0e` | Telemetry strip, secondary panels |
| `--panel` | `#101012` | Card / panel backgrounds |
| `--panel-hover` | `#18181b` | Card hover state (zinc-900) |
| `--panel-elevated` | `#27272a` | Popovers, modals, active toggles (zinc-800) |
| `--line` | `rgba(255,255,255,0.1)` | Subtle borders |
| `--ink` | `#fafafa` | Primary text (zinc-50) |
| `--ink-2` | `#d4d4d8` | Secondary text |
| `--ink-3` | `#a1a1aa` | Muted text / labels (zinc-400) |
| `--ink-4` | `#71717a` | Disabled / placeholder (zinc-500) |
| `--accent` | `#6366f1` | Primary accent (indigo-500) |
| `--accent-hover` | `#4f46e5` | Primary hover (indigo-600) |
| `--green` | `#22c55e` | Online / working / success |
| `--amber` | `#f59e0b` | Idle / warning status |
| `--red` | `#ef4444` | Error / offline status |
| `--blue` | `#38bdf8` | Info accent (sky-400) |
| `--purple` | `#8b5cf6` | Secondary accent (violet-500) |
| `--chart-1..6` | indigo/green/amber/violet/sky/pink | Recharts series colors |

### Component CSS classes (use these, don't re-invent)

| Class | Purpose |
|-------|---------|
| `.telemetry-card` | Agent / metric card with glass-dark panel |
| `.telemetry-dot` + `.online/.working/.idle/.error/.offline` | Status indicator dot with glow |
| `.telemetry-badge` + status class | Status pill badge |
| `.telemetry-strip` | Top telemetry strip bar |
| `.telemetry-grid` | Auto-fill card grid (min 320px) |
| `.data-metric` | Monospaced number/metric display |
| `.health-bar` | System health footer bar |
| `.kanban-col` | Kanban mission column |
| `.btn-ghost` | Ghost button |
| `.btn-primary` | Primary accent button |
| `.badge-indigo/.badge-green/.badge-amber/.badge-red/.badge-blue/.badge-purple/.badge-neutral` | Color badges |
| `.table-base` | Data table (th, td) |
| `.activity-row` | Stagger-animated activity feed row |
| `.scan-effect` | Subtle HUD scan line overlay |

### Animations (defined in globals.css)

`fade-in-up`, `slide-in-right`, `pulse-glow`, `telemetry-pulse`,
`pulse-dot`, `data-stream`, `count-up` — use these rather than ad-hoc
keyframes.

### Layout patterns

- **Telemetry strip** at top: full-width bar, inline metrics
- **Cards**: `.telemetry-grid` with `.telemetry-card` children
- **Sidebar**: `src/components/sidebar.tsx` with nav links + lucide icons
- **Activity feed**: right-column list with staggered `.activity-row`
- **Missions**: Kanban columns (`.kanban-col`) by status
- **Tables**: `.table-base` for data grids

---

## Conventions

- **Default to server components.** `"use client"` only for hooks/events.
- `dynamic = "force-dynamic"` on any page/route that reads from Prisma.
- No em dashes. Period.
- Error handling: `try/catch` Prisma reads, show empty state, don't crash.
- Use `lucide-react` for all icons (already in dependencies).
- Font: Inter (UI) + JetBrains Mono (`.data-metric`).
- **Dataset pages** live at `src/app/<name>/page.tsx`.
- **API routes** at `src/app/api/<name>/route.ts` — gated by `INTERNAL_API_SECRET`.
- **Nav entries** go in `src/components/sidebar.tsx`.
- New DB models → `prisma/schema.prisma` → `npx prisma db push`.
- Push to main branch → Vercel auto-deploys.

---

## Schema models (prisma/schema.prisma)

- `User`, `Account`, `Session` — NextAuth auth
- `AgentState` — `id`, `name`, `emoji`, `role`, `group`, `status`, `currentTask`,
  `tasksCompleted`, `totalCost`, `recentActivity` (JSON), `updatedAt`
- `CostBreakdown` — per-model cost/token attribution: `agentId`, `model`, `provider`,
  `inputTokens`, `outputTokens`, `cachedTokens`, `costUsd` (Decimal 12,6),
  `windowStart`, `windowEnd`. Ingested via POST /api/cost-breakdown.
- `Mission` — `id`, `title`, `description`, `status`, `priority`, `agentId`
- `Idea` — `id`, `title`, `description`, `category`, `source`, `status`, `timestamp`
- `DataStore` — generic key-value store

## Cost API

- `POST /api/cost-breakdown` (Bearer INTERNAL_API_SECRET): agents report per-model cost.
  Body: `{ agentId, model, provider, inputTokens, outputTokens, cachedTokens?, costUsd: "0.184200", windowStart, windowEnd }`
- `GET /api/cost-breakdown?range=24h|7d|30d&agentId=&groupBy=model|agent|day`
  Returns `{ range, totalUsd, series: [{key, provider, costUsd, inputTokens, outputTokens}], timeline: [{date, costUsd}] }`
- Helpers in `src/lib/cost.ts`. Charts in `src/components/charts/` (recharts, client components).

---

## Key commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Build for production |
| `npx prisma db push` | Sync schema to DB |
| `npx prisma studio` | Browse DB |
| `npm run seed:demo` | Seed demo data |
| `git push origin main` | Deploy to Vercel |

---

## Prohibited (template boundaries)

- Sharbel-specific integrations (Polymarket, Hyperliquid, newsletter tools)
- Tauri desktop shell
- Heavy UI libraries beyond Tailwind
- ORMs other than Prisma

---

## For high-level design work

When designing new pages or features:

1. **Use existing CSS classes** from globals.css before writing new styles.
2. **Compose with the palette** — don't add new CSS variables unless the
   design intent genuinely doesn't match any existing token.
3. **Keep it data-dense** — telemetry aesthetic, not marketing aesthetic.
   Small font sizes (10-13px), tight spacing, low contrast borders.
4. **Animations should feel like telemetry** — subtle, purposeful, fast.
   Default animation durations are 0.12s-0.3s.
5. **Each page is a server component** that fetches its own data via Prisma.
   Layout wrappers (sidebar, telemetry strip) live in the root layout.
6. **Push to main → Vercel auto-deploys.** Review before push.
