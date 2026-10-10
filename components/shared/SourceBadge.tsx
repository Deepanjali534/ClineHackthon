type SourceType = 'live' | 'scheduled' | 'estimated' | 'demo' | 'unverified';

interface SourceBadgeProps {
  type: SourceType;
  className?: string;
}

const config: Record<SourceType, { label: string; dot: string; className: string }> = {
  live:       { label: 'Live',       dot: 'bg-emerald-400', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  scheduled:  { label: 'Scheduled',  dot: 'bg-blue-400',    className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  estimated:  { label: 'Estimated',  dot: 'bg-yellow-400',  className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  demo:       { label: 'Demo Data',  dot: 'bg-orange-400',  className: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  unverified: { label: 'Unverified', dot: 'bg-red-400',     className: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

export function SourceBadge({ type, className = '' }: SourceBadgeProps) {
  const { label, dot, className: badgeClass } = config[type];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${type === 'live' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}
