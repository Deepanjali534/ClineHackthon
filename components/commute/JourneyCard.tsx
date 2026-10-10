import { JourneyPlan } from '@/lib/types';
import { StepCard } from './StepCard';

const modeColors: Record<string,string> = { cheapest:'bg-emerald-100 text-emerald-700', fastest:'bg-blue-100 text-blue-700', least_walk:'bg-orange-100 text-orange-700', comfortable:'bg-purple-100 text-purple-700', balanced:'bg-slate-100 text-slate-700' };

interface Props { plan: JourneyPlan; budget: number; maxWalk: number; onNavigate?: () => void; onSave?: () => void; onViewBackup?: () => void; isHighlighted?: boolean; }

export function JourneyCard({ plan, budget, maxWalk, onNavigate, onSave, onViewBackup }: Props) {
  const chipCls = 'px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold';

  const LegSection = ({ leg, label }: { leg: typeof plan.outbound, label: string }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black text-slate-900">{leg.departureTime}</span>
        <span className="text-slate-400 text-lg">&rarr;</span>
        <span className="text-3xl font-black text-slate-900">{leg.arrivalTime}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={chipCls}>{leg.steps.reduce((a,s) => a + s.durationMins, 0)} min</span>
        <span className={chipCls}>{leg.walkMeters} m walk</span>
        <span className={chipCls}>0 transfers</span>
        <span className={chipCls}>&#8377;{leg.costINR}</span>
      </div>
      {/* Timeline */}
      <div className="border-l-2 border-blue-100 ml-3 pl-4 space-y-1">
        {leg.steps.map((step, i) => <StepCard key={i} step={step} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Your routes</h2>
          <p className="text-sm text-slate-500">{plan.outbound.departureTime} departure &rarr; arrives {plan.outbound.arrivalTime}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${modeColors[plan.optimizationMode] || modeColors.balanced}`}>
            {plan.optimizationMode.replace('_',' ').toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            plan.meetsDeadline && plan.meetsBudget ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {plan.meetsDeadline && plan.meetsBudget ? 'All constraints met' : 'Some constraints missed'}
          </span>
        </div>
      </div>

      <LegSection leg={plan.outbound} label="Outbound" />
      <LegSection leg={plan.returnLeg} label="Return" />

      {/* AI Explanation */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">&#129302; AI Explanation</p>
        <p className="text-sm text-slate-700">{plan.explanation}</p>
      </div>

      {/* Constraint check */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm">
        <p className="text-sm font-bold text-slate-700 mb-3">Constraint check</p>
        <div className="space-y-2">
          {[
            { label: 'Arrival deadline satisfied', ok: plan.meetsDeadline },
            { label: 'Walking limit satisfied', ok: plan.meetsWalkLimit },
            { label: 'Daily budget satisfied', ok: plan.meetsBudget },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-2 text-sm">
              <span className={c.ok ? 'text-emerald-500' : 'text-red-500'}>{c.ok ? '&#9989;' : '&#10060;'}</span>
              <span className={c.ok ? 'text-slate-700' : 'text-red-600'}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onNavigate && (
          <button onClick={onNavigate}
            className="flex-1 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md">
            View full route
          </button>
        )}
        {onSave && (
          <button onClick={onSave}
            className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Save
          </button>
        )}
        {onViewBackup && (
          <button onClick={onViewBackup}
            className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Backup options
          </button>
        )}
      </div>
    </div>
  );
}
