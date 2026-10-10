'use client';
import { TripPlan } from '@/lib/types';
import { DayCard } from './DayCard';
import { SourceBadge } from '@/components/shared/SourceBadge';
interface Props { plan: TripPlan; }
export function ItineraryView({ plan }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="col-span-3 space-y-4">
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Budget</p>
              <SourceBadge type="demo" />
            </div>
            <div className="space-y-2 mb-4">
              {plan.days.map(d => (
                <div key={d.day} className="flex justify-between text-sm">
                  <span className="text-slate-400">Day {d.day}</span>
                  <span className="font-medium text-white">₹{d.dayTotalCostINR.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-2 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-emerald-400">₹{plan.totalCostINR.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{width:'45%'}} /></div>
            <p className="text-xs text-slate-500 mt-2">45% of budget used</p>
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied!'); }}
              className="w-full mt-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors">
              Share Itinerary 🔗
            </button>
          </div>
        </div>
        {/* Main */}
        <div className="col-span-9 space-y-6">
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
            <h1 className="text-2xl font-black text-white">✈️ {plan.destination} Itinerary</h1>
            <p className="text-sm text-slate-400 mt-1">{plan.days.length} days · {plan.optimizationMode} mode · ₹{plan.totalCostINR.toLocaleString()} total</p>
            <p className="text-xs text-indigo-400 mt-3 border-l-2 border-indigo-500/50 pl-3">🤖 {plan.explanation}</p>
          </div>
          {plan.days.map(day => <DayCard key={day.day} day={day} />)}
        </div>
      </div>
    </div>
  );
}
