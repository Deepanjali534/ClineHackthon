'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSSE } from '@/lib/hooks/useSSE';
import { SSEEvent } from '@/lib/types';
import { mockPlan } from '@/lib/mock/mockPlan';

const MOCK: SSEEvent[] = [
  { type: 'tool_start', toolName: 'get_route_options', message: 'Fetching route options...' },
  { type: 'tool_end', toolName: 'get_route_options', durationMs: 600 },
  { type: 'tool_start', toolName: 'get_weather', message: 'Getting Delhi weather...' },
  { type: 'tool_end', toolName: 'get_weather', durationMs: 500 },
  { type: 'tool_start', toolName: 'evaluate_journeys', message: 'Comparing options...' },
  { type: 'tool_end', toolName: 'evaluate_journeys', durationMs: 400 },
  { type: 'tool_start', toolName: 'check_return_trips', message: 'Evaluating return trips...' },
  { type: 'tool_end', toolName: 'check_return_trips', durationMs: 300 },
  { type: 'plan_ready', plan: mockPlan, message: 'Plan ready!' },
];
const toolLabel: Record<string, string> = {
  get_route_options: 'Fetching route options',
  get_weather: 'Getting Delhi weather',
  evaluate_journeys: 'Comparing journey options',
  check_return_trips: 'Evaluating return trips',
};

export default function ThinkingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isDemo = params.id === mockPlan.id;
  const { events: realEvents } = useSSE(!isDemo ? `/api/plan/${params.id}/stream` : null);
  const [demoEvents, setDemoEvents] = useState<SSEEvent[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isDemo || idx >= MOCK.length) return;
    const t = setTimeout(() => { setDemoEvents(p => [...p, MOCK[idx]]); setIdx(i => i+1); }, idx === 0 ? 400 : 800);
    return () => clearTimeout(t);
  }, [isDemo, idx]);

  const events = isDemo ? demoEvents : realEvents;
  const planReady = events.find(e => e.type === 'plan_ready');
  const toolMap: Record<string, { done: boolean; ms?: number }> = {};
  events.forEach(e => {
    if (e.type === 'tool_start' && e.toolName) toolMap[e.toolName] = { done: false };
    if (e.type === 'tool_end' && e.toolName) toolMap[e.toolName] = { done: true, ms: e.durationMs };
  });

  useEffect(() => {
    if (planReady) {
      const t = setTimeout(() => router.push(`/commute/${params.id}`), 800);
      return () => clearTimeout(t);
    }
  }, [planReady, params.id, router]);

  const steps = ['get_route_options','get_weather','evaluate_journeys','check_return_trips'];

  return (
    <div className="max-w-lg mx-auto py-16 text-center">
      {/* Spinner */}
      <div className="relative w-16 h-16 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">&#129302;</div>
      </div>

      <h2 className="text-2xl font-black text-slate-900 mb-2">Planning your journey</h2>
      <p className="text-slate-500 text-sm mb-10">AI agent is finding the best route for your constraints</p>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left space-y-4">
        {steps.map(tool => {
          const info = toolMap[tool];
          return (
            <div key={tool} className="flex items-center gap-3">
              {info?.done ? (
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold">&#10003;</div>
              ) : info && !info.done ? (
                <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
              )}
              <span className={`text-sm ${ info?.done ? 'text-slate-700' : info ? 'text-blue-700 font-semibold' : 'text-slate-400' }`}>
                {toolLabel[tool]}
              </span>
              {info?.done && info.ms && <span className="ml-auto text-xs text-slate-400">{(info.ms/1000).toFixed(1)}s</span>}
            </div>
          );
        })}
        {planReady && (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">&#9733;</div>
            <span className="text-sm font-bold text-blue-700">Route ready &mdash; redirecting...</span>
          </div>
        )}
      </div>
    </div>
  );
}
