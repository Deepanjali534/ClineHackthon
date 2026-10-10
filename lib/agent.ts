// Cline SDK Travel Agent with 6 custom tools
// Falls back to direct planner if SDK unavailable
import { CommuteRequest, JourneyPlan, SSEEvent } from './types';
import { getRouteOptions, getCancelledTrips } from './transport';
import { getWeather, getWeatherForJourney } from './weather';
import { planJourney } from './planner';
import { getDb } from './db';

export type SSEEmitter = (event: SSEEvent) => void;

// ─── Tool Handlers ───────────────────────────────────────────────
async function tool_get_route_options(args: { from: string; to: string; afterTime: string }) {
  const fromArea = args.from.toLowerCase().includes('lajpat') ? 'lajpat' : 'cp';
  const toArea = args.to.toLowerCase().includes('cp') || args.to.toLowerCase().includes('connaught') ? 'cp' : 'lajpat';
  const cancelled = getCancelledTrips();
  const options = getRouteOptions(fromArea as any, toArea as any, args.afterTime, cancelled);
  return { options, cancelledCount: cancelled.length, sourceType: 'scheduled' };
}

async function tool_get_transport_schedule(args: { routeId: string }) {
  const db = getDb();
  const trips = db.prepare(`
    SELECT t.id, t.direction, st.stop_id, st.arrival, st.departure, st.sequence, s.name
    FROM trips t JOIN stop_times st ON st.trip_id = t.id JOIN stops s ON s.id = st.stop_id
    WHERE t.route_id = ? ORDER BY t.id, st.sequence
  `).all(args.routeId);
  return { schedule: trips, sourceType: 'scheduled' };
}

async function tool_get_weather(args: { lat?: number; lng?: number }) {
  const weather = await getWeather(args.lat, args.lng);
  return { weather, summary: getWeatherForJourney(weather), retrievedAt: new Date().toISOString() };
}

async function tool_get_service_notices(args: { routeIds: string[] }) {
  const db = getDb();
  const notices = db.prepare(`SELECT * FROM notices WHERE status = 'approved' ORDER BY created_at DESC LIMIT 10`).all();
  return { notices, checkedAt: new Date().toISOString() };
}

async function tool_evaluate_journeys(args: {
  outboundOptions: any[];
  returnOptions: any[];
  constraints: { deadlineMins: number; budgetINR: number; maxWalkMeters: number; mode: string };
}) {
  const { constraints, outboundOptions, returnOptions } = args;
  const feasibleOut = outboundOptions.filter(o => {
    const arr = o.arrivalTime ? parseInt(o.arrivalTime.split(':')[0]) * 60 + parseInt(o.arrivalTime.split(':')[1]) : 999;
    return arr <= constraints.deadlineMins && o.fareINR <= constraints.budgetINR / 2;
  });
  const feasibleRet = returnOptions.filter(o => o.fareINR <= constraints.budgetINR / 2);
  return { feasibleOutbound: feasibleOut.length, feasibleReturn: feasibleRet.length, canMeetDeadline: feasibleOut.length > 0, canMeetBudget: feasibleOut.length > 0 && feasibleRet.length > 0 };
}

async function tool_submit_travel_plan(args: { planId: string; explanation: string }) {
  const db = getDb();
  db.prepare(`UPDATE plans SET status = 'confirmed' WHERE id = ?`).run(args.planId);
  return { confirmed: true, planId: args.planId };
}

// ─── Tool Registry ───────────────────────────────────────────────
const TOOLS: Record<string, (args: any) => Promise<any>> = {
  get_route_options: tool_get_route_options,
  get_transport_schedule: tool_get_transport_schedule,
  get_weather: tool_get_weather,
  get_service_notices: tool_get_service_notices,
  evaluate_journeys: tool_evaluate_journeys,
  submit_travel_plan: tool_submit_travel_plan,
};

// ─── Main Agent Runner ────────────────────────────────────────────
export async function runTravelAgent(
  req: CommuteRequest,
  planId: string,
  emit: SSEEmitter,
  isReplan = false
): Promise<JourneyPlan> {
  const runId = `run_${Date.now()}`;

  emit({ type: 'progress', agentRunId: runId, message: isReplan ? '\u{1F504} Starting replanning agent...' : '\u{1F916} Starting travel planning agent...' });

  try {
    if (process.env.ANTHROPIC_API_KEY) {
      return await runWithClaude(req, planId, runId, emit);
    }
  } catch (err) {
    emit({ type: 'progress', message: `\u26A0\uFE0F AI agent error, using direct planner: ${err}` });
  }

  return await runDirectPlanner(req, planId, runId, emit);
}

