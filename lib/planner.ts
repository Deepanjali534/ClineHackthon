// Deterministic journey planner with 5 optimization modes + real geocoding
import { CommuteRequest, JourneyPlan, JourneyLeg, JourneyStep, OptimizationMode, OptimizationWeights, RouteOption } from './types';
import { getRouteOptions, getCancelledTrips } from './transport';
import { geocode, findNearestStops, getWalkingDistance, getDrivingTime, GeoLocation, NearestStop } from './geocoder';
import { getWeather, getWeatherForJourney } from './weather';

const WEIGHTS: Record<OptimizationMode, OptimizationWeights> = {
  cheapest:    { cost: 0.60, time: 0.15, walk: 0.10, transfers: 0.10, comfort: 0.05 },
  fastest:     { cost: 0.10, time: 0.60, walk: 0.10, transfers: 0.15, comfort: 0.05 },
  least_walk:  { cost: 0.10, time: 0.15, walk: 0.60, transfers: 0.10, comfort: 0.05 },
  comfortable: { cost: 0.10, time: 0.15, walk: 0.10, transfers: 0.25, comfort: 0.40 },
  balanced:    { cost: 0.25, time: 0.25, walk: 0.20, transfers: 0.15, comfort: 0.15 },
};

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function scoreOption(opt: RouteOption, mode: OptimizationMode, allOptions: RouteOption[]): number {
  const w = WEIGHTS[mode];
  const maxCost = Math.max(...allOptions.map(o => o.fareINR));
  const maxTime = Math.max(...allOptions.map(o => o.durationMins));
  const maxWalk = Math.max(...allOptions.map(o => o.walkToStopMeters + o.walkFromStopMeters));

  const costScore = 1 - (opt.fareINR / maxCost);
  const timeScore = 1 - (opt.durationMins / maxTime);
  const walkScore = 1 - ((opt.walkToStopMeters + opt.walkFromStopMeters) / maxWalk);
  const transferScore = 1 - opt.transfers * 0.5;
  const comfortScore = opt.mode === 'metro' ? 0.9 : 0.6;

  return w.cost * costScore + w.time * timeScore + w.walk * walkScore + w.transfers * transferScore + w.comfort * comfortScore;
}

function buildLeg(opt: RouteOption, isReturn: boolean): JourneyLeg {
  const walkMins = Math.ceil(opt.walkToStopMeters / 80);
  const walkBackMins = Math.ceil(opt.walkFromStopMeters / 80);

  const steps: JourneyStep[] = [
    {
      type: 'walk',
      description: `Walk ${opt.walkToStopMeters}m to ${isReturn ? 'CP' : 'Lajpat Nagar'} bus stop`,
      durationMins: walkMins,
      distanceMeters: opt.walkToStopMeters,
      costINR: 0,
      sourceType: 'estimated',
    },
    {
      type: opt.mode as any,
      description: `${opt.routeName} \u2192 ${isReturn ? 'Lajpat Nagar' : 'Connaught Place'} (\u20b9${opt.fareINR})`,
      durationMins: opt.durationMins,
      costINR: opt.fareINR,
      serviceId: opt.tripId,
      sourceType: 'demo',
    },
    {
      type: 'walk',
      description: `Walk ${opt.walkFromStopMeters}m to destination`,
      durationMins: walkBackMins,
      distanceMeters: opt.walkFromStopMeters,
      costINR: 0,
      sourceType: 'estimated',
    },
  ];

  return {
    departureTime: opt.departureTime,
    arrivalTime: opt.arrivalTime,
    steps,
    costINR: opt.fareINR,
    walkMeters: opt.walkToStopMeters + opt.walkFromStopMeters,
  };
}

