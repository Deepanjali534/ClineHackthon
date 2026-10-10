'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceNotice } from '@/lib/types';
import { submitNotice } from '@/lib/api';

const EXAMPLE = `The 8:15 shuttle tomorrow on Route 615 is cancelled. The 8:45 service will operate as scheduled. Passengers are advised to plan accordingly.`;

interface NoticeFormProps {
  onSubmitted: (notice: ServiceNotice) => void;
}

export function NoticeForm({ onSubmitted }: NoticeFormProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!text.trim()) { setError('Please paste a notice first.'); return; }
    setError('');
    setLoading(true);
    try {
      const notice = await submitNotice(text);
      onSubmitted(notice);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to extract notice. Backend may not be ready yet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">📋 Submit Service Notice</h3>
      <div>
        <Label>Paste raw notice text</Label>
        <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE} className="mt-1 font-mono text-sm" />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button onClick={() => setText(EXAMPLE)}
        className="text-xs text-blue-600 hover:underline">
        Use example notice
      </button>
      <button onClick={handleExtract} disabled={loading}
        className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
        {loading ? '⏳ Extracting with AI...' : '🤖 Extract with AI'}
      </button>
    </div>
  );
}
