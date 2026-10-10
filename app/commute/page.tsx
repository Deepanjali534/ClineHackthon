'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlan } from '@/lib/api';
import { mockPlan } from '@/lib/mock/mockPlan';
import { OptimizationPicker } from '@/components/shared/OptimizationPicker';
import { useCommuteForm } from '@/lib/hooks/useCommuteForm';

export default function CommutePage() {
  const router = useRouter();
  const { form, update, isFormValid, toRequest } = useCommuteForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try { const { id } = await createPlan(toRequest()); router.push(`/commute/thinking/${id}`); }
    catch { router.push(`/commute/thinking/${mockPlan.id}`); }
    finally { setLoading(false); }
  };

  const inp = 'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Plan your day</h1>
        <p className="text-slate-500 mt-1">Hard constraints enforced &mdash; AI explains any trade-offs.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Origin</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">&#128205;</span>
              <input className={`${inp} pl-9`} placeholder="e.g. Lajpat Nagar" value={form.origin} onChange={e => update('origin', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Destination</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">&#128205;</span>
              <input className={`${inp} pl-9`} placeholder="e.g. Connaught Place" value={form.destination} onChange={e => update('destination', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Arrive by</label>
            <input type="time" className={inp} value={form.arrivalDeadline} onChange={e => update('arrivalDeadline', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Leave work at</label>
            <input type="time" className={inp} value={form.returnReadyTime} onChange={e => update('returnReadyTime', e.target.value)} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Daily budget: &#8377;{form.dailyBudgetINR}</label>
          </div>
          <input type="range" min={0} max={500} step={10} value={form.dailyBudgetINR} onChange={e => update('dailyBudgetINR', parseInt(e.target.value))} className="w-full accent-blue-600" />
          <p className="text-xs text-slate-400 mt-1">Round-trip fares combined</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Walking limit per trip: {form.maxWalkMeters} m</label>
          <input type="range" min={0} max={3000} step={100} value={form.maxWalkMeters} onChange={e => update('maxWalkMeters', parseInt(e.target.value))} className="w-full accent-blue-600" />
          <p className="text-xs text-slate-400 mt-1">Max total walking on each journey</p>
        </div>
        <OptimizationPicker value={form.optimizationMode} onChange={m => update('optimizationMode', m)} />
        <button onClick={handleSubmit} disabled={!isFormValid() || loading}
          className="w-full py-4 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-base shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Planning your routes...' : 'Find my routes'}
        </button>
      </div>
      <p className="text-center text-xs text-slate-400 mt-3">Supports all major Delhi areas &mdash; Lajpat Nagar, Sarojini, India Gate, Hauz Khas and more</p>
    </div>
  );
}
