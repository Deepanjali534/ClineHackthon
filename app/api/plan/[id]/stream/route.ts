import { NextRequest } from 'next/server';

const store: Map<string, any> = (globalThis as any).__planStore || new Map();

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };

      send({ type: 'tool_start', toolName: 'get_route_options', message: 'Fetching route options...' });
      await delay(600);
      send({ type: 'tool_end', toolName: 'get_route_options', durationMs: 600 });

      send({ type: 'tool_start', toolName: 'get_weather', message: 'Getting Delhi weather...' });
      await delay(500);
      send({ type: 'tool_end', toolName: 'get_weather', durationMs: 500 });

      send({ type: 'tool_start', toolName: 'evaluate_journeys', message: 'Comparing journey options...' });
      await delay(400);
      send({ type: 'tool_end', toolName: 'evaluate_journeys', durationMs: 400 });

      send({ type: 'tool_start', toolName: 'check_return_trips', message: 'Evaluating return trips...' });
      await delay(300);
      send({ type: 'tool_end', toolName: 'check_return_trips', durationMs: 300 });

      // Wait for plan to be ready (it should already be ready since POST is sync)
      let attempts = 0;
      while (attempts < 15) {
        const entry = store.get(params.id);
        if (entry?.status === 'ready' && entry.plan) {
          send({ type: 'plan_ready', plan: entry.plan, agentRunId: `run_${params.id}` });
          break;
        }
        await delay(500);
        attempts++;
      }

      if (attempts >= 15) {
        send({ type: 'error', message: 'Plan took too long. Please try again.' });
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
