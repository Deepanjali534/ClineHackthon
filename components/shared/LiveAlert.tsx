'use client';
interface Props { message: string; onAccept: () => void; onIgnore: () => void; isReplanning?: boolean; }
export function LiveAlert({ message, onAccept, onIgnore, isReplanning }: Props) {
  return (
    <div className="animate-slide-down rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-900/60 to-orange-900/60 backdrop-blur-xl p-5 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xl flex-shrink-0">&#9888;&#65039;</div>
        <div className="flex-1">
          <p className="font-bold text-white text-base">{message}</p>
          {isReplanning && <p className="text-sm text-orange-300 mt-1">&#129302; Cline is recalculating your route...</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={onAccept} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 transition-colors">&#10003; Accept New Plan</button>
            <button onClick={onIgnore} className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 text-sm font-medium hover:bg-white/20 transition-colors">Ignore</button>
          </div>
        </div>
      </div>
    </div>
  );
}
