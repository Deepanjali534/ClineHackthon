# Yatra Sathi — India’s AI-Powered Travel Companion

> **Tell us where you need to be. We’ll get you there — smartly.**\
> *यात्रा साथी · Your journey. Your priorities. A smarter way forward.*

Yatra Sathi is a travel-planning prototype designed to help people manage the full journey—not just find a route. It combines personalised journey constraints, transport options, weather information, service notices, and disruption-aware replanning in one place.

Built by **Team Chitosan** for the **Cline AI Builder Hackathon — Round 2**.

---

## Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Data Sources and Demo Data](#data-sources-and-demo-data)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Roadmap](#roadmap)
- [Team](#team)
- [References](#references)

---

## The Problem

A journey planned in the morning can become impractical minutes later. A bus may be cancelled, traffic may be disrupted by a protest, a route may be diverted, or bad weather may affect travel.

Travel information is often spread across transport services, websites, news feeds, and messaging groups. Conventional route planning also may not account for a person’s full set of constraints, such as:

- A fixed arrival deadline
- A daily travel budget
- A maximum walking distance
- A preference for fewer transfers or greater comfort
- The need to plan the return journey
- Unexpected disruptions during the day

**The gap:** people need help managing a journey as circumstances change, not only finding an initial route.

## Our Solution

Yatra Sathi is a personalised travel companion for two connected use cases:

1. **Daily commute planning** — find a journey that considers the user’s deadline, budget, walking limit, and travel preferences, including a return journey.
2. **Multi-day trip planning** — organise destinations into a day-wise itinerary based on dates, budget, and interests.

When a service notice is submitted and approved, or a traveller requests a replan, Yatra Sathi can generate a new plan version and explain the resulting trade-offs.

## Key Features

### 1. Personalised Daily Journey Planning

Users can specify:

- Origin and destination (any Delhi area — India Gate, Sarojini Nagar, Hauz Khas, Karol Bagh, and more)
- Required arrival time
- Time they are ready to leave for the return journey
- Total daily budget
- Maximum walking distance per journey
- An optimisation preference

The planner evaluates candidate options against hard constraints first, then ranks feasible options according to the selected preference.

### 2. Five Optimisation Modes

| Mode | Main priority |
|---|---|
| **Cheapest** | Minimise travel cost |
| **Fastest** | Minimise journey time |
| **Least Walk** | Reduce walking distance |
| **Comfortable** | Prioritise comfort and fewer transfers |
| **Balanced** | Trade off cost, time, walking, transfers, and comfort |

### 3. Return Journey and Backup Option

The journey plan includes outbound and return details, estimated costs, walking distance, and a backup outbound option.

### 4. Disruption Handling and Replanning

- **Reviewed service notices:** admin submits a notice → AI extracts structure → admin approves/rejects → affects planning
- **Traveller-triggered replanning:** user requests replan after running late or missing a bus
- **News-feed monitoring:** keyword-based detector checks Delhi RSS feeds for disruption signals

### 5. AI Agent and Developer Visibility

- Cline SDK tool-use agent gathers information through 6 registered tool handlers
- Agent events streamed live to UI via Server-Sent Events (SSE)
- Collapsible Developer View shows tool names, durations, agent run ID
- Deterministic planner handles scoring and constraint validation
- Fallback to direct planner if API key unavailable

### 6. Multi-Day Trip Planner

- Enter destination, dates, budget, interests
- AI structures day-wise itinerary (morning/afternoon/evening slots)
- Real place data for Jaipur, Manali, Goa, Agra, Delhi
- Interest-based fallback for any other destination
- Budget breakdown per day

### 7. Weather Integration

- Open-Meteo API (free, no key needed)
- Real Delhi weather included in journey explanation
- Fallback to sensible defaults if unavailable

---

## How It Works

### Journey Planning Flow

```
1. User fills form (origin, destination, time, budget, walk limit, mode)
2. POST /api/plan → planJourney() runs synchronously
3. Result stored in globalThis store (shared across Next.js routes)
4. Redirect to /commute/thinking/[id]
5. GET /api/plan/[id]/stream → SSE animates tool steps
6. plan_ready event → redirect to /commute/[id]
7. Plan displayed with outbound + return + route map
```

### Replanning Flow

```
1. Traveller clicks “Running Late” or “Missed Bus”
2. POST /api/replan → new plan version created
3. New plan shown with version number
```

### Design Principle

> **AI coordinates and explains; deterministic code validates.**
> A language model cannot invent a bus, departure time, fare, or route.

---

## Technology Stack

| Area | Technology |
|---|---|
| Web application | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React, Tailwind CSS, shadcn/ui |
| AI planning | Anthropic Claude + `@anthropic-ai/sdk` |
| Database | In-memory JS store (zero native deps, works on all platforms) |
| Live updates | Server-Sent Events (SSE) |
| Weather | Open-Meteo (free, no API key) |
| Disruption signals | Delhi news RSS feeds |

---

## Architecture

### Frontend (deepanjali/main-dev branch)

```
app/
  page.tsx                    ← Home: hero, destinations, weather, departures
  commute/
    page.tsx                  ← Journey form (origin, destination, constraints)
    [id]/page.tsx             ← Plan display + route map + live monitoring
    thinking/[id]/page.tsx    ← AI thinking screen (SSE animated steps)
  trip/
    page.tsx                  ← Trip planner form + map + AI day cards
    [id]/page.tsx             ← Itinerary display
  admin/
    page.tsx                  ← Notice submission + AI review + approve/reject

components/
  shared/
    OptimizationPicker.tsx    ← 5-mode selector
    RouteMap.tsx              ← SVG route visualisation
    SourceBadge.tsx           ← Data source labels
    BudgetBar.tsx             ← Budget progress
    DevActivityPanel.tsx      ← SSE event log
  commute/
    JourneyCard.tsx           ← Full plan display with timeline
    StepCard.tsx              ← Individual journey step
    LiveMonitoringBanner.tsx  ← Disruption alerts
  trip/
    DayCard.tsx               ← Day-wise itinerary card
    ItineraryView.tsx         ← Full trip layout
  admin/
    NoticeForm.tsx / NoticeReview.tsx / NoticeList.tsx

lib/
  types.ts                    ← Shared TypeScript types
  api.ts                      ← Frontend API call functions
  hooks/useSSE.ts             ← EventSource hook
  hooks/useCommuteForm.ts     ← Form state
  mock/mockPlan.ts            ← Demo fallback data
  mock/mockTrip.ts            ← Demo trip data
```

### Backend (integrated into same Next.js app)

```
app/api/
  plan/route.ts               ← POST: run planJourney(), store result
  plan/[id]/route.ts          ← GET: retrieve plan from globalThis store
  plan/[id]/stream/route.ts   ← GET: SSE stream of tool events
  notices/route.ts            ← POST: extract notice with AI
  notices/[id]/route.ts       ← PATCH: approve/reject notice
  replan/route.ts             ← POST: trigger replanning
  trip/route.ts               ← POST: generate trip itinerary
  trip/[id]/route.ts          ← GET: retrieve trip

lib/
  db.ts                       ← Zero-dependency in-memory data store
  agent.ts                    ← Claude tool-use loop + direct planner fallback
  planner.ts                  ← Journey scoring, constraint validation, backup
  transport.ts                ← Route options for any Delhi area (16+ areas)
  weather.ts                  ← Open-Meteo weather adapter
  noticeExtractor.ts          ← AI notice parser
  disruptionMonitor.ts        ← RSS feed keyword detector
```

### API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/plan` | Create plan and run planner |
| `GET` | `/api/plan/[id]` | Retrieve completed plan |
| `GET` | `/api/plan/[id]/stream` | SSE stream of agent events |
| `POST` | `/api/replan` | Generate new plan version |
| `POST` | `/api/notices` | Extract structured notice with AI |
| `GET` | `/api/notices` | List recent notices |
| `PATCH` | `/api/notices/[id]` | Approve or reject a notice |
| `POST` | `/api/trip` | Generate trip itinerary |
| `GET` | `/api/trip/[id]` | Retrieve trip itinerary |

---

## Data Sources and Demo Data

| Source | Use | Caveat |
|---|---|---|
| In-memory Delhi transit data | Stops, routes, trips, fares | Demo schedules, not live GPS |
| Open-Meteo | Weather forecast | Free, no key needed; fallback if unavailable |
| 16+ Delhi area mappings | Origin/destination resolution | Fuzzy-matched to nearest transit hub |
| AI-generated trip slots | Trip itineraries | Real places, estimated costs |
| Admin-submitted notices | Service disruptions | Must be approved before affecting plans |

**Supported Delhi areas include:** Lajpat Nagar, Sarojini Nagar, India Gate, Connaught Place, Hauz Khas, Karol Bagh, Green Park, Malviya Nagar, Greater Kailash, Paharganj, Akshardham, Preet Vihar, Kashmere Gate, Rajouri Garden, Janakpuri, Noida.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Git
- Anthropic API key (optional — app works without it using direct planner)

### 1. Clone the repository

```bash
git clone https://github.com/Deepanjali534/ClineHackthon.git
cd ClineHackthon
```

### 2. Install dependencies

```bash
npm install
```

> No native compilation required — zero C++ build tools needed.

### 3. Configure environment variables

Create `.env.local` in the project root:

```dotenv
# Optional - enables full Claude AI planning
# Without this, deterministic planner is used (still fully functional)
ANTHROPIC_API_KEY=

NEXT_PUBLIC_APP_NAME=Yatra Sathi
```

Get a free API key at https://console.anthropic.com

### 4. Run the development server

```bash
npm run dev
```


### 5. Build for production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Optional | Enables Claude AI agent. Without it, deterministic planner runs. |
| `NEXT_PUBLIC_APP_NAME` | Optional | App display name |

---

## Roadmap

### Near term
- Schedule RSS disruption detector
- Integrate live GTFS-Realtime feeds
- Add Hindi voice input
- Persistent SQLite storage

### Within six months
- UPI fare payment
- Crowdsourced disruption reports
- Personalised delay predictions
- Accessibility routing

### Longer term
- Expand to additional Indian cities
- Add train and intercity bus planning
- WhatsApp low-data experience
- Air-quality-aware routing

## Team

**Team Chitosan**Built for the **Cline AI Builder Hackathon — Round 2**.

- **Deepanjali** — Frontend (branch: `deepanjali/main-dev`)

## References

- **Repository:** https://github.com/Deepanjali534/ClineHackthon
- **Cline:** https://cline.bot/
- **Claude API:** https://docs.claude.com/
- **Anthropic SDK:** https://github.com/anthropics/anthropic-sdk-typescript
- **Next.js:** https://nextjs.org/
- **Tailwind CSS:** https://tailwindcss.com/
- **shadcn/ui:** https://ui.shadcn.com/
- **Open-Meteo:** https://open-meteo.com/

---

*Yatra Sathi — Not just a route. Your smarter travel companion.*
