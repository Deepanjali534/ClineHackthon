import { NextRequest, NextResponse } from 'next/server';

(globalThis as any).__tripStore = (globalThis as any).__tripStore || new Map();
const store: Map<string, any> = (globalThis as any).__tripStore;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const entry = store.get(params.id);
  if (!entry) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  return NextResponse.json(entry.plan);
}
