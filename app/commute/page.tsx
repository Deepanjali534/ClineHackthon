'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommuteForm } from '@/components/commute/CommuteForm';
import { CommuteRequest } from '@/lib/types';
import { createPlan } from '@/lib/api';
import { mockPlan } from '@/lib/mock/mockPlan';
import { SourceBadge } from '@/components/shared/SourceBadge';

export default function CommutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (request: CommuteRequest) => {
    setLoading(true);
    setError('');
    try {
      const { id } = await createPlan(request);
      router.push(`/commute/thinking/${id}`);
    } catch (err: unknown) {
      // Backend not ready — use demo mode
      console.warn('Backend not available, using demo mode:', (err as Error).message);
      router.push(`/commute/thinking/${mockPlan.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Demo mode banner */}
      <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-800">
        <SourceBadge type="demo" />
        <span>Backend not connected yet — using demo data for Lajpat Nagar → Connaught Place</span>
      </div>

      <CommuteForm onSubmit={handleSubmit} isLoading={loading} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
