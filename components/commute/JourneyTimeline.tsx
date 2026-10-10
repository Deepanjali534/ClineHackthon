import { JourneyLeg } from '@/lib/types';
import { StepCard } from './StepCard';
interface Props { leg: JourneyLeg; label: string; emoji: string; }
export function JourneyTimeline({ leg, label, emoji }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{leg.departureTime} → {leg.arrivalTime}</span>
      </div>
      <div className="border-l-2 border-blue-500/20 ml-1.5 space-y-0">
        {leg.steps.map((step, i) => <StepCard key={i} step={step} />)}
      </div>
      <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-emerald-400 font-semibold">₹{leg.costINR}</span>
        <span className="text-xs text-slate-500">{leg.walkMeters}m walk</span>
      </div>
    </div>
  );
}
