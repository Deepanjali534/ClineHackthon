import { NextRequest, NextResponse } from 'next/server';
import { CommuteRequest } from '@/lib/types';
import { planJourney } from '@/lib/planner';
import { randomUUID } from 'crypto';

// In-memory plan store — shared within the same Next.js server process
const planStore = new Map<string, any>();
// Export so stream route can access it
(globalThis as any).__planStore = (globalThis as any).__planStore || new Map();
const store: Map<string, any> = (globalThis as any).__planStore;

export async function POST(req: NextRequest) {
  try {
    const body: CommuteRequest = await req.json();
    const id = randomUUID();

    // Run planner synchronously — no background async
    const plan = await planJourney(body, id);
    plan.id = id;

    // Store in globalThis so stream route can access same memory
    store.set(id, { status: 'ready', plan });

    return NextResponse.json({ id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Planning failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const plans = Array.from(store.entries()).map(([id, v]) => ({ id, status: v.status }));
  return NextResponse.json({ plans });
}
