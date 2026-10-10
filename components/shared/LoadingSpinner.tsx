interface Props { message?: string; }
export function LoadingSpinner({ message = 'Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" style={{borderTopColor:'#3b82f6',animationDuration:'1s'}} />
        <div className="absolute inset-3 rounded-full border-2 border-transparent animate-spin" style={{borderTopColor:'#06b6d4',animationDuration:'1.5s',animationDirection:'reverse'}} />
        <div className="absolute inset-6 rounded-full border-2 border-transparent animate-spin" style={{borderTopColor:'#8b5cf6',animationDuration:'0.8s'}} />
      </div>
      <p className="text-sm text-slate-400 animate-pulse">{message}</p>
    </div>
  );
}
