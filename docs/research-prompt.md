# Claude Code: Mission Control Research & Design Plan

## Objective
Research the current state-of-the-art in AI agent Mission Control / orchestration dashboards (mid-2026), determine which features are essential vs unnecessary for the Hermes Agent ecosystem, and produce a detailed phased implementation plan that I can execute.

## Context: Current Hermes Mission Control
- **Repo:** Forked from sharbelxyz/hermes-agent-mission-control, deployed at `hermes-agent-mission-control-iota.vercel.app`
- **Stack:** Next.js (App Router) + Prisma + Postgres (Neon) + NextAuth (Google OAuth)
- **Existing features:** Agent state heartbeat (status, cost, task), ideas/missions CRUD, basic telemetry strip, activity feed, kanban board, signals with approve/reject, agent detail pages, error alert banners, system health panel
- **Auth:** Single-user Google OAuth allow-list (alexkers99@gmail.com)
- **Agent auth:** INTERNAL_API_SECRET (Bearer token) in Authorization header
- **Design:** Dark theme with CSS custom properties, lucide-react icons, minimal custom animations
- **Deployment:** Vercel auto-deploy from main branch

## Research Sources (already identified)
Read and analyze the following for design patterns, features, and architecture:

1. **builderz-labs/mission-control** (5.5k stars, v2.1.0 July 4 2026) — Current gold standard for AI agent orchestration dashboards.
   - README: https://github.com/builderz-labs/mission-control
   - Docs: https://builderz-labs-mission-control-11.mintlify.app/introduction
   - Live demo: https://mc.builderz.dev
   - Focus on: per-model cost dashboards (Recharts), real-time live feed, Kanban task board, memory browser, scheduled cron jobs, agent squad management, spawn control, token usage visualization, security scanners

2. **Solaris by shadcn.io** — AI agent startup template. Dark-mode-first with production-grade design system.
   - Live demo: solaris.shadcn.io
   - https://shadcn.io/template/solaris
   - Focus on: color palette, typography, component system, layout patterns, animation language, dashboard preview patterns

3. **abhi1693/openclaw-mission-control** (2.6k stars) — Enterprise-grade with organizations, approval workflows, Kanban.
   - https://github.com/abhi1693/openclaw-mission-control

4. **AgentOps** — Purpose-built agent observability platform.
   - https://www.agentops.ai
   - Focus on: session traces, tool invocations, agent-level cost attribution, replays

## Your Task: Produce a Single Markdown Document

Write the output to `mission-control-research-plan.md` in the current directory. Structure it as follows:

### 1. Design System Recommendations (from Solaris + builderz-labs analysis)
- **Color palette:** Dark theme tokens, accent colors, semantic colors (success/error/warning/info), surface/panel hierarchy, border/line colors. Extract concrete hex values.
- **Typography:** Font stack, scale/size ramp, weight usage (headings vs body vs mono)
- **Component system:** What to adopt from shadcn/ui conventions, what custom components are needed, button/input/card/badge design tokens
- **Layout patterns:** Dashboard grid layout, sidebar navigation structure, responsive breakpoints, content area width constraints
- **Animation language:** What animations add polish vs whats noise — entry animations, state transitions, loading skeletons
- **Icon system:** lucide-react usage patterns — icon sizing, color inheritance, consistent API

### 2. Feature Audit: Must-Have vs Nice-to-Have vs Unnecessary
For **Hermes Agent specifically** (single-operator system managing ~10 agents for e-commerce operations + portfolio management):

For each feature, mark as **ESSENTIAL** / **USEFUL** / **SKIP** with a short rationale:

- Agent heartbeat with live status (working/idle/error)
- Real-time cost tracking per agent + cumulative
- Per-model cost breakdown with charts (Recharts)
- Task feed showing what each agent is doing now
- Agent detail page (activity log, missions, cost history)
- System health panel (DB, agents, gateway connection)
- Agent mission/idea signals with approve/reject
- Scheduled job management (cron jobs visible in dashboard)
- Memory browser for agent context files
- Agent spawn/stop controls
- Error alert banners with auto-dismiss
- Organizations / multi-tenant
- Complex RBAC / permissions
- GitHub Issues sync
- Framework adapters (CrewAI, LangGraph, AutoGen)
- Security scanners (prompt injection detection)
- OpenClaw-specific features
- Token usage visualization
- Agent squad grouping / team management
- Recurring task scheduling UI
- Notification/webhook configuration page

