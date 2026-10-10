# Daily Travel AI

AI-powered travel management for Indian commuters.
Hackathon 2025 | Frontend: Deepanjali | Backend: Teammate

## What It Does

- User describes commute -> AI plans the best route
- 5 Optimization Modes: Cheapest, Fastest, Least Walk, Comfortable, Balanced  
- Live monitoring with automatic replanning
- Admin panel for service disruption notices
- Trip planner for multi-day trips
- Demo corridor: Lajpat Nagar to Connaught Place, Delhi

## Frontend Setup

```
git clone https://github.com/Deepanjali534/ClineHackthon.git
cd ClineHackthon
git checkout deepanjali/main-dev
npm install
npm run dev
```

Open http://localhost:3000

App runs in demo mode when backend is not connected. All demo data is labeled with orange Demo Data badges.

## Tech Stack (Frontend)

- Next.js 14 App Router, TypeScript, Tailwind CSS
- shadcn/ui components
- EventSource / SSE for real-time streaming
- Mobile-first design (375px)

## Project Structure

- /app - Pages (commute, trip, admin, layout)
- /components - shared, commute, trip, admin components
- /lib - types.ts, api.ts, hooks/, mock/

## Backend API (teammate)

POST /api/plan | GET /api/plan/[id] | GET /api/plan/[id]/stream
POST /api/notices | PATCH /api/notices/[id]
POST /api/replan | POST /api/trip | GET /api/trip/[id]
