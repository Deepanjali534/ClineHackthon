interface WalkIndicatorProps {
  meters: number;
  maxMeters: number;
}

export function WalkIndicator({ meters, maxMeters }: WalkIndicatorProps) {
  // pct unused
  const ok = meters <= maxMeters;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>🚶</span>
      <span className={ok ? 'text-green-700' : 'text-red-700'}>
        {meters}m walk
        {!ok && <span className="ml-1 text-xs">(exceeds {maxMeters}m limit)</span>}
      </span>
      {ok && <span className="text-green-600 text-xs">✅</span>}
    </div>
  );
}
