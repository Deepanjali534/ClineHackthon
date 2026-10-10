import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const db = getDb();
  const plan = db.prepare('SELECT * FROM plans WHERE id=?').get(params.id) as any;
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const versions = db.prepare('SELECT * FROM plan_versions WHERE plan_id=? ORDER BY version DESC').all(params.id);

  return NextResponse.json({
    ...plan,
    plan: plan.plan_json ? JSON.parse(plan.plan_json) : null,
    request: JSON.parse(plan.request_json),
    versions: versions.map((v: any) => ({ ...v, plan: JSON.parse(v.plan_json) })),
  });
}
