'use client';

import { useState } from 'react';
import { SSEEvent } from '@/lib/types';
import { LiveAlert } from '@/components/shared/LiveAlert';

interface LiveMonitoringBannerProps {
  lastEvent: SSEEvent | null;
  onReplan: (reason: string) => void;
}

export function LiveMonitoringBanner({ lastEvent, onReplan }: LiveMonitoringBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const isAlert = lastEvent?.type === 'alert' && !dismissed;
  const isReplanning = lastEvent?.type === 'replan';

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${isAlert ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${isAlert ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
        {isAlert ? '⚠️ Service Disruption Detected' : '🟢 LIVE — Monitoring your journey'}
        {isReplanning && <span className="ml-2 text-blue-600">🔄 Recalculating...</span>}
      </div>

      {/* Alert card */}
      {isAlert && lastEvent?.message && (
        <LiveAlert
          message={lastEvent.message}
          isReplanning={isReplanning}
          onAccept={() => {
            onReplan('alert');
            setDismissed(true);
          }}
          onIgnore={() => setDismissed(true)}
        />
      )}

      {/* Quick action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onReplan('late')}
          className="flex-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-800 hover:bg-orange-100"
        >
          😰 I am Running Late
        </button>
        <button
          onClick={() => onReplan('missed')}
          className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
        >
          🚌 Missed My Bus
        </button>
      </div>
    </div>
  );
}
