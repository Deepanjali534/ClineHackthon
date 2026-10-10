// AI notice extractor using Anthropic Claude
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

export interface ExtractedNotice {
  affectedRoute: string;
  tripId?: string;
  changeType: 'cancellation' | 'delay' | 'diversion' | 'stop_change';
  effectiveDate: string;
  effectiveTime: string;
  originalStop?: string;
  replacementStop?: string;
  ambiguousFields: string[];
}

export async function extractNotice(rawText: string, uploadDate: string): Promise<ExtractedNotice> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return getDemoExtraction(rawText);
  }

  const prompt = `You are a transport notice parser. Extract structured information from this service notice.
Upload date: ${uploadDate}

Notice: "${rawText}"

Return ONLY a JSON object with these fields:
- affectedRoute: route name/number (string)
- tripId: specific trip ID if identifiable, map to one of: T615_0745,T615_0800,T615_0815,T615_0830,T615_0845,T615_0900,T615_R1800,T615_R1815,T615_R1845,T615_R1900,T423_0815,T423_0850,T423_R1830,METRO_PINK_0750,METRO_PINK_0810 (string or null)
- changeType: one of "cancellation","delay","diversion","stop_change"
- effectiveDate: ISO date string, resolve "tomorrow" relative to upload date
- effectiveTime: HH:MM of affected departure
- originalStop: original stop name if changed (string or null)
- replacementStop: replacement stop if any (string or null)
- ambiguousFields: array of field names that are unclear or missing

Return only valid JSON, no explanation.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return getDemoExtraction(rawText);
  }
}

function getDemoExtraction(rawText: string): ExtractedNotice {
  // Simple heuristic extraction for demo
  const isCancellation = /cancel/i.test(rawText);
  const isDelay = /delay|late/i.test(rawText);
  const timeMatch = rawText.match(/(\d{1,2}):(\d{2})/);
  const routeMatch = rawText.match(/(\d{3}|route\s*\d+|shuttle)/i);

  const time = timeMatch ? `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}` : '08:15';
  const tripMap: Record<string, string> = {
    '07:45': 'T615_0745', '08:00': 'T615_0800', '08:15': 'T615_0745',
    '08:30': 'T615_0830', '08:45': 'T615_0845',
  };

  return {
    affectedRoute: routeMatch ? routeMatch[0] : 'Route 615',
    tripId: tripMap[time],
    changeType: isCancellation ? 'cancellation' : isDelay ? 'delay' : 'cancellation',
    effectiveDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    effectiveTime: time,
    ambiguousFields: ['affectedRoute', 'effectiveDate'],
  };
}
