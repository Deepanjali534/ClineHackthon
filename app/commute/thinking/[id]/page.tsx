'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSSE } from '@/lib/hooks/useSSE';
import { SSEEvent } from '@/lib/types';
import { DevActivityPanel } from '@/components/shared/DevActivityPanel';
import { mockPlan } from '@/lib/mock/mockPlan';

const MOCK_EVENTS: SSEEvent[] = [
  { type: 'tool_start', toolName: 'get_service_notices', message: 'Checking service notices...' },
  { type: 'tool_end', toolName: 'get_service_notices', durationMs: 800 },
  { type: 'tool_start', toolName: 'get_route_options', message: 'Fetching departures...' },
  { type: 'tool_end', toolName: 'get_route_options', durationMs: 1200 },
  { type: 'tool_start', toolName: 'get_weather', message: 'Getting weather data...' },
  { type: 'tool_end', toolName: 'get_weather', durationMs: 700 },
  { type: 'tool_start', toolName: 'evaluate_journeys', message: 'Comparing journey options...' },
  { type: 'tool_end', toolName: 'evaluate_journeys', durationMs: 900 },
  { type: 'tool_start', toolName: 'check_return_trips', message: 'Evaluating return trips...' },
  { type: 'tool_end', toolName: 'check_return_trips', durationMs: 600 },
  { type: 'plan_ready', plan: mockPlan, message: 'Plan ready!' },
];

const toolNames: Record<string, string> = {
  progress: 'Working...',
  get_service_notices: 'Checking service notices',
  get_route_options: 'Fetching departures',
  get_weather: 'Getting weather data',
  evaluate_journeys: 'Comparing journey options',
  check_return_trips: 'Evaluating return trips',
};

export default function ThinkingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isDemo = params.id === mockPlan.id;
  const { events: realEvents } = useSSE(!isDemo ? `/api/plan/${params.id}/stream` : null);
  const [demoEvents, setDemoEvents] = useState<SSEEvent[]>([]);
  const [demoIdx, setDemoIdx] = useState(0);

  useEffect(() => {
    if (!isDemo || demoIdx >= MOCK_EVENTS.length) return;
    const t = setTimeout(() => { setDemoEvents(p => [...p, MOCK_EVENTS[demoIdx]]); setDemoIdx(i => i + 1); }, demoIdx === 0 ? 600 : 1000);
    return () => clearTimeout(t);
  }, [isDemo, demoIdx]);

  const events = isDemo ? demoEvents : realEvents;
  const planReady = events.find(e => e.type === 'plan_ready');
  const agentRunId = events.find(e => e.agentRunId)?.agentRunId;
  const toolMap: Record<string, { done: boolean; ms?: number }> = {};
  events.forEach(e => {
    if (e.type === 'tool_start' && e.toolName) toolMap[e.toolName] = { done: false };
    if (e.type === 'tool_end' && e.toolName) toolMap[e.toolName] = { done: true, ms: e.durationMs };
  });

  useEffect(() => {
    if (planReady) { const t = setTimeout(() => router.push(`/commute/${params.id}`), 1000); return () => clearTimeout(t); }
  }, [planReady, params.id, router]);

  const allTools = ['get_service_notices','get_route_options','get_weather','evaluate_journeys','check_return_trips','plan_ready'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16">
      {/* Loader rings */}
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{borderTopColor:'#3b82f6',animationDuration:'1.2s'}} />
        <div className="absolute inset-3 rounded-full border-2 border-transparent animate-spin" style={{borderTopColor:'#06b6d4',animationDuration:'1.8s',animationDirection:'reverse'}} />
        <div className="absolute inset-6 rounded-full border-2 border-transparent animate-spin" style={{borderTopColor:'#8b5cf6',animationDuration:'0.9s'}} />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">🤖</div>
      </div>

      <h1 className="text-2xl font-black text-white mb-2">Cline is Planning Your Journey</h1>
      <p className="text-sm text-slate-500 mb-10">AI agent analysing routes, weather, and schedules...</p>

      {/* Steps */}
      <div className="w-full max-w-lg space-y-3 mb-8">
        {allTools.map((tool, idx) => {
          const info = toolMap[tool];
          const pending = !info;
          const active = info && !info.done;
          const done = info?.done;
          const isReady = tool === 'plan_ready';
          const showReady = isReady && !!planReady;
          if (isReady && !planReady) return (
            <div key={tool} className="flex items-center gap-3 opacity-30">
              <div className="w-5 h-5 rounded-full border border-slate-600" />
              <span className="text-sm text-slate-500">Finalising plan</span>
            </div>
          );
          if (isReady && planReady) return (
            <div key={tool} className="flex items-center gap-3 animate-fade-in-up">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">★</div>
              <span className="text-sm font-bold text-blue-400">Plan ready! Redirecting...</span>
            </div>
          );
          return (
            <div key={tool} className={`flex items-center gap-3 transition-all ${pending ? 'opacity-30' : ''}`}>
              {done ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-400">✓</div>
              ) : active ? (
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-700" />
              )}
              <span className={`text-sm ${done ? 'text-slate-300' : active ? 'text-white font-semibold' : 'text-slate-600'}`}>
                {toolNames[tool] || tool}
              </span>
              {done && info.ms && <span className="ml-auto text-xs text-slate-600">{(info.ms/1000).toFixed(1)}s</span>}
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-lg">
        <DevActivityPanel events={events} agentRunId={agentRunId || (isDemo ? 'demo-agent-001' : undefined)} />
      </div>
    </div>
  );
}
