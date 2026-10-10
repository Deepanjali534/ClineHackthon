'use client';
import { OptimizationMode } from '@/lib/types';
interface Props { value: OptimizationMode; onChange: (m: OptimizationMode) => void; }
const modes: { id: OptimizationMode; label: string; sub: string; color: string; selColor: string }[] = [
  { id: 'cheapest',    label: 'Cheapest',    sub: 'Save money',       color: 'text-emerald-600', selColor: 'bg-emerald-50 border-emerald-500 text-emerald-700' },
  { id: 'fastest',     label: 'Fastest',     sub: 'Save time',        color: 'text-blue-600',    selColor: 'bg-blue-50 border-blue-500 text-blue-700' },
  { id: 'least_walk',  label: 'Least walk',  sub: 'Easy on legs',     color: 'text-orange-600',  selColor: 'bg-orange-50 border-orange-500 text-orange-700' },
  { id: 'comfortable', label: 'Comfortable', sub: 'Fewer transfers',  color: 'text-purple-600',  selColor: 'bg-purple-50 border-purple-500 text-purple-700' },
  { id: 'balanced',    label: 'Balanced',    sub: 'AI picks best',    color: 'text-slate-600',   selColor: 'bg-slate-50 border-slate-500 text-slate-700' },
];
export function OptimizationPicker({ value, onChange }: Props) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700 mb-3 block">Optimization mode</label>
      <div className="flex gap-2 flex-wrap">
        {modes.map(m => {
          const sel = value === m.id;
          return (
            <button key={m.id} type="button" onClick={() => onChange(m.id)}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                sel ? m.selColor : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
              <div className="font-bold">{m.label}</div>
              <div className={`text-[10px] mt-0.5 ${sel ? 'opacity-80' : 'text-slate-400'}`}>{m.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
