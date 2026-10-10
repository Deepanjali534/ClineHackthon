// Real-time disruption monitoring via free RSS/news feeds
import { getDb } from './db';

interface DisruptionEvent {
  title: string;
  description: string;
  affectedRoutes: string[];
  severity: 'low' | 'medium' | 'high';
  source: string;
  detectedAt: string;
}

const DELHI_RSS_FEEDS = [
  'https://timesofindia.indiatimes.com/rssfeeds/2647163.cms', // Delhi news
  'https://feeds.feedburner.com/ndtv/delhi',
];

const DISRUPTION_KEYWORDS = ['protest', 'agitation', 'bandh', 'strike', 'blocked', 'closed', 'accident', 'flood', 'waterlogging', 'traffic', 'jam', 'diverted'];

const ROUTE_KEYWORDS: Record<string, string[]> = {
  'R615': ['lajpat', 'connaught', 'ring road', 'ina', 'cp'],
  'R423': ['lajpat', 'safdarjung', 'rk ashram', 'connaught'],
  'PINK_LINE': ['lajpat metro', 'rajiv chowk', 'pink line', 'metro'],
};

export async function checkForDisruptions(): Promise<DisruptionEvent[]> {
  const events: DisruptionEvent[] = [];

  for (const feedUrl of DELHI_RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRSSItems(xml);

      for (const item of items.slice(0, 10)) {
        const text = `${item.title} ${item.description}`.toLowerCase();
        const hasDisruption = DISRUPTION_KEYWORDS.some(kw => text.includes(kw));
        if (!hasDisruption) continue;

        const affectedRoutes = Object.entries(ROUTE_KEYWORDS)
          .filter(([, keywords]) => keywords.some(kw => text.includes(kw)))
          .map(([routeId]) => routeId);

        if (affectedRoutes.length > 0) {
          events.push({
            title: item.title,
            description: item.description.slice(0, 200),
            affectedRoutes,
            severity: text.includes('bandh') || text.includes('blocked') ? 'high' : 'medium',
            source: feedUrl,
            detectedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Feed unavailable — skip silently
    }
  }

  return events;
}

function parseRSSItems(xml: string): { title: string; description: string }[] {
  const items: { title: string; description: string }[] = [];
  const itemMatches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
  for (const match of itemMatches) {
    const content = match[1];
    const title = content.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] ?? '';
    const desc = content.match(/<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/)?.[1] ?? '';
    items.push({ title: title.trim(), description: desc.replace(/<[^>]+>/g, '').trim() });
  }
  return items;
}

export async function storeDisruptionAlert(event: DisruptionEvent): Promise<void> {
  const db = getDb();
  const id = `disruption_${Date.now()}`;
  db.prepare(`INSERT OR IGNORE INTO notices (id, raw_text, extracted_json, status) VALUES (?,?,?,?)`).run(
    id,
    event.title,
    JSON.stringify({ ...event, changeType: 'diversion', effectiveDate: new Date().toISOString().split('T')[0], effectiveTime: '00:00', ambiguousFields: ['effectiveTime'] }),
    'pending'
  );
}
