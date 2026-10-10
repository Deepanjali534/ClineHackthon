import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { runTravelAgent, SSEEmitter } from '@/lib/agent';
import { CommuteRequest } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const planRow = db.prepare('SELECT * FROM plans WHERE id=?').get(params.id) as any;
  if (!planRow) {
    return new Response('Not found', { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}

`));
      };

      // Check if plan is already ready (poll from DB)
      let attempts = 0;
      while (attempts < 30) {
        const row = db.prepare('SELECT status, plan_json FROM plans WHERE id=?').get(params.id) as any;
        if (row?.status === 'ready' && row.plan_json) {
          const plan = JSON.parse(row.plan_json);
          // Replay agent run events
          const runRow = db.prepare('SELECT events_json FROM agent_runs WHERE plan_id=? ORDER BY created_at DESC LIMIT 1').get(params.id) as any;
          if (runRow?.events_json) {
            const events = JSON.parse(runRow.events_json);
            for (const ev of events) {
              send(ev);
              await delay(80);
            }
          }
          send({ type: 'plan_ready', plan });
          break;
        } else if (row?.status === 'error') {
          send({ type: 'error', message: 'Planning failed. Please try again.' });
          break;
        }
        send({ type: 'progress', message: attempts === 0 ? '🤖 Agent is planning your journey...' : '⏳ Still working...' });
        await delay(1000);
        attempts++;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
