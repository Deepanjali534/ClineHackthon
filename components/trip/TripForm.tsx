'use client';
import { useState } from 'react';
import { OptimizationPicker } from '@/components/shared/OptimizationPicker';
import { TripRequest, OptimizationMode } from '@/lib/types';

const INTERESTS = [
  { id:'history', label:'History', color:'border-amber-500/40 text-amber-400 bg-amber-500/5 data-[sel=true]:bg-amber-500/20' },
  { id:'food', label:'Food', color:'border-orange-500/40 text-orange-400 bg-orange-500/5 data-[sel=true]:bg-orange-500/20' },
  { id:'nature', label:'Nature', color:'border-emerald-500/40 text-emerald-400 bg-emerald-500/5 data-[sel=true]:bg-emerald-500/20' },
  { id:'shopping', label:'Shopping', color:'border-pink-500/40 text-pink-400 bg-pink-500/5 data-[sel=true]:bg-pink-500/20' },
  { id:'adventure', label:'Adventure', color:'border-red-500/40 text-red-400 bg-red-500/5 data-[sel=true]:bg-red-500/20' },
  { id:'culture', label:'Culture', color:'border-purple-500/40 text-purple-400 bg-purple-500/5 data-[sel=true]:bg-purple-500/20' },
  { id:'relaxation', label:'Relaxation', color:'border-cyan-500/40 text-cyan-400 bg-cyan-500/5 data-[sel=true]:bg-cyan-500/20' },
];

const inputCls = 'w-full bg-[#060d1a] border border-[#1e3a5f] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600';
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5';

interface Props { onSubmit: (req: TripRequest) => void; isLoading?: boolean; }

export function TripForm({ onSubmit, isLoading }: Props) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(8000);
  const [interests, setInterests] = useState<string[]>([]);
  const [mode, setMode] = useState<OptimizationMode>('balanced');
  const toggle = (id: string) => setInterests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const valid = destination.trim() && startDate && endDate && interests.length > 0;
  return (
    <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-bold text-white">Plan Your Trip</h2>
        <p className="text-xs text-slate-500 mt-1">AI-crafted day-wise itinerary</p>
      </div>
      <div className="p-6 space-y-5">
        <div><label className={labelCls}>Destination</label><input className={inputCls} placeholder="Jaipur, Manali, Goa..." value={destination} onChange={e => setDestination(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Start Date</label><input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
          <div><label className={labelCls}>End Date</label><input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        </div>
        <div>
          <div className="flex justify-between mb-1.5"><label className={labelCls}>Total Budget</label><span className="text-xs font-black text-white">&#8377;{budget.toLocaleString()}</span></div>
          <input type="range" min={1000} max={50000} step={500} value={budget} onChange={e => setBudget(parseInt(e.target.value))} className="w-full accent-blue-500" />
          <div className="flex justify-between text-xs text-slate-600 mt-1"><span>&#8377;1,000</span><span>&#8377;50,000</span></div>
        </div>
        <div>
          <label className={labelCls}>Interests</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {INTERESTS.map(i => {
              const sel = interests.includes(i.id);
              return (
                <button key={i.id} type="button" onClick={() => toggle(i.id)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${i.color} ${sel ? 'ring-1 ring-current' : ''}`}>
                  {sel ? '✓ ' : ''}{i.label}
                </button>
              );
            })}
          </div>
        </div>
        <OptimizationPicker value={mode} onChange={setMode} />
        <button disabled={!valid || isLoading}
          onClick={() => valid && onSubmit({ destination, startDate, endDate, totalBudgetINR: budget, interests, optimizationMode: mode })}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {isLoading ? 'Planning...' : 'Plan My Trip →'}
        </button>
      </div>
    </div>
  );
}
