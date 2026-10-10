interface BudgetBarProps {
  spent: number;
  total: number;
}

export function BudgetBar({ spent, total }: BudgetBarProps) {
  const pct = Math.min(100, Math.round((spent / total) * 100));
  const remaining = total - spent;
  const fillClass = pct > 100 ? 'bg-red-500 animate-pulse' : pct > 80 ? 'bg-gradient-to-r from-orange-500 to-yellow-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400';
  const remainColor = pct > 100 ? 'text-red-400' : pct > 80 ? 'text-orange-400' : 'text-emerald-400';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Budget</span>
        <span className="text-xs text-slate-400">₹{spent} <span className="text-slate-600">/ ₹{total}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-xs font-semibold ${remainColor}`}>
        {remaining >= 0 ? `₹${remaining} remaining` : `₹${Math.abs(remaining)} over budget`}
      </p>
    </div>
  );
}
