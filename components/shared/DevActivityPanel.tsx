'use client';

import { useState } from 'react';
import { SSEEvent } from '@/lib/types';

interface DevActivityPanelProps {
  events: SSEEvent[];
  agentRunId?: string;
}

export function DevActivityPanel({ events, agentRunId }: DevActivityPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-600"
        onClick={() => setOpen((o) => !o)}
      >
        <span>🛠️ Developer View</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-gray-200 px-4 py-3 font-mono text-xs text-gray-700 space-y-1">
          {agentRunId && (
            <p className="text-gray-500">Agent Run ID: <span className="text-blue-600">{agentRunId}</span></p>
          )}
          {events.length === 0 && <p className="text-gray-400">No events yet...</p>}
          {events.map((ev, i) => (
            <div key={i} className="flex items-center gap-2">
              {ev.type === 'tool_start' && <span className="text-yellow-500">⏳</span>}
              {ev.type === 'tool_end' && <span className="text-green-500">✅</span>}
              {ev.type === 'error' && <span className="text-red-500">❌</span>}
              {ev.type === 'plan_ready' && <span className="text-blue-500">🎉</span>}
              <span>
                {ev.toolName ? `Tool: ${ev.toolName}` : ev.type}
                {ev.durationMs !== undefined && ` | ${(ev.durationMs / 1000).toFixed(1)}s`}
                {ev.message && ` — ${ev.message}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
