'use client';
import { OptimizationMode } from '@/lib/types';
interface Props { value: OptimizationMode; onChange: (m: OptimizationMode) => void; }
const modes: { id: OptimizationMode; icon: string; label: string; sub: string; selCls: string }[] = [
  { id: 'cheapest',    icon: '\U0001F4B0', label: 'CHEAPEST',    sub: 'Save every rupee',  selCls: 'from-emerald-900/50 to-emerald-800/20 border-emerald-500' },
  { id: 'fastest',     icon: '\u23F1',     label: 'FASTEST',     sub: 'Get there now',     selCls: 'from-blue-900/50 to-blue-800/20 border-blue-500' },
  { id: 'least_walk',  icon: '\U0001F6B6', label: 'LEAST WALK',  sub: 'Easy on the legs',  selCls: 'from-orange-900/50 to-orange-800/20 border-orange-500' },
  { id: 'comfortable', icon: '\U0001F60C', label: 'COMFORTABLE', sub: 'Fewest transfers',  selCls: 'from-purple-900/50 to-purple-800/20 border-purple-500' },
  { id: 'balanced',    icon: '\u2696',     label: 'BALANCED',    sub: 'Cline picks best',  selCls: 'from-slate-800/50 to-slate-700/20 border-slate-400' },
];
export function OptimizationPicker({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Optimization Mode</p>
      <div className="grid grid-cols-5 gap-2">
        {modes.map(m => {
          const sel = value === m.id;
          return (
            <button key={m.id} type="button" onClick={() => onChange(m.id)}
              className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                sel ? `bg-gradient-to-br ${m.selCls} shadow-lg` : 'bg-[#0d1526] border-[#1e3a5f] hover:border-slate-500/50'}`}>
              {sel && <span className="absolute top-2 right-2 text-[10px] text-white/60">&#10003;</span>}
              <span className="text-2xl mb-2">{m.icon}</span>
              <span className={`text-[10px] font-bold tracking-wider ${sel ? 'text-white' : 'text-slate-400'}`}>{m.label}</span>
              <span className="text-[9px] text-slate-500 text-center mt-0.5">{m.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
