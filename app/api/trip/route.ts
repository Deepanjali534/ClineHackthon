import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { TripRequest, TripPlan, TripDay } from '@/lib/types';
import { randomUUID } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const body: TripRequest = await req.json();
    const db = getDb();
    const id = randomUUID();

    db.prepare('INSERT INTO trips_plan (id, request_json, status) VALUES (?,?,?)').run(id, JSON.stringify(body), 'pending');

    // Generate trip plan
    (async () => {
      try {
        const plan = await generateTripPlan(body, id);
        db.prepare('UPDATE trips_plan SET plan_json=?, status=? WHERE id=?').run(JSON.stringify(plan), 'ready', id);
      } catch {
        db.prepare("UPDATE trips_plan SET status='error' WHERE id=?").run(id);
      }
    })();

    return NextResponse.json({ id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = getDb();
  // Poll for up to 30s
  for (let i = 0; i < 30; i++) {
    const row = db.prepare('SELECT * FROM trips_plan WHERE id=?').get(id) as any;
    if (row?.status === 'ready' && row.plan_json) {
      return NextResponse.json(JSON.parse(row.plan_json));
    }
    if (row?.status === 'error') return NextResponse.json({ error: 'Planning failed' }, { status: 500 });
    await new Promise(r => setTimeout(r, 1000));
  }
  return NextResponse.json({ error: 'Timeout' }, { status: 504 });
}

async function generateTripPlan(req: TripRequest, id: string): Promise<TripPlan> {
  // Try Claude if API key available
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

      const prompt = `Create a ${days}-day trip itinerary for ${req.destination}, India.
Budget: ₹${req.totalBudgetINR} total. Optimization: ${req.optimizationMode}.
Interests: ${req.interests.join(', ')}.
Return a JSON object with this exact structure:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "slots": [
        { "time": "morning", "place": "Place Name", "type": "monument", "durationMins": 120, "estimatedCostINR": 200, "transport": "Auto ₹80", "notes": "Optional note" }
      ],
      "weatherSummary": "Sunny, 32°C",
      "dayTotalCostINR": 1200
    }
  ],
  "explanation": "Why this itinerary fits the user"
}
Only return the JSON, no other text.`;

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id,
          destination: req.destination,
          days: parsed.days,
          totalCostINR: parsed.days.reduce((sum: number, d: TripDay) => sum + d.dayTotalCostINR, 0),
          optimizationMode: req.optimizationMode,
          explanation: parsed.explanation,
          createdAt: new Date().toISOString(),
        };
      }
    } catch { /* fallback below */ }
  }

  // Demo fallback
  return getDemoTrip(req, id);
}

function getDemoTrip(req: TripRequest, id: string): TripPlan {
  const days: TripDay[] = [];
  const start = new Date(req.startDate);
  const end = new Date(req.endDate);
  const numDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  const perDay = Math.floor(req.totalBudgetINR / numDays);

  for (let i = 0; i < numDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      slots: [
        { time: 'morning', place: `${req.destination} Heritage Site`, type: 'monument', durationMins: 120, estimatedCostINR: Math.round(perDay * 0.2), transport: 'Auto ₹80', notes: 'Demo data' },
        { time: 'afternoon', place: 'Local Restaurant', type: 'restaurant', durationMins: 90, estimatedCostINR: Math.round(perDay * 0.3), transport: 'Walking', notes: 'Demo data' },
        { time: 'evening', place: 'Market / Bazaar', type: 'activity', durationMins: 60, estimatedCostINR: Math.round(perDay * 0.2), transport: 'Auto ₹60', notes: 'Demo data' },
      ],
      weatherSummary: '☀️ Sunny, 30°C (Demo)',
      dayTotalCostINR: perDay,
    });
  }

  return { id, destination: req.destination, days, totalCostINR: req.totalBudgetINR, optimizationMode: req.optimizationMode, explanation: `Demo itinerary for ${req.destination}. Add ANTHROPIC_API_KEY for AI-generated plans.`, createdAt: new Date().toISOString() };
}
