'use client';
import { useState } from 'react';
import { ServiceNotice } from '@/lib/types';
import { reviewNotice } from '@/lib/api';
const changeLabel: Record<string,string> = { cancellation:'Cancellation', delay:'Delay', diversion:'Diversion', stop_change:'Stop Change' };
interface Props { notice: ServiceNotice; onReviewed: (id: string, action: 'approve'|'reject') => void; }
export function NoticeReview({ notice, onReviewed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = async (action: 'approve'|'reject') => {
    setLoading(true);
    try { await reviewNotice(notice.id, action); onReviewed(notice.id, action); }
    catch (err: unknown) { setError((err as Error).message); }
    finally { setLoading(false); }
  };
  const d = notice.extractedData;
  return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-4">
      <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest">🤖 AI Extracted Draft</p>
      <div className="space-y-3">
        {[{label:'Affected Route',val:d.affectedRoute,ok:true},{label:'Change Type',val:changeLabel[d.changeType]||d.changeType,ok:true},
          {label:'Date',val:d.effectiveDate,ok:true},{label:'Time',val:d.effectiveTime,ok:true},
          {label:'Replacement',val:d.replacementStop||'None',ok:!!d.replacementStop}].map(r=>(
          <div key={r.label} className="flex items-center gap-3">
            <span className={`text-xs font-bold ${r.ok ? 'text-emerald-400' : 'text-yellow-400'}`}>{r.ok ? '✓' : '&#9888;'}</span>
            <span className="text-xs text-slate-500 uppercase tracking-widest w-32">{r.label}</span>
            <span className="text-sm font-semibold text-white">{r.val}</span>
          </div>
        ))}
        {d.ambiguousFields.length > 0 && <p className="text-xs text-yellow-400 border border-yellow-500/20 bg-yellow-500/5 rounded-lg px-3 py-2">&#9888; Ambiguous: {d.ambiguousFields.join(', ')}</p>}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button onClick={() => handle('approve')} disabled={loading} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50">
          ✓ Approve
        </button>
        <button onClick={() => handle('reject')} disabled={loading} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-50">
          &#10007; Reject
        </button>
      </div>
    </div>
  );
}
