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

export default function PlanPage() {
  const params = useParams();
  const id = params.id as string;
  const isDemo = id === mockPlan.id;

  const [plan, setPlan] = useState<JourneyPlan | null>(isDemo ? { ...mockPlan, backup: mockBackupPlan } : null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState('');
  const [showBackup, setShowBackup] = useState(false);
  const [monitoring, setMonitoring] = useState(false);

  // SSE for live monitoring (only when monitoring is on)
  const sseUrl = monitoring && !isDemo ? `/api/plan/${id}/stream` : null;
  const { events, lastEvent } = useSSE(sseUrl);

  useEffect(() => {
    if (isDemo) return;
    getPlan(id)
      .then(setPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isDemo]);

  const handleReplan = async (reason: string) => {
    try {
      await triggerReplan(id, reason);
    } catch {
      // Demo: just show alert
    }
  };

  if (loading) return <LoadingSpinner message="Loading your journey plan..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!plan) return <ErrorState message="Plan not found." />;

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-800">
          <SourceBadge type="demo" />
          <span>Showing demo plan — Lajpat Nagar → Connaught Place</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">Your Journey Plan</h1>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500">v{plan.version}</span>
        </div>
      </div>

      {/* Live monitoring toggle */}
      {!monitoring ? (
        <button onClick={() => setMonitoring(true)}
          className="w-full rounded-xl border border-green-300 bg-green-50 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100">
          🟢 Start Live Monitoring
        </button>
      ) : (
        <LiveMonitoringBanner lastEvent={lastEvent} onReplan={handleReplan} />
      )}

      {/* Main plan */}
      <JourneyCard
        plan={plan}
        budget={120}
        maxWalk={500}
        isHighlighted
        onNavigate={() => alert('Navigation — backend integration pending')}
        onSave={() => alert('Saved!')}
        onViewBackup={plan.backup ? () => setShowBackup(!showBackup) : undefined}
      />

      {/* Backup plan */}
      {showBackup && plan.backup && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">🔄 Backup Plan</p>
          <JourneyCard plan={plan.backup} budget={120} maxWalk={500} />
        </div>
      )}

      {monitoring && (
        <DevActivityPanel events={events} agentRunId={isDemo ? 'demo-agent-run-001' : undefined} />
      )}
    </div>
  );
}
