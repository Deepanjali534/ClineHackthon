'use client';

import { TripPlan } from '@/lib/types';
import { DayCard } from './DayCard';
import { SourceBadge } from '@/components/shared/SourceBadge';

interface ItineraryViewProps {
  plan: TripPlan;
}

export function ItineraryView({ plan }: ItineraryViewProps) {
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-indigo-900">✈️ {plan.destination} Itinerary</h2>
            <p className="text-sm text-indigo-700 mt-1">{plan.days.length} days · {plan.optimizationMode} mode</p>
          </div>
          <SourceBadge type="demo" />
        </div>
        <div className="mt-3 flex gap-4 text-sm text-indigo-800">
          <span>💰 Total: ₹{plan.totalCostINR.toLocaleString()}</span>
        </div>
        <div className="mt-3 rounded-lg bg-white/60 p-3">
          <p className="text-xs text-indigo-700">🤖 {plan.explanation}</p>
        </div>
      </div>

      {/* Budget sidebar summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold text-gray-700 mb-3">💰 Budget Breakdown</h3>
        <div className="space-y-1.5">
          {plan.days.map((d) => (
            <div key={d.day} className="flex justify-between text-sm">
              <span className="text-gray-600">Day {d.day}</span>
              <span className="font-medium">₹{d.dayTotalCostINR.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="text-green-700">₹{plan.totalCostINR.toLocaleString()} ✅</span>
          </div>
        </div>
      </div>

      {/* Day cards */}
      {plan.days.map((day) => (
        <DayCard key={day.day} day={day} />
      ))}

      <button onClick={handleShare}
        className="w-full rounded-xl border border-indigo-300 bg-indigo-50 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
        🔗 Share Itinerary
      </button>
    </div>
  );
}
