import { NextRequest, NextResponse } from 'next/server';
import { TripRequest } from '@/lib/types';
import { randomUUID } from 'crypto';

(globalThis as any).__tripStore = (globalThis as any).__tripStore || new Map();
const store: Map<string, any> = (globalThis as any).__tripStore;

export async function POST(req: NextRequest) {
  try {
    const body: TripRequest = await req.json();
    const id = randomUUID();

    // Generate trip plan synchronously using simple templating
    const plan = generateTripPlan(body, id);
    store.set(id, { status: 'ready', plan });

    return NextResponse.json({ id });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const entry = store.get(id);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(entry.plan);
}

function generateTripPlan(req: TripRequest, id: string) {
  const days = getDaysBetween(req.startDate, req.endDate);
  const dayBudget = Math.round(req.totalBudgetINR / days);

  const interestPlaces: Record<string, Array<{place:string,type:string,cost:number,dur:number,notes:string}>> = {
    history:     [{place:'Local Fort/Monument',type:'monument',cost:150,dur:120,notes:'Guided tour recommended'},{place:'Heritage Museum',type:'monument',cost:100,dur:90,notes:'Audio guide available'}],
    food:        [{place:'Local Food Street',type:'restaurant',cost:200,dur:60,notes:'Try regional specialities'},{place:'Famous Dhaba',type:'restaurant',cost:150,dur:45,notes:'Traditional thali'}],
    nature:      [{place:'City Park',type:'activity',cost:50,dur:90,notes:'Early morning recommended'},{place:'Botanical Garden',type:'activity',cost:80,dur:120,notes:'Peaceful and scenic'}],
    shopping:    [{place:'Local Market',type:'activity',cost:300,dur:90,notes:'Bargain for best prices'},{place:'Handicraft Bazaar',type:'activity',cost:400,dur:60,notes:'Authentic local crafts'}],
    adventure:   [{place:'Trekking Point',type:'activity',cost:200,dur:180,notes:'Carry water and snacks'},{place:'Adventure Park',type:'activity',cost:350,dur:120,notes:'Book in advance'}],
    culture:     [{place:'Cultural Center',type:'activity',cost:100,dur:90,notes:'Evening shows available'},{place:'Traditional Arts',type:'activity',cost:150,dur:60,notes:'Live demonstrations'}],
    relaxation:  [{place:'Spa & Wellness',type:'activity',cost:500,dur:120,notes:'Book appointment ahead'},{place:'Lake/Garden',type:'activity',cost:0,dur:90,notes:'Peaceful environment'}],
  };

  const destPlaces: Record<string, Array<{place:string,type:string,cost:number,dur:number,time:string,notes:string}>> = {
    jaipur:   [
      {place:'Amber Fort',type:'monument',cost:200,dur:120,time:'morning',notes:'Reach by 9AM to avoid crowds. UNESCO listed.'},
      {place:'City Palace',type:'monument',cost:300,dur:90,time:'morning',notes:'Royal residence with museum inside.'},
      {place:'Hawa Mahal',type:'monument',cost:100,dur:60,time:'afternoon',notes:'Best viewed from outside at golden hour.'},
      {place:'Jantar Mantar',type:'monument',cost:100,dur:45,time:'morning',notes:'UNESCO astronomical instruments.'},
      {place:'Chokhi Dhani',type:'restaurant',cost:600,dur:120,time:'evening',notes:'Traditional Rajasthani village experience.'},
      {place:'Lassiwala',type:'restaurant',cost:80,dur:30,time:'afternoon',notes:'Famous thick lassi — must try!'},
      {place:'Nahargarh Fort',type:'monument',cost:150,dur:90,time:'afternoon',notes:'Panoramic city views.'},
      {place:'Johri Bazaar',type:'activity',cost:400,dur:90,time:'evening',notes:'Bangles, textiles, local snacks.'},
      {place:'Bapu Bazaar',type:'activity',cost:300,dur:60,time:'afternoon',notes:'Rajasthani handicrafts and juttis.'},
    ],
    manali:   [
      {place:'Solang Valley',type:'adventure',cost:500,dur:240,time:'morning',notes:'Skiing in winter, paragliding in summer.'},
      {place:'Rohtang Pass',type:'nature',cost:200,dur:300,time:'morning',notes:'Permit required. Go early.'},
      {place:'Hadimba Temple',type:'monument',cost:0,dur:60,time:'morning',notes:'Ancient temple in cedar forest.'},
      {place:'Old Manali Market',type:'activity',cost:300,dur:90,time:'afternoon',notes:'Cafes, shops, local vibe.'},
      {place:'Beas River Rafting',type:'adventure',cost:600,dur:120,time:'afternoon',notes:'Grade 2-3 rapids. Exciting!'},
    ],
    goa:      [
      {place:'Calangute Beach',type:'activity',cost:0,dur:120,time:'morning',notes:'Most popular beach. Watersports available.'},
      {place:'Fort Aguada',type:'monument',cost:50,dur:90,time:'morning',notes:'17th century Portuguese fort.'},
      {place:'Anjuna Flea Market',type:'activity',cost:400,dur:120,time:'afternoon',notes:'Wednesdays only. Hippie vibe.'},
      {place:'Seafood Restaurant',type:'restaurant',cost:600,dur:90,time:'evening',notes:'Fresh catch of the day.'},
      {place:'Basilica of Bom Jesus',type:'monument',cost:0,dur:60,time:'morning',notes:'UNESCO World Heritage Site.'},
    ],
    agra:     [
      {place:'Taj Mahal',type:'monument',cost:1100,dur:180,time:'morning',notes:'Reach at sunrise — magical!'},
      {place:'Agra Fort',type:'monument',cost:650,dur:120,time:'afternoon',notes:'Massive Mughal fort, UNESCO listed.'},
      {place:'Mehtab Bagh',type:'activity',cost:200,dur:60,time:'evening',notes:'Best sunset view of Taj Mahal.'},
      {place:'Petha Market',type:'activity',cost:200,dur:45,time:'afternoon',notes:'Famous Agra sweets.'},
    ],
    delhi:    [
      {place:'Red Fort',type:'monument',cost:50,dur:120,time:'morning',notes:'UNESCO listed. Sound & light show evenings.'},
      {place:'Qutub Minar',type:'monument',cost:40,dur:90,time:'morning',notes:'Tallest brick minaret in world.'},
      {place:'India Gate',type:'monument',cost:0,dur:60,time:'evening',notes:'Iconic war memorial. Beautiful at night.'},
      {place:'Chandni Chowk',type:'activity',cost:300,dur:90,time:'afternoon',notes:'Old Delhi street food and bazaar.'},
      {place:'Humayun Tomb',type:'monument',cost:40,dur:90,time:'afternoon',notes:'Precursor to Taj Mahal.'},
      {place:'Hauz Khas Village',type:'activity',cost:200,dur:90,time:'evening',notes:'Trendy cafes and boutiques.'},
    ],
  };

  const dest = req.destination.toLowerCase();
  const knownDest = Object.keys(destPlaces).find(k => dest.includes(k));
  const allPlaces = knownDest ? destPlaces[knownDest] : [];

  // Build interest-based places for unknown destinations
  const interestPool: any[] = [];
  req.interests.forEach(interest => {
    const places = interestPlaces[interest] || [];
    places.forEach(p => interestPool.push({...p, time:'morning'}));
  });

  const sourcePlaces = allPlaces.length > 0 ? allPlaces : interestPool;

  const tripDays = [];
  let placeIdx = 0;
  let totalCost = 0;

  for (let day = 1; day <= days; day++) {
    const date = addDays(req.startDate, day - 1);
    const slots: any[] = [];
    const timePeriods = ['morning', 'afternoon', 'evening'];
    let dayCost = 0;

    for (const period of timePeriods) {
      if (placeIdx < sourcePlaces.length) {
        const p = sourcePlaces[placeIdx];
        slots.push({
          time: period,
          place: p.place,
          type: p.type || 'activity',
          durationMins: p.dur || 90,
          estimatedCostINR: Math.min(p.cost || 200, Math.round(dayBudget / 3)),
          notes: p.notes || ''
        });
        dayCost += Math.min(p.cost || 200, Math.round(dayBudget / 3));
        placeIdx++;
      }
    }

    // Add transport slot if not last day
    if (day < days) {
      slots.push({ time:'evening', place:'Return to hotel / transit', type:'transport', durationMins:30, estimatedCostINR:150, notes:'Auto or local transport' });
      dayCost += 150;
    }

    totalCost += dayCost;
    tripDays.push({
      day, date,
      weatherSummary: getSeasonalWeather(req.destination, req.startDate),
      dayTotalCostINR: dayCost,
      slots
    });
  }

  return {
    id,
    destination: req.destination,
    days: tripDays,
    totalCostINR: Math.min(totalCost, req.totalBudgetINR),
    optimizationMode: req.optimizationMode,
    explanation: `${days}-day ${req.destination} itinerary optimised for ${req.interests.join(', ')}. Budget \u20b9${req.totalBudgetINR} allocated across ${days} days (\u20b9${dayBudget}/day).`,
    createdAt: new Date().toISOString(),
  };
}

function getDaysBetween(start: string, end: string): number {
  const s = new Date(start), e = new Date(end);
  const diff = Math.ceil((e.getTime() - s.getTime()) / 86400000);
  return Math.max(1, Math.min(diff, 10));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getSeasonalWeather(dest: string, date: string): string {
  const month = new Date(date).getMonth() + 1;
  const hot = [4,5,6]; const monsoon = [7,8,9]; const cold = [11,12,1,2];
  if (monsoon.includes(month)) return '🌧️ Monsoon season — carry umbrella';
  if (hot.includes(month)) return '☀️ Hot & sunny — stay hydrated';
  if (cold.includes(month)) return '🧥 Pleasant & cool — light jacket needed';
  return '🌤️ Pleasant weather — great time to visit';
}