export async function planJourney(req: CommuteRequest, id: string, cancelledTrips?: string[]): Promise<JourneyPlan> {
  const cancelled = cancelledTrips ?? getCancelledTrips();
  const [originGeo, destGeo] = await Promise.all([geocode(req.origin), geocode(req.destination)]);
  const weather = await getWeather(originGeo?.lat ?? 28.57, originGeo?.lng ?? 77.24);
  const deadlineMins = timeToMins(req.arrivalDeadline);

  const originStop = originGeo ? findNearestStops(originGeo.lat, originGeo.lng)[0] : null;
  const destStop = destGeo ? findNearestStops(destGeo.lat, destGeo.lng)[0] : null;
  const originArea = originGeo && originStop ? detectArea(originGeo, originStop) : 'lajpat';
  const destArea = destGeo && destStop ? detectArea(destGeo, destStop) : 'cp';
  const originTooFar = originStop && originStop.walkMeters > 3000;
  const destTooFar = destStop && destStop.walkMeters > 3000;

  let outboundLeg: JourneyLeg, returnLeg: JourneyLeg, totalCostINR: number, totalWalkMeters: number, explanation: string, backupPlan: JourneyPlan | undefined;

  if (originTooFar || destTooFar) {
    outboundLeg = await buildAutoLeg(req.origin, req.destination, originGeo?.lat??28.57, originGeo?.lng??77.24, destGeo?.lat??28.63, destGeo?.lng??77.22, '08:00');
    returnLeg = await buildAutoLeg(req.destination, req.origin, destGeo?.lat??28.63, destGeo?.lng??77.22, originGeo?.lat??28.57, originGeo?.lng??77.24, req.returnReadyTime);
    totalCostINR = outboundLeg.costINR + returnLeg.costINR;
    totalWalkMeters = 0;
    explanation = `Auto/cab recommended as locations are far from transit. Est. total ₹${totalCostINR}.`;
  } else {
    const outboundOptions = getRouteOptions(originArea as any, destArea as any, '06:00', cancelled);
    const feasibleOutbound = outboundOptions.filter(opt => timeToMins(opt.arrivalTime) <= deadlineMins && opt.fareINR <= req.dailyBudgetINR / 2);
    if (feasibleOutbound.length === 0) {
      outboundLeg = await buildAutoLeg(req.origin, req.destination, originGeo?.lat??28.57, originGeo?.lng??77.24, destGeo?.lat??28.63, destGeo?.lng??77.22, '08:00');
      returnLeg = await buildAutoLeg(req.destination, req.origin, destGeo?.lat??28.63, destGeo?.lng??77.22, originGeo?.lat??28.57, originGeo?.lng??77.24, req.returnReadyTime);
      totalCostINR = outboundLeg.costINR + returnLeg.costINR;
      totalWalkMeters = 0;
      explanation = `No direct bus found between ${req.origin} and ${req.destination} within deadline. Auto recommended: est. ₹${totalCostINR}.`;
    } else {
      const scoredOut = feasibleOutbound.map(opt => ({ opt, score: scoreOption(opt, req.optimizationMode, feasibleOutbound) })).sort((a,b)=>b.score-a.score);
      const bestOut = scoredOut[0].opt;
      const retOptions = getRouteOptions(destArea as any, originArea as any, req.returnReadyTime, cancelled);
      const feasibleRet = retOptions.filter(opt => opt.fareINR <= req.dailyBudgetINR - bestOut.fareINR);
      const scoredRet = feasibleRet.map(opt => ({ opt, score: scoreOption(opt, req.optimizationMode, feasibleRet) })).sort((a,b)=>b.score-a.score);
      const bestRet = scoredRet[0]?.opt;
      outboundLeg = originGeo && destGeo ? await buildRealLeg(bestOut, originGeo.lat, originGeo.lng, destGeo.lat, destGeo.lng, false) : buildLeg(bestOut, false);
      returnLeg = bestRet ? (destGeo && originGeo ? await buildRealLeg(bestRet, destGeo.lat, destGeo.lng, originGeo.lat, originGeo.lng, true) : buildLeg(bestRet, true)) : await buildAutoLeg(req.destination, req.origin, destGeo?.lat??28.63, destGeo?.lng??77.22, originGeo?.lat??28.57, originGeo?.lng??77.24, req.returnReadyTime);
      totalCostINR = outboundLeg.costINR + returnLeg.costINR;
      totalWalkMeters = outboundLeg.walkMeters + returnLeg.walkMeters;
      const buf = deadlineMins - timeToMins(bestOut.arrivalTime);
      const ml: Record<OptimizationMode,string> = { cheapest:'cheapest', fastest:'fastest', least_walk:'least walking', comfortable:'most comfortable', balanced:'best balanced' };
      explanation = `${ml[req.optimizationMode]}: ${bestOut.routeName} from near ${req.origin} at ${bestOut.departureTime}, arrives near ${req.destination} at ${bestOut.arrivalTime} — ${buf} min buffer. Total ₹${totalCostINR} within ₹${req.dailyBudgetINR} budget.`;
      if (scoredOut[1]) {
        const bkLeg = originGeo && destGeo ? await buildRealLeg(scoredOut[1].opt, originGeo.lat, originGeo.lng, destGeo.lat, destGeo.lng, false) : buildLeg(scoredOut[1].opt, false);
        backupPlan = { id:`${id}_backup`, outbound:bkLeg, returnLeg, totalCostINR:bkLeg.costINR+returnLeg.costINR, totalWalkMeters:bkLeg.walkMeters+returnLeg.walkMeters, meetsDeadline:timeToMins(scoredOut[1].opt.arrivalTime)<=deadlineMins, meetsBudget:(bkLeg.costINR+returnLeg.costINR)<=req.dailyBudgetINR, meetsWalkLimit:(bkLeg.walkMeters+returnLeg.walkMeters)<=req.maxWalkMeters*2, optimizationMode:req.optimizationMode, optimizationScore:scoredOut[1].score, explanation:`Backup: ${scoredOut[1].opt.routeName} at ${scoredOut[1].opt.departureTime}`, weatherSummary:getWeatherForJourney(weather), version:1, createdAt:new Date().toISOString() };
      }
    }
  }
  return { id, outbound:outboundLeg, returnLeg, totalCostINR, totalWalkMeters, meetsDeadline:timeToMins(outboundLeg.arrivalTime)<=deadlineMins, meetsBudget:totalCostINR<=req.dailyBudgetINR, meetsWalkLimit:totalWalkMeters<=req.maxWalkMeters*2, optimizationMode:req.optimizationMode, optimizationScore:0.8, explanation, weatherSummary:getWeatherForJourney(weather), backup:backupPlan, version:1, createdAt:new Date().toISOString() };
}

