# Mission Control v2 — Plan of Record (condensed)

Full research doc: Claude artifact e1f025ef-35d5-41ab-8b93-e64d1cec8997 (July 5, 2026).

## Key decisions
- Single-operator cockpit, NOT enterprise platform. SKIP: orgs, RBAC, GitHub sync, framework adapters, security scanners.
- Keep heartbeat polling. NO SSE/WebSockets (Vercel serverless).
- Dark-only. Palette: zinc-950 `#09090b` bg, indigo `#6366f1` primary, Geist fonts, 10px radius.
- Money: `Decimal(12,6)`, never Float for new cost fields.
- Status mapping: working=green, idle=amber, error=red.

## Phases
1. **Foundation**: design tokens refresh, Geist Mono for metrics, `CostBreakdown` model + `group` field on AgentState, `/api/cost-breakdown` (POST bearer-guarded ingest, GET range/groupBy), `lib/cost.ts`.
2. **Visualization**: Recharts — `CostChart` (area, cost over time), `ModelCostBar` (per-model bar), analytics page upgrade, agent-detail cost history.
3. **Agent management** (on-demand): Stop control, cron visibility, memory browser, spend-threshold webhook.
4. **Polish**: skeletons, error boundaries, empty states, responsive.

## API shapes
POST /api/cost-breakdown (Bearer INTERNAL_API_SECRET):
`{ agentId, model, provider, inputTokens, outputTokens, cachedTokens?, costUsd, windowStart, windowEnd }`

GET /api/cost-breakdown?range=24h|7d|30d&agentId=&groupBy=model|agent|day →
`{ range, totalUsd, series: [{key, provider, costUsd, inputTokens, outputTokens}], timeline: [{date, costUsd}] }`

## Triggers to revisit
- SSE/real-time: only past ~50 agents.
- RBAC/orgs: only if second human operator.
- Security scanners: only if agents ingest untrusted input.
- Spend threshold webhook early (~$75/day ceiling) = cheapest runaway-agent insurance.
