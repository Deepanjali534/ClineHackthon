'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSSE } from '@/lib/hooks/useSSE';
import { SSEEvent } from '@/lib/types';
import { DevActivityPanel } from '@/components/shared/DevActivityPanel';
import { mockPlan } from '@/lib/mock/mockPlan';

const MOCK_EVENTS: SSEEvent[] = [
  { type: 'tool_start', toolName: 'get_route_options', message: 'Fetching route options...' },
  { type: 'tool_end', toolName: 'get_route_options', durationMs: 1200 },
  { type: 'tool_start', toolName: 'get_weather', message: 'Checking weather...' },
  { type: 'tool_end', toolName: 'get_weather', durationMs: 800 },
  { type: 'tool_start', toolName: 'evaluate_journeys', message: 'Comparing options...' },
  { type: 'tool_end', toolName: 'evaluate_journeys', durationMs: 400 },
  { type: 'tool_start', toolName: 'check_return_trips', message: 'Evaluating return trips...' },
  { type: 'tool_end', toolName: 'check_return_trips', durationMs: 600 },
  { type: 'plan_ready', plan: mockPlan, message: 'Plan ready!' },
];

const toolFriendlyName: Record<string, string> = {
  get_route_options: 'Checking departures',
  get_weather: 'Fetching weather',
  evaluate_journeys: 'Comparing journey options',
  check_return_trips: 'Evaluating return trips',
};

export default function ThinkingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isDemo = params.id === mockPlan.id;

  const sseUrl = !isDemo ? `/api/plan/${params.id}/stream` : null;
  const { events: realEvents } = useSSE(sseUrl);

  const [demoEvents, setDemoEvents] = useState<SSEEvent[]>([]);
  const [demoIdx, setDemoIdx] = useState(0);

  useEffect(() => {
    if (!isDemo) return;
    if (demoIdx >= MOCK_EVENTS.length) return;
    const delay = demoIdx === 0 ? 500 : 900;
    const t = setTimeout(() => {
      setDemoEvents((prev) => [...prev, MOCK_EVENTS[demoIdx]]);
      setDemoIdx((i) => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [isDemo, demoIdx]);

  const events = isDemo ? demoEvents : realEvents;
  const planReadyEvent = events.find((e) => e.type === 'plan_ready');
  const agentRunId = events.find((e) => e.agentRunId)?.agentRunId;

  useEffect(() => {
    if (planReadyEvent) {
      const t = setTimeout(() => router.push(`/commute/${params.id}`), 800);
      return () => clearTimeout(t);
    }
  }, [planReadyEvent, params.id, router]);

  const toolMap: Record<string, { done: boolean; durationMs?: number }> = {};
  events.forEach((e) => {
    if (e.type === 'tool_start' && e.toolName) toolMap[e.toolName] = { done: false };
    if (e.type === 'tool_end' && e.toolName) toolMap[e.toolName] = { done: true, durationMs: e.durationMs };
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">🤖</div>
        <h1 className="text-xl font-bold text-gray-800">Cline is Planning Your Journey</h1>
        <p className="text-sm text-gray-500 mt-1">AI agent is analysing routes, weather, and schedules...</p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-green-500">✅</span>
          <span className="text-sm text-gray-700">Starting AI agent...</span>
        </div>

        {Object.entries(toolMap).map(([tool, info]) => (
          <div key={tool} className="flex items-center gap-3">
            {info.done ? (
              <span className="text-green-500">✅</span>
            ) : (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            )}
            <span className="text-sm text-gray-700">
              {toolFriendlyName[tool] || tool}
              {info.done && info.durationMs && (
                <span className="ml-1 text-xs text-gray-400">({(info.durationMs / 1000).toFixed(1)}s)</span>
              )}
            </span>
          </div>
        ))}

        {planReadyEvent && (
          <div className="flex items-center gap-3">
            <span className="text-blue-500">🎉</span>
            <span className="text-sm font-semibold text-blue-700">Plan ready! Redirecting...</span>
          </div>
        )}
      </div>

      <DevActivityPanel events={events} agentRunId={agentRunId || (isDemo ? 'demo-agent-run-001' : undefined)} />
    </div>
  );
}