function detectArea(loc: GeoLocation, nearest: NearestStop): 'lajpat'|'cp'|'other' {
  const n = loc.displayName.toLowerCase();
  if (nearest.stopId.includes('LAJPAT')||n.includes('lajpat')||n.includes('south delhi')) return 'lajpat';
  if (nearest.stopId.includes('CP')||nearest.stopId.includes('RAJIV')||n.includes('connaught')||n.includes('rajiv')) return 'cp';
  return loc.lat < 28.60 ? 'lajpat' : 'cp';
}

async function buildRealLeg(opt: RouteOption, uLat: number, uLng: number, dLat: number, dLng: number, isReturn: boolean): Promise<JourneyLeg> {
  const sLats: Record<string,number> = { LAJPAT_BUS:28.57, LAJPAT_METRO:28.5689, CP_OUTER:28.6315, CP_METRO:28.633 };
  const sLngs: Record<string,number> = { LAJPAT_BUS:77.241, LAJPAT_METRO:77.2437, CP_OUTER:77.2167, CP_METRO:77.2192 };
  const [w1, w2] = await Promise.all([
    getWalkingDistance(uLat, uLng, sLats[opt.fromStop]??28.57, sLngs[opt.fromStop]??77.24),
    getWalkingDistance(sLats[opt.toStop]??28.63, sLngs[opt.toStop]??77.22, dLat, dLng)
  ]);
  const steps: JourneyStep[] = [
    { type:'walk', description:`Walk ${w1.distanceMeters}m to ${opt.fromStop.replace('_',' ')} stop`, durationMins:w1.durationMins, distanceMeters:w1.distanceMeters, costINR:0, sourceType:'estimated' },
    { type:opt.mode as any, description:`${opt.routeName} (₹${opt.fareINR})`, durationMins:opt.durationMins, costINR:opt.fareINR, serviceId:opt.tripId, sourceType:'demo' },
    { type:'walk', description:`Walk ${w2.distanceMeters}m to destination`, durationMins:w2.durationMins, distanceMeters:w2.distanceMeters, costINR:0, sourceType:'estimated' },
  ];
  return { departureTime:opt.departureTime, arrivalTime:opt.arrivalTime, steps, costINR:opt.fareINR, walkMeters:w1.distanceMeters+w2.distanceMeters };
}

async function buildAutoLeg(fromN: string, toN: string, fLat: number, fLng: number, tLat: number, tLng: number, depTime: string): Promise<JourneyLeg> {
  const d = await getDrivingTime(fLat, fLng, tLat, tLng);
  const arrM = timeToMins(depTime) + d.durationMins;
  const arrT = `${String(Math.floor(arrM/60)%24).padStart(2,'0')}:${String(arrM%60).padStart(2,'0')}`;
  return { departureTime:depTime, arrivalTime:arrT, steps:[{ type:'auto', description:`Auto/Cab: ${fromN} → ${toN} (est. ₹${d.fareEstimateINR})`, durationMins:d.durationMins, distanceMeters:d.distanceMeters, costINR:d.fareEstimateINR, sourceType:'estimated' }], costINR:d.fareEstimateINR, walkMeters:0 };
}

function generateExplanation(ob: RouteOption, ret: RouteOption, req: CommuteRequest, score: number): string {
  return `${ob.routeName} at ${ob.departureTime}. Total ₹${ob.fareINR+ret.fareINR}.`;
}

