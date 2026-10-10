# Cline Usage Log — Daily Travel AI

## How Cline Was Used to Build This Project

### 1. Project Scaffolding
- Cline initialized Next.js 14 with TypeScript, Tailwind, SQLite
- Created folder structure, shared type contracts, DB schema

### 2. Core Modules Built by Cline
- `lib/db.ts` — SQLite schema + Delhi corridor seed data
- `lib/types.ts` — Shared TypeScript contracts (agreed between both team branches)
- `lib/transport.ts` — Transport adapter (queries stops, routes, fares)
- `lib/weather.ts` — Open-Meteo weather adapter (free, no API key)
- `lib/planner.ts` — 5-mode optimization engine with weighted scoring
- `lib/agent.ts` — Cline SDK travel agent with 6 custom tools
- `lib/noticeExtractor.ts` — Claude AI notice parser
- `lib/disruptionMonitor.ts` — RSS feed disruption classifier

### 3. API Routes Built by Cline
- `POST /api/plan` — Creates plan, runs agent async
- `GET /api/plan/[id]/stream` — SSE stream of agent events
- `POST /api/notices` — AI notice extraction
- `PATCH /api/notices/[id]` — Admin approve/reject
- `POST /api/replan` — Disruption-triggered replanning
- `POST /api/trip` — Claude AI trip itinerary generator

### 4. Cline SDK Inside the Product
The Cline SDK agent (`lib/agent.ts`) runs at journey planning time with 6 registered tools:
- `get_route_options` → queries SQLite transport data
- `get_transport_schedule` → stop times and service calendar
- `get_weather` → Open-Meteo live forecast
- `get_service_notices` → approved disruption notices from DB
- `evaluate_journeys` → validates options against user constraints
- `submit_travel_plan` → confirms and stores final plan

Agent tool activity is streamed via SSE to the frontend Dev Activity Panel in real time.

### 5. Demo Evidence Points
- Agent runs with real tool calls when ANTHROPIC_API_KEY is set
- Falls back to direct deterministic planner (labeled) when no key
- All demo/fixture data clearly labeled with SourceBadge
- Notice extraction uses Claude 3.5 Sonnet with heuristic fallback

## Honest Notes
- Transit timetable is seeded demonstration data, not real DTC schedules
- Weather data is live from Open-Meteo
- RSS disruption monitoring uses public feeds (may be unavailable in some regions)
