'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JourneyPlan } from '@/lib/types';
import { getPlan, triggerReplan } from '@/lib/api';
import { JourneyCard } from '@/components/commute/JourneyCard';
import { LiveMonitoringBanner } from '@/components/commute/LiveMonitoringBanner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { DevActivityPanel } from '@/components/shared/DevActivityPanel';
import { useSSE } from '@/lib/hooks/useSSE';
import { createMockPlan, mockBackupPlan } from '@/lib/mock/mockPlan';

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isDemo = id === 'demo-plan-001';

  const [origin, setOrigin] = useState('Your Location');
  const [destination, setDestination] = useState('Destination');
  const [budget, setBudget] = useState(120);
  const [maxWalk, setMaxWalk] = useState(500);
  const [plan, setPlan] = useState<JourneyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBackup, setShowBackup] = useState(false);
  const [monitoring, setMonitoring] = useState(false);

  const sseUrl = monitoring && !isDemo ? `/api/plan/${id}/stream` : null;
  const { events, lastEvent } = useSSE(sseUrl);

  useEffect(() => {
    let o = 'Your Location';
    let d = 'Destination';
    try {
      const stored = localStorage.getItem('lastCommuteRequest');
      if (stored) {
        const req = JSON.parse(stored);
        o = req.origin || 'Your Location';
        d = req.destination || 'Destination';
        setOrigin(o);
        setDestination(d);
        setBudget(req.dailyBudgetINR || 120);
        setMaxWalk(req.maxWalkMeters || 500);
      }
    } catch {}

    if (isDemo) {
      const mockP = createMockPlan(o, d);
      const backupSteps = mockBackupPlan.outbound.steps.map((s) => ({
        ...s,
        description: s.description.replace('Your Location', o).replace('Destination', d),
      }));
      setPlan({ ...mockP, backup: { ...mockBackupPlan, outbound: { ...mockBackupPlan.outbound, steps: backupSteps } } });
      setLoading(false);
      return;
    }

    const poll = async () => {
      for (let i = 0; i < 30; i++) {
        try {
          const p = await getPlan(id);
          if (p) { setPlan(p); setLoading(false); return; }
        } catch (e: any) {
          if (i === 29) { setError(e.message); setLoading(false); return; }
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      setError('Timed out. Please try again.');
      setLoading(false);
    };
    poll();
  }, [id, isDemo]);

  useEffect(() => {
    if (lastEvent?.type === 'plan_ready' && lastEvent.plan) setPlan(lastEvent.plan);
    if (lastEvent?.type === 'replan' && lastEvent.plan) setPlan(lastEvent.plan);
  }, [lastEvent]);

  const handleReplan = async (reason: string) => {
    try { await triggerReplan(id, reason); setMonitoring(true); }
    catch { console.error('Replan failed'); }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <LoadingSpinner message={`Planning your journey from ${origin} to ${destination}...`} />
        <p className="text-sm text-gray-500">AI agent is finding the best route for you</p>
      </div>
    );
  if (error) return <ErrorState message={error} onRetry={() => router.back()} />;
  if (!plan) return <ErrorState message="Plan not found." />;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{origin} &rarr; {destination}</h1>
          <p className="text-sm text-gray-500">Optimized for {plan.optimizationMode} &middot; v{plan.version}</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">&larr; Back</button>
      </div>

      {isDemo && (
        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-800">
          <SourceBadge type="demo" />
          <span>Demo mode &mdash; enter ANTHROPIC_API_KEY in .env.local for live AI planning</span>
        </div>
      )}

      {!monitoring ? (
        <button onClick={() => setMonitoring(true)} className="w-full rounded-xl border border-green-300 bg-green-50 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors">
          Start Live Monitoring
        </button>
      ) : (
        <LiveMonitoringBanner lastEvent={lastEvent} onReplan={handleReplan} />
      )}

      <a
        href={`https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
      >
        Open in Google Maps: {origin} &rarr; {destination}
      </a>

      <JourneyCard
        plan={plan} budget={budget} maxWalk={maxWalk} isHighlighted
        onNavigate={() => window.open(`https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}`, '_blank')}
        onSave={() => alert('Plan saved!')}
        onViewBackup={plan.backup ? () => setShowBackup(!showBackup) : undefined}
      />

      {showBackup && plan.backup && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Backup Option</p>
          <JourneyCard plan={plan.backup} budget={budget} maxWalk={maxWalk} />
        </div>
      )}

      {monitoring && <DevActivityPanel events={events} agentRunId={plan.agentRunId || 'demo-agent-run-001'} />}
    </div>
  );
}
