'use client';
import { useState } from 'react';
import { ServiceNotice } from '@/lib/types';
import { submitNotice } from '@/lib/api';
const EXAMPLE = 'The 8:15 shuttle tomorrow on Route 615 is cancelled. The 8:45 service will operate as scheduled. Passengers are advised to plan accordingly.';
interface Props { onSubmitted: (n: ServiceNotice) => void; }
export function NoticeForm({ onSubmitted }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handle = async () => {
    if (!text.trim()) { setError('Paste a notice first.'); return; }
    setError(''); setLoading(true);
    try { onSubmitted(await submitNotice(text)); }
    catch (err: unknown) { setError((err as Error).message || 'Failed to extract. Backend may not be ready.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] p-6 space-y-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Submit Notice</p>
      <textarea rows={8} value={text} onChange={e => setText(e.target.value)} placeholder={EXAMPLE}
        className="w-full bg-[#060d1a] border border-[#1e3a5f] text-white rounded-xl px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-700" />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button onClick={() => setText(EXAMPLE)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Use example notice</button>
      <button onClick={handle} disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50">
        {loading ? 'Extracting...' : '🤖 Extract with AI'}
      </button>
    </div>
  );
}
