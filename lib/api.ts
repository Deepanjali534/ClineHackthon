import { CommuteRequest, JourneyPlan, ServiceNotice, TripPlan, TripRequest } from '@/lib/types';

const BASE = '';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createPlan(request: CommuteRequest): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/api/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<{ id: string }>(res);
}

export async function getPlan(id: string): Promise<JourneyPlan> {
  const res = await fetch(`${BASE}/api/plan/${id}`);
  // Backend returns { plan: JourneyPlan, request, versions, ... }
  // We need to extract the plan field
  const data = await handleResponse<{ plan: JourneyPlan } & JourneyPlan>(res);
  return data.plan ?? data;
}

export async function submitNotice(rawText: string): Promise<ServiceNotice> {
  const res = await fetch(`${BASE}/api/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText }),
  });
  return handleResponse<ServiceNotice>(res);
}

export async function reviewNotice(
  id: string,
  action: 'approve' | 'reject'
): Promise<void> {
  const res = await fetch(`${BASE}/api/notices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`API error ${res.status}: ${text}`);
  }
}

export async function triggerReplan(
  planId: string,
  reason: string
): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/api/replan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, reason }),
  });
  return handleResponse<{ id: string }>(res);
}

export async function createTrip(request: TripRequest): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/api/trip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return handleResponse<{ id: string }>(res);
}

export async function getTrip(id: string): Promise<TripPlan> {
  const res = await fetch(`${BASE}/api/trip/${id}`);
  return handleResponse<TripPlan>(res);
}
