'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TripPlan } from '@/lib/types';
import { getTrip } from '@/lib/api';
import { ItineraryView } from '@/components/trip/ItineraryView';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { mockTrip } from '@/lib/mock/mockTrip';
export default function TripDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const isDemo = id === mockTrip.id;
  const [plan, setPlan] = useState<TripPlan | null>(isDemo ? mockTrip : null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isDemo) return;
    let cancelled = false;
    const poll = async () => {
      for (let i = 0; i < 60; i++) {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/trip/${id}`);
          if (!res.ok && res.status === 404) { setError('Trip not found'); setLoading(false); return; }
          if (res.status === 504) { await new Promise(r => setTimeout(r, 2000)); continue; }
          const data = await res.json();
          if (data && data.id) { setPlan(data); setLoading(false); return; }
          await new Promise(r => setTimeout(r, 1500));
        } catch (e: any) {
          setError(e.message); setLoading(false); return;
        }
      }
      setError('Timed out waiting for trip plan.'); setLoading(false);
    };
    poll();
    return () => { cancelled = true; };
  }, [id, isDemo]);
  if (loading) return <LoadingSpinner message="Loading your itinerary..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!plan) return <ErrorState message="Trip not found." />;
  return <ItineraryView plan={plan} />;
}
