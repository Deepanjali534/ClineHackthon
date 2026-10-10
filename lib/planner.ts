// Deterministic journey planner with 5 optimization modes
import { CommuteRequest, JourneyPlan, JourneyLeg, JourneyStep, OptimizationMode, OptimizationWeights, RouteOption } from './types';
import { getRouteOptions, getCancelledTrips } from './transport';
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
  const weather = await getWeather();

  const deadlineMins = timeToMins(req.arrivalDeadline);

  const outboundOptions = getRouteOptions('lajpat', 'cp', '06:00', cancelled);
  const feasibleOutbound = outboundOptions.filter(opt => {
    const arrMins = timeToMins(opt.arrivalTime);
    return arrMins <= deadlineMins && opt.fareINR <= req.dailyBudgetINR / 2;
  });

  if (feasibleOutbound.length === 0) {
    throw new Error(`No feasible outbound options found. All buses arrive after ${req.arrivalDeadline} or exceed budget.`);
  }

  const scoredOutbound = feasibleOutbound.map(opt => ({ opt, score: scoreOption(opt, req.optimizationMode, feasibleOutbound) }));
  scoredOutbound.sort((a, b) => b.score - a.score);
  const bestOutbound = scoredOutbound[0].opt;
  const backupOutbound = scoredOutbound[1]?.opt;

  const returnOptions = getRouteOptions('cp', 'lajpat', req.returnReadyTime, cancelled);
  const feasibleReturn = returnOptions.filter(opt => opt.fareINR <= req.dailyBudgetINR - bestOutbound.fareINR);

  if (feasibleReturn.length === 0) {
    throw new Error(`No feasible return options found after ${req.returnReadyTime}.`);
  }

  const scoredReturn = feasibleReturn.map(opt => ({ opt, score: scoreOption(opt, req.optimizationMode, feasibleReturn) }));
  scoredReturn.sort((a, b) => b.score - a.score);
  const bestReturn = scoredReturn[0].opt;

  const totalCost = bestOutbound.fareINR + bestReturn.fareINR;
  const totalWalk = bestOutbound.walkToStopMeters + bestOutbound.walkFromStopMeters + bestReturn.walkToStopMeters + bestReturn.walkFromStopMeters;

  const plan: JourneyPlan = {
    id,
    outbound: buildLeg(bestOutbound, false),
    returnLeg: buildLeg(bestReturn, true),
    totalCostINR: totalCost,
    totalWalkMeters: totalWalk,
    meetsDeadline: timeToMins(bestOutbound.arrivalTime) <= deadlineMins,
    meetsBudget: totalCost <= req.dailyBudgetINR,
    meetsWalkLimit: totalWalk <= req.maxWalkMeters * 2,
    optimizationMode: req.optimizationMode,
    optimizationScore: scoredOutbound[0].score,
    explanation: generateExplanation(bestOutbound, bestReturn, req, scoredOutbound[0].score),
    weatherSummary: getWeatherForJourney(weather),
    version: 1,
    createdAt: new Date().toISOString(),
  };

  if (backupOutbound) {
    const backupReturn = scoredReturn[1]?.opt ?? bestReturn;
    plan.backup = {
      ...plan,
      id: `${id}_backup`,
      outbound: buildLeg(backupOutbound, false),
      returnLeg: buildLeg(backupReturn, true),
      totalCostINR: backupOutbound.fareINR + backupReturn.fareINR,
      optimizationScore: scoredOutbound[1]?.score ?? 0,
      explanation: `Backup: ${backupOutbound.routeName} at ${backupOutbound.departureTime} — use if primary option is missed.`,
    };
  }

  return plan;
}

function generateExplanation(ob: RouteOption, ret: RouteOption, req: CommuteRequest, score: number): string {
  const deadlineMins = timeToMins(req.arrivalDeadline);
  const arrMins = timeToMins(ob.arrivalTime);
  const buffer = deadlineMins - arrMins;

  const modeLabels: Record<OptimizationMode, string> = {
    cheapest: 'cheapest available option',
    fastest: 'fastest route',
    least_walk: 'route with least walking',
    comfortable: 'most comfortable route',
    balanced: 'best balanced option',
  };

  return `Selected ${modeLabels[req.optimizationMode]}: ${ob.routeName} departs at ${ob.departureTime}, arrives at ${ob.arrivalTime} \u2014 ${buffer} minutes before your ${req.arrivalDeadline} deadline. Total cost \u20b9${ob.fareINR + ret.fareINR} within \u20b9${req.dailyBudgetINR} budget. Return via ${ret.routeName} at ${ret.departureTime}.`;
}