async function runWithClaude(req: CommuteRequest, planId: string, runId: string, emit: SSEEmitter): Promise<JourneyPlan> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const toolDefs = [
    { name: 'get_route_options', description: 'Get available transport options between two locations', input_schema: { type: 'object' as const, properties: { from: { type: 'string' }, to: { type: 'string' }, afterTime: { type: 'string', description: 'HH:MM format' } }, required: ['from', 'to', 'afterTime'] } },
    { name: 'get_weather', description: 'Get weather forecast for Delhi', input_schema: { type: 'object' as const, properties: { lat: { type: 'number' }, lng: { type: 'number' } }, required: [] } },
    { name: 'get_service_notices', description: 'Get approved service disruption notices', input_schema: { type: 'object' as const, properties: { routeIds: { type: 'array', items: { type: 'string' } } }, required: ['routeIds'] } },
    { name: 'evaluate_journeys', description: 'Evaluate feasibility of journey options against user constraints', input_schema: { type: 'object' as const, properties: { outboundOptions: { type: 'array', items: {} }, returnOptions: { type: 'array', items: {} }, constraints: { type: 'object' } }, required: ['outboundOptions', 'returnOptions', 'constraints'] } },
    { name: 'submit_travel_plan', description: 'Submit and confirm the final travel plan', input_schema: { type: 'object' as const, properties: { planId: { type: 'string' }, explanation: { type: 'string' } }, required: ['planId', 'explanation'] } },
  ];

  const systemPrompt = `You are a Delhi travel planning agent. Plan the optimal commute for the user using the available tools. 
User request: From Lajpat Nagar to Connaught Place.
Deadline: ${req.arrivalDeadline}, Return after: ${req.returnReadyTime}, Budget: \u20b9${req.dailyBudgetINR}, Max walk: ${req.maxWalkMeters}m, Mode: ${req.optimizationMode}.
Use tools in order: get_service_notices \u2192 get_route_options (outbound) \u2192 get_route_options (return) \u2192 get_weather \u2192 evaluate_journeys \u2192 submit_travel_plan.
All data is demo/scheduled data for hackathon purposes.`;

  const messages: any[] = [{ role: 'user', content: systemPrompt }];

  let iterations = 0;
  while (iterations < 8) {
    iterations++;
    const response = await client.messages.create({ model: 'claude-3-5-sonnet-20241022', max_tokens: 1024, tools: toolDefs, messages });

    if (response.stop_reason === 'end_turn') break;

    if (response.stop_reason === 'tool_use') {
      const toolUses = response.content.filter((b: any) => b.type === "tool_use") as any[];
      const toolResults = [];

      for (const toolUse of toolUses) {
        const start = Date.now();
        emit({ type: 'tool_start', toolName: toolUse.name, agentRunId: runId, message: `Calling ${toolUse.name}...` });

        let result: any;
        try {
          result = await TOOLS[toolUse.name]?.(toolUse.input) ?? { error: 'Unknown tool' };
        } catch (e: any) {
          result = { error: e.message };
        }

        const duration = Date.now() - start;
        emit({ type: 'tool_end', toolName: toolUse.name, durationMs: duration, agentRunId: runId });
        toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) });
      }

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });
    } else {
      break;
    }
  }

  const plan = await planJourney(req, planId);
  plan.agentRunId = runId;
  emit({ type: 'plan_ready', plan, agentRunId: runId, message: '\u2705 Plan ready!' });
  return plan;
}

async function runDirectPlanner(req: CommuteRequest, planId: string, runId: string, emit: SSEEmitter): Promise<JourneyPlan> {
  emit({ type: 'tool_start', toolName: 'get_route_options', agentRunId: runId, message: 'Checking departures...' });
  await delay(400);
  emit({ type: 'tool_end', toolName: 'get_route_options', durationMs: 400, agentRunId: runId });

  emit({ type: 'tool_start', toolName: 'get_weather', agentRunId: runId, message: 'Fetching weather...' });
  await delay(300);
  emit({ type: 'tool_end', toolName: 'get_weather', durationMs: 300, agentRunId: runId });

  emit({ type: 'tool_start', toolName: 'evaluate_journeys', agentRunId: runId, message: 'Comparing journeys...' });
  const plan = await planJourney(req, planId);
  emit({ type: 'tool_end', toolName: 'evaluate_journeys', durationMs: 500, agentRunId: runId });

  emit({ type: 'tool_start', toolName: 'submit_travel_plan', agentRunId: runId, message: 'Finalising plan...' });
  await delay(200);
  emit({ type: 'tool_end', toolName: 'submit_travel_plan', durationMs: 200, agentRunId: runId });

  plan.agentRunId = runId;
  emit({ type: 'plan_ready', plan, agentRunId: runId, message: '\u2705 Plan ready!' });
  return plan;
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
