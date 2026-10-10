'use client';

import { useEffect, useRef, useState } from 'react';
import { SSEEvent } from '@/lib/types';

type SSEStatus = 'connecting' | 'connected' | 'closed' | 'error';

export function useSSE(url: string | null) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [status, setStatus] = useState<SSEStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;

    setEvents([]);
    setStatus('connecting');
    setLastEvent(null);

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setStatus('connected');
    };

    es.onmessage = (e) => {
      try {
        const parsed: SSEEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, parsed]);
        setLastEvent(parsed);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      setStatus('error');
      es.close();
    };

    return () => {
      es.close();
      setStatus('closed');
    };
  }, [url]);

  return { events, status, lastEvent };
}
