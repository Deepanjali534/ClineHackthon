import { JourneyLeg } from '@/lib/types';
import { StepCard } from './StepCard';

interface JourneyTimelineProps {
  leg: JourneyLeg;
  label: string;
  emoji: string;
}

export function JourneyTimeline({ leg, label, emoji }: JourneyTimelineProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{emoji}</span>
        <h3 className="font-semibold text-gray-800">{label}</h3>
        <span className="ml-auto text-sm text-gray-500">{leg.departureTime} → {leg.arrivalTime}</span>
      </div>
      <div className="pl-2 border-l-2 border-blue-200 space-y-1">
        {leg.steps.map((step, i) => (
          <StepCard key={i} step={step} />
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-600">
        <span>💰 ₹{leg.costINR}</span>
        <span>🚶 {leg.walkMeters}m walk</span>
      </div>
    </div>
  );
}
