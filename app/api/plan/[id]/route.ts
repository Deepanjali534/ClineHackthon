import { NextRequest, NextResponse } from 'next/server';

const store: Map<string, any> = (globalThis as any).__planStore || new Map();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const entry = store.get(params.id);
  if (!entry) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  if (entry.status !== 'ready') return NextResponse.json({ error: 'Plan not ready yet', status: entry.status }, { status: 202 });
  return NextResponse.json(entry.plan);
}
