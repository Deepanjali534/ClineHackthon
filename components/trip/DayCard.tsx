import { TripDay } from '@/lib/types';
const typeIcon: Record<string,string> = { monument:'&#127963;️', restaurant:'🍴', activity:'🎯', transport:'🚗', hotel:'🏠' };
const timeColors: Record<string,string> = { morning:'text-amber-400 border-amber-500/30 bg-amber-500/10', afternoon:'text-orange-400 border-orange-500/30 bg-orange-500/10', evening:'text-purple-400 border-purple-500/30 bg-purple-500/10' };
interface Props { day: TripDay; }
export function DayCard({ day }: Props) {
  const grouped = day.slots.reduce<Record<string, typeof day.slots>>((a,s) => { a[s.time] = a[s.time]||[]; a[s.time].push(s); return a; }, {});
  return (
    <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-black text-white">{day.day}</div>
          <div>
            <p className="font-bold text-white">{new Date(day.date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})}</p>
            <p className="text-xs text-slate-500">{day.weatherSummary}</p>
          </div>
        </div>
        <span className="text-lg font-black text-white">₹{day.dayTotalCostINR.toLocaleString()}</span>
      </div>
      <div className="p-6 space-y-5">
        {(['morning','afternoon','evening'] as const).map(period => {
          const slots = grouped[period];
          if (!slots?.length) return null;
          return (
            <div key={period}>
              <span className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3 ${timeColors[period]}`}>
                {period === 'morning' ? '☀ Morning' : period === 'afternoon' ? '☀️ Afternoon' : '🌅 Evening'}
              </span>
              <div className="space-y-3 border-l-2 border-white/5 ml-2 pl-4">
                {slots.map((slot,i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white text-sm">{slot.place}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{slot.durationMins} mins · ₹{slot.estimatedCostINR}</p>
                        {slot.transport && <p className="text-xs text-blue-400 mt-1">🚗 {slot.transport}</p>}
                        {slot.notes && <p className="text-xs text-slate-600 mt-1 italic">{slot.notes}</p>}
                      </div>
                      <span className="text-lg flex-shrink-0">{typeIcon[slot.type]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
