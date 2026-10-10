import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { runTravelAgent } from '@/lib/agent';
import { CommuteRequest } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { planId, reason } = await req.json();
    const db = getDb();

    const planRow = db.prepare('SELECT * FROM plans WHERE id=?').get(planId) as any;
    if (!planRow) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const originalRequest: CommuteRequest = JSON.parse(planRow.request_json);
    const newId = randomUUID();

    db.prepare('INSERT INTO plans (id, request_json, status) VALUES (?,?,?)').run(newId, planRow.request_json, 'pending');

    // Run replanning async
    (async () => {
      const events: any[] = [];
      const emit = (e: any) => events.push(e);
      try {
        const plan = await runTravelAgent(originalRequest, newId, emit, true);
        db.prepare('UPDATE plans SET plan_json=?, status=? WHERE id=?').run(JSON.stringify(plan), 'ready', newId);
        // Get current version number
        const maxVersion = db.prepare('SELECT MAX(version) as v FROM plan_versions WHERE plan_id=?').get(planId) as any;
        const nextVersion = (maxVersion?.v ?? 1) + 1;
        db.prepare('INSERT INTO plan_versions (plan_id, version, plan_json, trigger) VALUES (?,?,?,?)').run(newId, nextVersion, JSON.stringify(plan), reason ?? 'replan');
      } catch (err) {
        db.prepare("UPDATE plans SET status='error' WHERE id=?").run(newId);
      }
    })();

    return NextResponse.json({ id: newId, originalPlanId: planId, reason });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
