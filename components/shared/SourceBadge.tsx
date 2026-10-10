
type SourceType = 'live' | 'scheduled' | 'estimated' | 'demo' | 'unverified';

interface SourceBadgeProps {
  type: SourceType;
  className?: string;
}

const config: Record<SourceType, { label: string; icon: string; className: string }> = {
  live: { label: 'Live', icon: '🟢', className: 'bg-green-100 text-green-800 border-green-300' },
  scheduled: { label: 'Scheduled', icon: '🔵', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  estimated: { label: 'Estimated', icon: '🟡', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  demo: { label: 'Demo Data', icon: '🟠', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  unverified: { label: 'Unverified', icon: '🔴', className: 'bg-red-100 text-red-800 border-red-300' },
};

export function SourceBadge({ type, className = '' }: SourceBadgeProps) {
  const { label, icon, className: badgeClass } = config[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass} ${className}`}
    >
      {icon} {label}
    </span>
  );
}
