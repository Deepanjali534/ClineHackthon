interface WalkIndicatorProps { meters: number; maxMeters: number; }
export function WalkIndicator({ meters, maxMeters }: WalkIndicatorProps) {
  const ok = meters <= maxMeters;
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
        ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
      }`}>
        Walk: {meters}m {ok ? '\u2713' : `(max ${maxMeters}m)`}
      </span>
    </div>
  );
}