### 3. Architecture & Technical Improvements
- **Database schema:** What new Prisma models or fields are needed — cost_breakdown per model, cron_job records, memory_index, notification_config. Show exact field names and types.
- **API routes:** What new endpoints — /api/cron-jobs, /api/memory, /api/cost-breakdown, /api/notifications. Include expected request/response shapes.
- **Real-time vs polling:** Should we add SSE or WebSocket for live updates, or keep the existing heartbeat polling pattern? Recommendations with rationale.
- **Server Actions:** Pattern for approve/reject signals, mission status updates, agent stop commands
- **Caching & revalidation:** When to use revalidatePath, revalidateTag, or force-dynamic

### 4. Detailed Phased Implementation Plan

**Phase 1 — Foundation (do first, ship fast)**
List every file to create/modify, every schema change, every new component, in exact order. Name specific files (e.g. `src/app/api/cost-breakdown/route.ts`), specific data types, specific CSS classes. Include estimated complexity (S/M/L).

**Phase 2 — Visualization & Analytics**
Charts, cost breakdowns, trends over time, agent comparison views, weekly/monthly reports.

**Phase 3 — Agent Management (if needed)**
Spawn/stop controls, cron job visibility, memory browser integration.

**Phase 4 — Polish**
Animations, responsive design, loading states, error boundaries, empty states (no agents, no missions, no signals).

### 5. Component Tree & File Map
A tree showing the proposed component hierarchy:
```
src/
  app/
    layout.tsx
    page.tsx
    agents/[id]/page.tsx
    missions/page.tsx
    signals/page.tsx
    settings/page.tsx
  components/
    telemetry/ (TelemetryStrip, TelemetryCard, TelemetryDot, etc.)
    agents/ (AgentCard, AgentGrid, AgentDetail, ActivityLog, etc.)
    missions/ (KanbanBoard, MissionCard, MissionColumn, etc.)
    signals/ (SignalCard, SignalList, ApproveRejectButtons, etc.)
    layout/ (Sidebar, TopBar, Shell, etc.)
    ui/ (Badge, Button, Card, Select, Tabs, etc.)
  lib/
    prisma.ts, auth.ts, utils.ts, types.ts
  ...
```
For each file, include a 1-line description of its responsibility.

### 6. Design Mockups (ASCII or component descriptions)
For the **3 most important screens** — Dashboard, Agent Detail, Settings — describe the exact layout, component placement, spacing, visual hierarchy, and responsive behavior. Use ASCII wireframes for layout:

```
+-------------------------------------------------+
| [Logo]  Agents  Missions  Signals  Settings     |
+-------------------------------------------------+
| AGENTS: 4/10  |  COST: $47.23  |  TASKS: 142    |
+-------------------------------------------------+
| [Agent Card]  [Agent Card]  [Agent Card]          |
| working       idle          error                 |
| Task: ...     Task: ...     Task: ...             |
| $12.40        $8.12         $3.91                 |
+-------------------------------------------------+
| ACTIVITY FEED                                     |
| 10:32  Echo · Completed mission "Invoice scan"...  |
| 10:30  Atlas · Started task "Market research"...   |
+-------------------------------------------------+
```

### 7. Build & Verification Commands
Exact commands to run after implementation:
- `npx prisma db push` (schema sync)
- `npm run build` (type check + build)
- `npm run dev` (local verification)
- Vercel deploy flow

## Constraints
- Must use existing Next.js App Router patterns (server components by default, 'use client' only for hooks)
- Must use `dynamic = "force-dynamic"` on all data-fetching pages
- All icons from lucide-react
- Try/catch all Prisma reads with empty-state fallback
- Dark theme only (no light mode)
- Tailwind CSS for styling (existing pattern)
- shadcn/ui conventions where applicable
- TypeScript strict mode

## Output Format
Title: `# Mission Control v2: Research, Design & Implementation Plan`
Date each section. Be specific enough that I can implement every item without ambiguity. Include concrete file paths, component names, CSS classes, data types, and import paths throughout.