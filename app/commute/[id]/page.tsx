'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JourneyPlan } from '@/lib/types';
import { getPlan, triggerReplan } from '@/lib/api';
import { JourneyCard } from '@/components/commute/JourneyCard';
import { LiveMonitoringBanner } from '@/components/commute/LiveMonitoringBanner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { SourceBadge } from '@/components/shared/SourceBadge';
import { DevActivityPanel } from '@/components/shared/DevActivityPanel';
import { useSSE } from '@/lib/hooks/useSSE';
import { mockPlan, mockBackupPlan } from '@/lib/mock/mockPlan';
import { RouteMap } from '@/components/shared/RouteMap';

export default function PlanPage() {
  const params = useParams();
  const id = params.id as string;
  const isDemo = id === mockPlan.id;
  const [plan, setPlan] = useState<JourneyPlan | null>(isDemo ? { ...mockPlan, backup: mockBackupPlan } : null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState('');
  const [showBackup, setShowBackup] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const sseUrl = monitoring && !isDemo ? `/api/plan/${id}/stream` : null;
  const { events, lastEvent } = useSSE(sseUrl);

  useEffect(() => {
    if (isDemo) return;
    fetch(`/api/plan/${id}`)
      .then(async res => {
        if (!res.ok) throw new Error('Plan not found');
        const data = await res.json();
        return data.plan ?? data;
      })
      .then(plan => { setPlan(plan); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id, isDemo]);

  if (loading) return <LoadingSpinner message="Loading your journey plan..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!plan) return <ErrorState message="Plan not found." />;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      {isDemo && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5">
          <SourceBadge type="demo" />
          <span className="text-xs text-slate-500">Showing demo plan — Lajpat Nagar → Connaught Place</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Your Journey Plan</h1>
          <p className="text-xs text-slate-500 mt-1">Version {plan.version} · {new Date(plan.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">{plan.optimizationMode.toUpperCase()}</span>
      </div>
      {!monitoring ? (
        <button onClick={() => setMonitoring(true)}
          className="w-full py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-sm font-bold hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span>
          Start Live Monitoring
        </button>
      ) : (
        <LiveMonitoringBanner lastEvent={lastEvent} onReplan={reason => triggerReplan(id, reason).catch(() => {})} />
      )}
      <JourneyCard plan={plan} budget={120} maxWalk={500} isHighlighted
        onNavigate={() => { window.open(`https://maps.google.com?q=Connaught+Place,Delhi`, '_blank'); }}
        onSave={() => { navigator.clipboard?.writeText(window.location.href).then(() => {}); }}
        onViewBackup={plan.backup ? () => setShowBackup(s => !s) : undefined} />
      <RouteMap plan={plan} />
      {showBackup && plan.backup && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Backup Plan</p>
          <JourneyCard plan={plan.backup} budget={120} maxWalk={500} />
        </div>
      )}
      {monitoring && <DevActivityPanel events={events} agentRunId={isDemo ? 'demo-agent-001' : undefined} />}
    </div>
  );
}
