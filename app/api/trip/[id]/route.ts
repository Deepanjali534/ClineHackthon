import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await initDb();
    const db = getDb();
  // Poll up to 30s for the trip plan to be ready
  for (let i = 0; i < 30; i++) {
    const row = db.prepare('SELECT * FROM trips_plan WHERE id=?').get(params.id) as any;
    if (row?.status === 'ready' && row.plan_json) {
      return NextResponse.json(JSON.parse(row.plan_json));
    }
    if (row?.status === 'error') {
      return NextResponse.json({ error: 'Trip planning failed' }, { status: 500 });
    }
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await new Promise(r => setTimeout(r, 1000));
  }
  return NextResponse.json({ error: 'Timeout waiting for trip plan' }, { status: 504 });
}
