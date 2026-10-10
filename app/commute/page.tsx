'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommuteForm } from '@/components/commute/CommuteForm';
import { CommuteRequest } from '@/lib/types';
import { createPlan } from '@/lib/api';
import { mockPlan } from '@/lib/mock/mockPlan';
import { SourceBadge } from '@/components/shared/SourceBadge';
export default function CommutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-12 gap-8">
        {/* Left: Form */}
        <div className="col-span-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <SourceBadge type="demo" />
            <span className="text-xs text-slate-500">Backend not connected — using demo data</span>
          </div>
          <CommuteForm isLoading={loading} onSubmit={async (req: CommuteRequest) => {
            setLoading(true);
            try { const { id } = await createPlan(req); router.push(`/commute/thinking/${id}`); }
            catch { router.push(`/commute/thinking/${mockPlan.id}`); }
            finally { setLoading(false); }
          }} />
        </div>
        {/* Right: Info panel */}
        <div className="col-span-7 space-y-5">
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">How It Works</p>
            <div className="space-y-4">
              {[{n:'1',t:'Describe Your Journey',d:'Fill the form or type naturally — AI understands both'},
                {n:'2',t:'AI Plans in Real-Time',d:'Cline SDK evaluates routes, weather, fares, and your constraints'},
                {n:'3',t:'Monitor Live',d:'Get alerts if disruptions occur — AI replans automatically'}].map(s => (
                <div key={s.n} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-black flex-shrink-0">{s.n}</div>
                  <div><p className="text-sm font-semibold text-white">{s.t}</p><p className="text-xs text-slate-500 mt-0.5">{s.d}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Quick Demo</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Route</span><span className="text-white font-medium">Lajpat Nagar &#8594; CP</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Bus 615</span><span className="text-emerald-400 font-medium">On Time &#10003;</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Depart</span><span className="text-white font-medium">08:00</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Arrive</span><span className="text-white font-medium">08:52 (8 min early)</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Fare</span><span className="text-white font-medium">&#8377;30</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Weather</span><span className="text-yellow-400">&#9728;&#65039; Clear 28&#176;C</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" /></span>
            <p className="text-xs text-cyan-400">Live disruption monitoring active for Delhi corridor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
