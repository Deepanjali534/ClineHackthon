'use client';

import { ServiceNotice } from '@/lib/types';
import { reviewNotice } from '@/lib/api';
import { useState } from 'react';

interface NoticeReviewProps {
  notice: ServiceNotice;
  onReviewed: (id: string, action: 'approve' | 'reject') => void;
}

const changeTypeLabel: Record<string, string> = {
  cancellation: '❌ Cancellation',
  delay: '⏱️ Delay',
  diversion: '↩️ Diversion',
  stop_change: '📍 Stop Change',
};

export function NoticeReview({ notice, onReviewed }: NoticeReviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      await reviewNotice(notice.id, action);
      onReviewed(notice.id, action);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const d = notice.extractedData;

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 space-y-3">
      <h3 className="font-semibold text-purple-900">🤖 AI Extracted Draft</h3>
      <div className="space-y-2">
        {[
          { label: 'Affected Route', value: d.affectedRoute, ok: true },
          { label: 'Change Type', value: changeTypeLabel[d.changeType] || d.changeType, ok: true },
          { label: 'Date', value: d.effectiveDate, ok: true },
          { label: 'Time', value: d.effectiveTime, ok: true },
          { label: 'Replacement', value: d.replacementStop || '—', ok: !!d.replacementStop },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2 text-sm">
            <span className={row.ok ? 'text-green-600' : 'text-yellow-600'}>{row.ok ? '✅' : '⚠️'}</span>
            <span className="w-36 font-medium text-gray-700">{row.label}:</span>
            <span className="text-gray-800">{row.value}</span>
          </div>
        ))}
        {d.ambiguousFields.length > 0 && (
          <p className="text-xs text-yellow-700 mt-1">
            ⚠️ Ambiguous fields: {d.ambiguousFields.join(', ')}
          </p>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-3 pt-1">
        <button onClick={() => handle('approve')} disabled={loading}
          className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
          ✅ Approve
        </button>
        <button onClick={() => handle('reject')} disabled={loading}
          className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
          ❌ Reject
        </button>
      </div>
    </div>
  );
}
