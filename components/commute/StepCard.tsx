import { JourneyStep } from '@/lib/types';
const modeIcon: Record<string, string> = { walk: '&#128694;', bus: '&#128652;', metro: '&#128647;', auto: '&#128666;', wait: '&#9201;' };
const modeBg: Record<string, string> = { walk: 'bg-slate-100 text-slate-500', bus: 'bg-blue-600 text-white', metro: 'bg-purple-600 text-white', auto: 'bg-orange-500 text-white', wait: 'bg-slate-100 text-slate-400' };
interface Props { step: JourneyStep; time?: string; endTime?: string; }
export function StepCard({ step, time, endTime }: Props) {
  return (
    <div className="flex gap-4 py-2">
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${modeBg[step.type] || modeBg.bus}`}
        dangerouslySetInnerHTML={{__html: modeIcon[step.type] || modeIcon.bus}} />
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{step.description}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
          {time && endTime && <span>{time}&ndash;{endTime}</span>}
          {step.distanceMeters && <span>&middot; {step.distanceMeters} m</span>}
          {step.costINR ? <span className="text-blue-600 font-semibold">&middot; &#8377;{step.costINR}</span> : null}
        </div>
      </div>
    </div>
  );
}
