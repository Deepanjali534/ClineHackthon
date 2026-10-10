import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { CommuteRequest } from '@/lib/types';
import { runTravelAgent } from '@/lib/agent';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body: CommuteRequest = await req.json();
    await initDb();
    const db = getDb();
    const id = randomUUID();

    db.prepare('INSERT INTO plans (id, request_json, status) VALUES (?,?,?)').run(id, JSON.stringify(body), 'pending');

    // Run agent async, store result
    (async () => {
      const events: any[] = [];
      const emit = (e: any) => events.push(e);
      try {
        const plan = await runTravelAgent(body, id, emit);
        db.prepare('UPDATE plans SET plan_json=?, status=? WHERE id=?').run(JSON.stringify(plan), 'ready', id);
        db.prepare('INSERT INTO plan_versions (plan_id, version, plan_json, trigger) VALUES (?,?,?,?)').run(id, 1, JSON.stringify(plan), 'initial');
      } catch (err: any) {
        db.prepare("UPDATE plans SET status='error' WHERE id=?").run(id);
      }
      // Store agent run events
      const runId = events.find(e => e.agentRunId)?.agentRunId ?? `run_${id}`;
      db.prepare('INSERT OR IGNORE INTO agent_runs (id, plan_id, events_json, status) VALUES (?,?,?,?)').run(runId, id, JSON.stringify(events), 'completed');
    })();

    return NextResponse.json({ id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
