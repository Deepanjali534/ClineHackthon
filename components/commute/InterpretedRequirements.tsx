'use client';
import { CommuteRequest } from '@/lib/types';
interface Props { interpreted: Partial<CommuteRequest>; onConfirm: () => void; onEdit: (field: keyof CommuteRequest, value: string) => void; }
const inputCls = 'flex-1 bg-[#060d1a] border border-[#1e3a5f] text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500 transition-all';
export function InterpretedRequirements({ interpreted, onConfirm, onEdit }: Props) {
  const fields: { key: keyof CommuteRequest; label: string; confident: boolean }[] = [
    { key: 'origin', label: 'From', confident: !!interpreted.origin },
    { key: 'destination', label: 'To', confident: !!interpreted.destination },
    { key: 'arrivalDeadline', label: 'Arrive by', confident: !!interpreted.arrivalDeadline },
    { key: 'returnReadyTime', label: 'Return after', confident: !!interpreted.returnReadyTime },
    { key: 'dailyBudgetINR', label: 'Budget (&#8377;)', confident: !!interpreted.dailyBudgetINR },
    { key: 'maxWalkMeters', label: 'Max walk', confident: !!interpreted.maxWalkMeters },
  ];
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">&#129302; Interpreted as:</p>
      <div className="space-y-2">
        {fields.map(f => (
          <div key={f.key as string} className="flex items-center gap-2">
            <span className={`text-xs ${f.confident ? 'text-emerald-400' : 'text-yellow-400'}`}>{f.confident ? '&#10003;' : '&#9888;'}</span>
            <span className="text-xs text-slate-500 w-24">{f.label}:</span>
            <input className={inputCls} defaultValue={interpreted[f.key] !== undefined ? String(interpreted[f.key]) : ''}
              onBlur={e => onEdit(f.key, e.target.value)} />
          </div>
        ))}
      </div>
      <button onClick={onConfirm} className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors">
        Confirm and Plan Journey
      </button>
    </div>
  );
}
