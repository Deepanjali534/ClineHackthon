import { TripDay } from '@/lib/types';

const typeIcon: Record<string, string> = {
  monument: '🏛️',
  restaurant: '🍜',
  activity: '🎯',
  transport: '🚗',
  hotel: '🏨',
};

const timeLabel: Record<string, string> = {
  morning: '🌅 Morning',
  afternoon: '🌞 Afternoon',
  evening: '🌆 Evening',
};

interface DayCardProps {
  day: TripDay;
}

export function DayCard({ day }: DayCardProps) {
  const grouped = day.slots.reduce<Record<string, typeof day.slots>>((acc, slot) => {
    acc[slot.time] = acc[slot.time] || [];
    acc[slot.time].push(slot);
    return acc;
  }, {});

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">DAY {day.day} — {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</h3>
        <span className="text-sm text-gray-500">₹{day.dayTotalCostINR.toLocaleString()}</span>
      </div>
      <p className="text-xs text-gray-500">{day.weatherSummary}</p>

      {(['morning', 'afternoon', 'evening'] as const).map((period) => {
        const slots = grouped[period];
        if (!slots?.length) return null;
        return (
          <div key={period}>
            <p className="text-xs font-semibold text-gray-500 mb-1">{timeLabel[period]}</p>
            <div className="space-y-2">
              {slots.map((slot, i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{typeIcon[slot.type]} {slot.place}</p>
                      <p className="text-xs text-gray-500">{slot.durationMins} mins · ₹{slot.estimatedCostINR}</p>
                      {slot.transport && <p className="text-xs text-blue-600 mt-0.5">🚗 {slot.transport}</p>}
                      {slot.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{slot.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
