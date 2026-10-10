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
    getTrip(id).then(setPlan).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [id, isDemo]);
  if (loading) return <LoadingSpinner message="Loading your itinerary..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!plan) return <ErrorState message="Trip not found." />;
  return <ItineraryView plan={plan} />;
}
