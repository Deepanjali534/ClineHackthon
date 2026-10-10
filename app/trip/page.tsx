'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TripForm } from '@/components/trip/TripForm';
import { TripRequest } from '@/lib/types';
import { createTrip } from '@/lib/api';
import { mockTrip } from '@/lib/mock/mockTrip';
import { SourceBadge } from '@/components/shared/SourceBadge';

export default function TripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (req: TripRequest) => {
    setLoading(true);
    try {
      const { id } = await createTrip(req);
      router.push(`/trip/${id}`);
    } catch {
      // Demo fallback
      router.push(`/trip/${mockTrip.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-800">
        <SourceBadge type="demo" />
        <span>Trip Planner — demo mode. Try &quot;Jaipur&quot; as destination!</span>
      </div>
      <TripForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
