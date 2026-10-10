import { JourneyPlan } from '@/lib/types';
import { JourneyTimeline } from './JourneyTimeline';
import { BudgetBar } from '@/components/shared/BudgetBar';
import { WalkIndicator } from '@/components/shared/WalkIndicator';
import { SourceBadge } from '@/components/shared/SourceBadge';

const modeLabel: Record<string,string> = {
  cheapest:'&#x1F4B0; CHEAPEST', fastest:'&#x23F1; FASTEST', least_walk:'&#x1F6B6; LEAST WALK',
  comfortable:'&#x1F60C; COMFORTABLE', balanced:'&#x2696; BALANCED',
};
const modeBadge: Record<string,string> = {
  cheapest:'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  fastest:'bg-blue-500/10 text-blue-400 border-blue-500/30',
  least_walk:'bg-orange-500/10 text-orange-400 border-orange-500/30',
  comfortable:'bg-purple-500/10 text-purple-400 border-purple-500/30',
  balanced:'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

interface Props {
  plan: JourneyPlan; budget: number; maxWalk: number;
  isHighlighted?: boolean; onNavigate?: () => void; onSave?: () => void; onViewBackup?: () => void;
}

export function JourneyCard({ plan, budget, maxWalk, isHighlighted, onNavigate, onSave, onViewBackup }: Props) {
  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 card-hover ${
      isHighlighted ? 'border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 'border-[#1e3a5f]'}`}>
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400" />
      <div className="bg-[#0d1526] p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isHighlighted && <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">✓ RECOMMENDED</span>}
            <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${modeBadge[plan.optimizationMode]}`}>
              {modeLabel[plan.optimizationMode]}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">₹{plan.totalCostINR}</div>
            <div className="text-xs text-slate-500">Score: {plan.optimizationScore}/100</div>
          </div>
        </div>

        {/* Constraint badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${plan.meetsDeadline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {plan.meetsDeadline ? '✓' : '&#10007;'} Deadline
          </span>
          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${plan.meetsBudget ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {plan.meetsBudget ? '✓' : '&#10007;'} Budget
          </span>
          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${plan.meetsWalkLimit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
            {plan.meetsWalkLimit ? '✓' : '&#9888;'} Walk
          </span>
        </div>

        {/* Two-col legs */}
        <div className="grid grid-cols-2 gap-6">
          <JourneyTimeline leg={plan.outbound} label="OUTBOUND" emoji="🌅" />
          <JourneyTimeline leg={plan.returnLeg} label="RETURN" emoji="&#127750;" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <BudgetBar spent={plan.totalCostINR} total={budget} />
          <WalkIndicator meters={plan.totalWalkMeters} maxMeters={maxWalk} />
        </div>

        {/* Weather */}
        <p className="text-sm text-slate-400">{plan.weatherSummary}</p>

        {/* AI explanation */}
        <div className="border-l-2 border-purple-500/50 pl-4">
          <p className="text-xs text-slate-400 italic">
            <span className="text-purple-400 font-semibold not-italic">🤖 Cline: </span>
            {plan.explanation}
          </p>
        </div>

        {/* Data source */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-600">Data:</span>
          <SourceBadge type="demo" />
          <SourceBadge type="scheduled" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onNavigate && (
            <button onClick={onNavigate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
              Navigate →
            </button>
          )}
          {onSave && (
            <button onClick={onSave} className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all">
              Save
            </button>
          )}
          {plan.backup && onViewBackup && (
            <button onClick={onViewBackup} className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-medium hover:bg-white/10 transition-all">
              Backup &#9660;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
