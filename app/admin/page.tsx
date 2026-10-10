'use client';
import { useState } from 'react';
import { ServiceNotice } from '@/lib/types';
import { submitNotice, reviewNotice } from '@/lib/api';

export default function AdminPage() {
  const [text, setText] = useState('');
  const [pending, setPending] = useState<ServiceNotice | null>(null);
  const [notices, setNotices] = useState<ServiceNotice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!text.trim()) { setError('Please paste a notice first.'); return; }
    setError(''); setLoading(true);
    try { setPending(await submitNotice(text)); }
    catch (e: unknown) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const handleReview = async (action: 'approve'|'reject') => {
    if (!pending) return;
    try {
      await reviewNotice(pending.id, action);
      setNotices(p => [{ ...pending, status: action === 'approve' ? 'approved' : 'rejected' } as ServiceNotice, ...p]);
      setPending(null); setText('');
    } catch (e: unknown) { setError((e as Error).message); }
  };

  const EXAMPLE = 'The 8:15 shuttle tomorrow on Route 615 is cancelled. The 8:45 service will operate as scheduled.';

  if (!pending && notices.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl mx-auto mb-4">&#10003;</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">No active disruptions</h2>
        <p className="text-slate-500 text-sm mb-8">Verified service notices appear here and trigger automatic replanning.</p>
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left mb-4">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Paste a service notice</label>
          <textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder={EXAMPLE}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400 mb-3" />
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setText(EXAMPLE)} className="text-sm text-blue-600 hover:underline">Use example</button>
            <button onClick={handleExtract} disabled={loading}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? 'Extracting...' : '&#129302; Simulate demo disruption'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Disruption centre</h1>
        <p className="text-slate-500 text-sm mt-1">Review and approve service notices</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Submit */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Submit notice</h3>
          <textarea rows={5} value={text} onChange={e => setText(e.target.value)} placeholder={EXAMPLE}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400 mb-3" />
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
          <button onClick={handleExtract} disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-sm shadow-md disabled:opacity-50">
            {loading ? 'Extracting...' : 'Extract with AI'}
          </button>
        </div>

        {/* Review */}
        {pending ? (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">AI extracted draft</h3>
            <div className="space-y-2 mb-6">
              {[
                {label:'Route', val:pending.extractedData.affectedRoute},
                {label:'Type', val:pending.extractedData.changeType},
                {label:'Date', val:pending.extractedData.effectiveDate},
                {label:'Time', val:pending.extractedData.effectiveTime},
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{r.label}</span>
                  <span className="font-semibold text-slate-800">{r.val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleReview('approve')}
                className="flex-1 py-2.5 rounded-full bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors">
                &#10003; Approve
              </button>
              <button onClick={() => handleReview('reject')}
                className="flex-1 py-2.5 rounded-full border border-red-300 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors">
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center p-12">
            <p className="text-sm text-slate-400 text-center">Submit a notice to see AI extraction here</p>
          </div>
        )}
      </div>

      {/* Approved notices */}
      {notices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Processed notices</h3>
          <div className="space-y-2">
            {notices.map(n => (
              <div key={n.id} className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-700">Route {n.extractedData.affectedRoute} &middot; {n.extractedData.changeType}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  n.status==='approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {n.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
