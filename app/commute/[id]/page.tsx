'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { JourneyPlan } from '@/lib/types';
import { triggerReplan } from '@/lib/api';
import { JourneyCard } from '@/components/commute/JourneyCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { RouteMap } from '@/components/shared/RouteMap';
import { mockPlan, mockBackupPlan } from '@/lib/mock/mockPlan';

export default function PlanPage() {
  const params = useParams();
  const id = params.id as string;
  const isDemo = id === mockPlan.id;
  const [plan, setPlan] = useState<JourneyPlan | null>(isDemo ? { ...mockPlan, backup: mockBackupPlan } : null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState('');
  const [showBackup, setShowBackup] = useState(false);

  useEffect(() => {
    if (isDemo) return;
    fetch(`/api/plan/${id}`)
      .then(async res => { if (!res.ok) throw new Error('Plan not found'); const d = await res.json(); return d.plan ?? d; })
      .then(p => { setPlan(p); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id, isDemo]);

  if (loading) return <LoadingSpinner message="Loading your journey plan..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!plan) return <ErrorState message="Plan not found." />;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main */}
      <div className="col-span-8">
        <JourneyCard plan={plan} budget={120} maxWalk={500} isHighlighted
          onNavigate={() => window.open(`https://maps.google.com?q=${encodeURIComponent(plan.returnLeg.steps[plan.returnLeg.steps.length-1]?.description || 'Delhi')}`, '_blank')}
          onSave={() => navigator.clipboard?.writeText(window.location.href)}
          onViewBackup={plan.backup ? () => setShowBackup(s => !s) : undefined} />
        {showBackup && plan.backup && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Backup options</h3>
            <JourneyCard plan={plan.backup} budget={120} maxWalk={500} />
          </div>
        )}
        <div className="mt-6">
          <RouteMap plan={plan} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="col-span-4 space-y-4">
        {/* Travel agent card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">&#129302;</div>
            <div>
              <div className="text-sm font-bold text-slate-900">Travel agent</div>
              <div className="text-xs text-slate-400">Tools: routes &middot; weather &middot; notices</div>
            </div>
          </div>
          <button className="w-full py-3 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all">
            &#10024; Explain this plan
          </button>
        </div>

        {/* Live monitoring */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm font-bold text-slate-700 mb-3">Live monitoring</p>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3 py-2 text-sm mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All services running
          </div>
          <div className="flex gap-2">
            <button onClick={() => triggerReplan(id, 'late').catch(() => {})}
              className="flex-1 py-2 rounded-xl border border-orange-200 text-orange-600 text-xs font-semibold hover:bg-orange-50 transition-colors">
              Running late
            </button>
            <button onClick={() => triggerReplan(id, 'missed').catch(() => {})}
              className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
              Missed bus
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm font-bold text-slate-700 mb-3">Journey summary</p>
          <div className="space-y-2">
            {[
              { label: 'Total cost', val: `\u20b9${plan.totalCostINR}` },
              { label: 'Total walking', val: `${plan.totalWalkMeters}m` },
              { label: 'Score', val: `${Math.round(plan.optimizationScore * 100) || plan.optimizationScore}/100` },
              { label: 'Weather', val: plan.weatherSummary },
            ].map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{s.label}</span>
                <span className="font-semibold text-slate-800">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
