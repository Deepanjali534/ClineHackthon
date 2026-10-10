import { JourneyStep } from '@/lib/types';
import { SourceBadge } from '@/components/shared/SourceBadge';
const dotColor: Record<JourneyStep['type'], string> = {
  walk: 'bg-orange-400', bus: 'bg-blue-400', metro: 'bg-purple-400', auto: 'bg-yellow-400', wait: 'bg-slate-600',
};
const stepIcon: Record<JourneyStep['type'], string> = {
  walk: '&#128694;', bus: '&#128652;', metro: '&#128647;', auto: '&#128666;', wait: '&#9201;',
};
interface Props { step: JourneyStep; }
export function StepCard({ step }: Props) {
  return (
    <div className="flex gap-3 items-start py-2 pl-1">
      <div className="flex flex-col items-center mt-1">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor[step.type]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200">{step.description}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs text-slate-500">{step.durationMins} min</span>
          {step.distanceMeters && <span className="text-xs text-slate-500">{step.distanceMeters}m</span>}
          {step.costINR != null && step.costINR > 0 && (
            <span className="text-xs font-bold text-emerald-400">&#8377;{step.costINR}</span>
          )}
          <SourceBadge type={step.sourceType} />
        </div>
      </div>
    </div>
  );
}
