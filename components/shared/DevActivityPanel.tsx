'use client';
import { useState } from 'react';
import { SSEEvent } from '@/lib/types';
interface Props { events: SSEEvent[]; agentRunId?: string; }
export function DevActivityPanel({ events, agentRunId }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 bg-black/30 text-xs text-slate-500 hover:text-slate-300 transition-colors">
        <span className="font-mono">&#128295; Developer View</span>
        <span>{open ? '&#9650;' : '&#9660;'}</span>
      </button>
      {open && (
        <div className="bg-black/50 px-4 py-3 font-mono text-xs text-emerald-400 space-y-1 max-h-48 overflow-y-auto">
          {agentRunId && <p className="text-slate-600">Run ID: <span className="text-blue-400">{agentRunId}</span></p>}
          {events.length === 0 && <p className="text-slate-600">No events yet...</p>}
          {events.map((ev, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-600">{ev.type === 'tool_end' ? '&#10003;' : ev.type === 'error' ? '&#10007;' : ev.type === 'plan_ready' ? '&#9733;' : '&#8250;'}</span>
              <span className="text-slate-400">{ev.toolName || ev.type}</span>
              {ev.durationMs !== undefined && <span className="text-slate-600">{(ev.durationMs/1000).toFixed(1)}s</span>}
              {ev.message && <span className="text-slate-500 truncate">&#8212; {ev.message}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
