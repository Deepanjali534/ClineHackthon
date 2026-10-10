'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlan } from '@/lib/api';
import { mockPlan } from '@/lib/mock/mockPlan';
import { OptimizationMode } from '@/lib/types';
import { useCommuteForm } from '@/lib/hooks/useCommuteForm';

const MODES: {id: OptimizationMode; label: string; icon: string}[] = [
  {id:'cheapest',    label:'Cheapest',    icon:'💰'},
  {id:'fastest',     label:'Fastest',     icon:'⚡'},
  {id:'least_walk',  label:'Least walk',  icon:'🚶'},
  {id:'comfortable', label:'Comfortable', icon:'😌'},
  {id:'balanced',    label:'Balanced',    icon:'⚖️'},
];

export default function CommutePage() {
  const router = useRouter();
  const { form, update, isFormValid, toRequest } = useCommuteForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try { const {id} = await createPlan(toRequest()); router.push(`/commute/thinking/${id}`); }
    catch { router.push(`/commute/thinking/${mockPlan.id}`); }
    finally { setLoading(false); }
  };

  const inp = 'w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">Plan Your Journey</h1>
        <p className="text-slate-500 text-sm mt-1">Find the best route with real-time data, budget control and AI recommendations.</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 bg-blue-600 text-white rounded-2xl px-5 py-3 cursor-default">
          <span className="text-xl">🚌</span>
          <div><div className="text-sm font-bold">Daily Commute</div><div className="text-xs text-blue-200">Work, College, Daily Travel</div></div>
        </div>
        <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors">
          <span className="text-xl">✈️</span>
          <div><div className="text-sm font-bold text-slate-700">Custom Trip</div><div className="text-xs text-slate-400">Multiple destinations</div></div>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-5">
        {/* Origin / Dest */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Origin</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-base">📍</span>
              <input className={inp} placeholder="Lajpat Nagar, Delhi"
                value={form.origin} onChange={e => update('origin', e.target.value)} />
              {form.origin && <button onClick={() => update('origin','')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">&times;</button>}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Destination</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-base">📍</span>
              <input className={inp} placeholder="Connaught Place, Delhi"
                value={form.destination} onChange={e => update('destination', e.target.value)} />
              {form.destination && <button onClick={() => update('destination','')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">&times;</button>}
            </div>
          </div>
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Arrive by</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⏰</span>
              <input type="time" className={inp} value={form.arrivalDeadline} onChange={e => update('arrivalDeadline', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Leave work at</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⏰</span>
              <input type="time" className={inp} value={form.returnReadyTime} onChange={e => update('returnReadyTime', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Budget */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Daily budget: &#8377;{form.dailyBudgetINR}</label>
            <span className="text-xs text-slate-400">&nbsp;</span>
          </div>
          <input type="range" min={0} max={500} step={10} value={form.dailyBudgetINR}
            onChange={e => update('dailyBudgetINR', parseInt(e.target.value))}
            className="w-full accent-blue-600 h-1.5" />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>&#8377;0</span><span>&#8377;500</span></div>
        </div>

        {/* Walk */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Walking limit per trip: {form.maxWalkMeters} m</label>
          </div>
          <input type="range" min={0} max={2000} step={100} value={form.maxWalkMeters}
            onChange={e => update('maxWalkMeters', parseInt(e.target.value))}
            className="w-full accent-blue-600 h-1.5" />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>0 m</span><span>2 km</span></div>
        </div>

        {/* Optimization mode */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-3 block">Optimization mode</label>
          <div className="flex gap-2">
            {MODES.map(m => {
              const sel = form.optimizationMode === m.id;
              return (
                <button key={m.id} type="button" onClick={() => update('optimizationMode', m.id)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all text-xs font-semibold gap-1 ${
                    sel ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                  <span className="text-lg">{m.icon}</span>
                  <span className="font-bold">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!isFormValid() || loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-base shadow-md hover:shadow-xl hover:from-blue-800 hover:to-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <span>&#128269;</span>
          {loading ? 'Finding your route...' : 'Find Best Route'}
        </button>
      </div>
    </div>
  );
}
