type T = 'live'|'scheduled'|'estimated'|'demo'|'unverified';
interface Props { type: T; className?: string; }
const cfg: Record<T,{label:string;cls:string}> = {
  live:       {label:'Live',       cls:'bg-emerald-50 text-emerald-700 border-emerald-200'},
  scheduled:  {label:'Scheduled',  cls:'bg-blue-50 text-blue-700 border-blue-200'},
  estimated:  {label:'Estimated',  cls:'bg-yellow-50 text-yellow-700 border-yellow-200'},
  demo:       {label:'Demo Data',  cls:'bg-orange-50 text-orange-700 border-orange-200'},
  unverified: {label:'Unverified', cls:'bg-red-50 text-red-700 border-red-200'},
};
export function SourceBadge({ type, className='' }: Props) {
  const {label,cls} = cfg[type];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${cls} ${className}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />{label}
  </span>;
}
