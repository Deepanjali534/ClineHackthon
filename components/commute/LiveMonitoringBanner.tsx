'use client';
import { useState } from 'react';
import { SSEEvent } from '@/lib/types';
import { LiveAlert } from '@/components/shared/LiveAlert';
interface Props { lastEvent: SSEEvent | null; onReplan: (reason: string) => void; }
export function LiveMonitoringBanner({ lastEvent, onReplan }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const isAlert = lastEvent?.type === 'alert' && !dismissed;
  const isReplanning = lastEvent?.type === 'replan';
  return (
    <div className="space-y-3">
      <div className={`flex items-center justify-between rounded-2xl px-5 py-3 border ${
        isAlert ? 'bg-red-900/30 border-red-500/30' : 'bg-emerald-900/20 border-emerald-500/20'}`}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAlert ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAlert ? 'bg-red-400' : 'bg-emerald-400'}`} />
          </span>
          <span className="text-xs font-bold tracking-widest uppercase text-white">{isAlert ? 'DISRUPTION DETECTED' : 'LIVE MONITORING'}</span>
          {isReplanning && <span className="text-xs text-blue-400 animate-pulse">Recalculating...</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => onReplan('late')} className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold hover:bg-orange-500/20 transition-colors">
            Running Late
          </button>
          <button onClick={() => onReplan('missed')} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors">
            Missed Bus
          </button>
        </div>
      </div>
      {isAlert && lastEvent?.message && (
        <LiveAlert message={lastEvent.message} isReplanning={isReplanning}
          onAccept={() => { onReplan('alert'); setDismissed(true); }}
          onIgnore={() => setDismissed(true)} />
      )}
    </div>
  );
}
