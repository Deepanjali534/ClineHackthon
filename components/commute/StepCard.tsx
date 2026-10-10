import { JourneyStep } from '@/lib/types';
import { SourceBadge } from '@/components/shared/SourceBadge';

const stepIcon: Record<JourneyStep['type'], string> = {
  walk: '🚶',
  bus: '🚌',
  metro: '🚇',
  auto: '🛺',
  wait: '⏳',
};

interface StepCardProps {
  step: JourneyStep;
  
}

export function StepCard({ step }: StepCardProps) {
  return (
    <div className="flex gap-3 items-start py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm">
        {stepIcon[step.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{step.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>⏱ {step.durationMins} min</span>
          {step.distanceMeters && <span>📍 {step.distanceMeters}m</span>}
          {step.costINR != null && step.costINR > 0 && <span className="text-green-700 font-medium">₹{step.costINR}</span>}
          <SourceBadge type={step.sourceType} />
        </div>
      </div>
    </div>
  );
}
