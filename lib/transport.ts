// Transport adapter - handles ANY origin/destination in Delhi
import { RouteOption } from './types';

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// Delhi areas with coordinates and nearest transit stops
const DELHI_AREAS: Record<string, {
  name: string; lat: number; lng: number;
  nearestBusStop: string; nearestMetro: string;
  walkToBusMeters: number; walkToMetroMeters: number;
}> = {
  // South Delhi
  lajpat:       { name: 'Lajpat Nagar',         lat: 28.569, lng: 77.243, nearestBusStop: 'LAJPAT_BUS',  nearestMetro: 'LAJPAT_METRO', walkToBusMeters: 350, walkToMetroMeters: 400 },
  sarojini:     { name: 'Sarojini Nagar',        lat: 28.577, lng: 77.198, nearestBusStop: 'SAROJINI_BUS',nearestMetro: 'INA_METRO',    walkToBusMeters: 300, walkToMetroMeters: 600 },
  greenpark:    { name: 'Green Park',            lat: 28.560, lng: 77.207, nearestBusStop: 'GREENPARK_BUS',nearestMetro:'GREENPARK_METRO',walkToBusMeters:400, walkToMetroMeters:350 },
  hauz:         { name: 'Hauz Khas',             lat: 28.543, lng: 77.207, nearestBusStop: 'HAUZ_BUS',    nearestMetro: 'HAUZ_METRO',   walkToBusMeters: 500, walkToMetroMeters: 450 },
  malviya:      { name: 'Malviya Nagar',         lat: 28.533, lng: 77.211, nearestBusStop: 'MALVIYA_BUS', nearestMetro: 'MALVIYA_METRO',walkToBusMeters: 400, walkToMetroMeters: 500 },
  greater:      { name: 'Greater Kailash',       lat: 28.540, lng: 77.235, nearestBusStop: 'GK_BUS',      nearestMetro: 'KAILASH_METRO',walkToBusMeters: 400, walkToMetroMeters: 600 },
  // Central Delhi
  cp:           { name: 'Connaught Place',       lat: 28.631, lng: 77.216, nearestBusStop: 'CP_OUTER',    nearestMetro: 'CP_METRO',     walkToBusMeters: 300, walkToMetroMeters: 250 },
  indiagate:    { name: 'India Gate',            lat: 28.612, lng: 77.229, nearestBusStop: 'INDIAGATE_BUS',nearestMetro:'CENTRALSECRMET',walkToBusMeters:500, walkToMetroMeters:900 },
  karolbagh:    { name: 'Karol Bagh',            lat: 28.651, lng: 77.190, nearestBusStop: 'KAROL_BUS',   nearestMetro: 'KAROL_METRO',  walkToBusMeters: 350, walkToMetroMeters: 300 },
  paharganj:    { name: 'Paharganj',             lat: 28.644, lng: 77.213, nearestBusStop: 'PAHARGANJ_BUS',nearestMetro:'NEWDELHI_METRO',walkToBusMeters:400, walkToMetroMeters:500 },
  // East Delhi
  akshardham:   { name: 'Akshardham',            lat: 28.612, lng: 77.277, nearestBusStop: 'AKSHAR_BUS',  nearestMetro: 'AKSHAR_METRO', walkToBusMeters: 400, walkToMetroMeters: 350 },
  preet:        { name: 'Preet Vihar',           lat: 28.641, lng: 77.290, nearestBusStop: 'PREET_BUS',   nearestMetro: 'PREET_METRO',  walkToBusMeters: 400, walkToMetroMeters: 350 },
  // North Delhi
  kashmere:     { name: 'Kashmere Gate',         lat: 28.668, lng: 77.228, nearestBusStop: 'KASHMERE_BUS',nearestMetro:'KASHMERE_METRO',walkToBusMeters:300, walkToMetroMeters:300 },
  // West Delhi
  rajouri:      { name: 'Rajouri Garden',        lat: 28.648, lng: 77.121, nearestBusStop: 'RAJOURI_BUS', nearestMetro: 'RAJOURI_METRO',walkToBusMeters: 400, walkToMetroMeters: 350 },
  janakpuri:    { name: 'Janakpuri',             lat: 28.627, lng: 77.083, nearestBusStop: 'JANAKPURI_BUS',nearestMetro:'JANAKPURI_METRO',walkToBusMeters:450,walkToMetroMeters:400 },
  // Noida side
  noida:        { name: 'Noida Sector 18',       lat: 28.570, lng: 77.321, nearestBusStop: 'NOIDA_BUS',   nearestMetro: 'NOIDA_METRO',  walkToBusMeters: 500, walkToMetroMeters: 400 },
};

// Universal route database - routes between major Delhi hubs
// Each entry: { from, to, modes, schedules, basefare }
const ROUTE_DATABASE: Array<{
  id: string; name: string; mode: 'bus'|'metro';
  fromKey: string; toKey: string;
  schedules: string[]; // departure times HH:MM
  baseFareINR: number; durationMins: number;
}> = [
  // South to Central
  { id:'R615', name:'Bus 615', mode:'bus', fromKey:'lajpat', toKey:'cp', schedules:['07:45','08:00','08:30','09:00','09:30','10:00','10:30','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'], baseFareINR:30, durationMins:47 },
  { id:'R615R', name:'Bus 615', mode:'bus', fromKey:'cp', toKey:'lajpat', schedules:['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','18:15','18:45','19:00','19:30'], baseFareINR:30, durationMins:47 },
  { id:'R423', name:'Bus 423', mode:'bus', fromKey:'lajpat', toKey:'cp', schedules:['08:15','08:50','09:20','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'], baseFareINR:25, durationMins:52 },
  { id:'R423R', name:'Bus 423', mode:'bus', fromKey:'cp', toKey:'lajpat', schedules:['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:30','19:00'], baseFareINR:25, durationMins:52 },
  { id:'PINK_OUT', name:'Pink Line Metro', mode:'metro', fromKey:'lajpat', toKey:'cp', schedules:['07:50','08:05','08:20','08:35','08:50','09:05','09:20','09:35','10:00','10:30','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'], baseFareINR:40, durationMins:25 },
  { id:'PINK_RET', name:'Pink Line Metro', mode:'metro', fromKey:'cp', toKey:'lajpat', schedules:['08:00','08:30','09:00','09:30','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','18:30','19:00'], baseFareINR:40, durationMins:25 },
  // Sarojini area routes
  { id:'B510', name:'Bus 510', mode:'bus', fromKey:'sarojini', toKey:'cp', schedules:['07:30','08:00','08:30','09:00','09:30','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'], baseFareINR:25, durationMins:40 },
  { id:'B510R', name:'Bus 510', mode:'bus', fromKey:'cp', toKey:'sarojini', schedules:['08:30','09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30','17:30','18:30','19:00'], baseFareINR:25, durationMins:40 },
  { id:'YL_SAR', name:'Yellow Line Metro', mode:'metro', fromKey:'sarojini', toKey:'cp', schedules:['07:45','08:00','08:15','08:30','08:45','09:00','09:15','09:30','10:00','10:30','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'], baseFareINR:35, durationMins:20 },
  { id:'YL_SARR', name:'Yellow Line Metro', mode:'metro', fromKey:'cp', toKey:'sarojini', schedules:['08:00','08:30','09:00','09:30','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','18:30','19:00'], baseFareINR:35, durationMins:20 },
  // India Gate routes
  { id:'B571', name:'Bus 571', mode:'bus', fromKey:'indiagate', toKey:'cp', schedules:['07:30','08:00','08:30','09:00','09:30','10:00','11:00','12:00','14:00','16:00','18:00'], baseFareINR:20, durationMins:25 },
  { id:'B571R', name:'Bus 571', mode:'bus', fromKey:'cp', toKey:'indiagate', schedules:['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'], baseFareINR:20, durationMins:25 },
  // Generic cross routes - auto-generated for any pair
];

// Find closest area key from a free-text location name
export function resolveArea(locationText: string): string {
  const t = locationText.toLowerCase().trim();
  // Direct matches
  const directMap: Record<string, string> = {
    'lajpat nagar': 'lajpat', 'lajpat': 'lajpat',
    'connaught place': 'cp', 'cp': 'cp', 'connaught': 'cp', 'rajiv chowk': 'cp',
    'sarojini nagar': 'sarojini', 'sarojini': 'sarojini',
    'india gate': 'indiagate', 'india gate c hexagon': 'indiagate',
    'green park': 'greenpark', 'greenpark': 'greenpark',
    'hauz khas': 'hauz', 'hauzkhas': 'hauz',
    'malviya nagar': 'malviya', 'malviya': 'malviya',
    'greater kailash': 'greater', 'gk': 'greater',
    'karol bagh': 'karolbagh', 'karolbagh': 'karolbagh',
    'paharganj': 'paharganj',
    'akshardham': 'akshardham',
    'preet vihar': 'preet', 'preet': 'preet',
    'kashmere gate': 'kashmere', 'kashmere': 'kashmere',
    'rajouri garden': 'rajouri', 'rajouri': 'rajouri',
    'janakpuri': 'janakpuri',
    'noida': 'noida',
  };
  for (const [key, val] of Object.entries(directMap)) {
    if (t.includes(key)) return val;
  }
  // Fuzzy - find closest area name
  for (const [key, area] of Object.entries(DELHI_AREAS)) {
    if (t.includes(key) || key.includes(t.split(' ')[0])) return key;
  }
  // Default to nearest major hub based on rough keyword
  if (t.includes('south')) return 'lajpat';
  if (t.includes('north')) return 'kashmere';
  if (t.includes('east')) return 'preet';
  if (t.includes('west')) return 'rajouri';
  return 'cp'; // default central
}

// Calculate fare based on distance between two areas
function estimateFare(fromKey: string, toKey: string, mode: 'bus'|'metro'): number {
  const from = DELHI_AREAS[fromKey];
  const to = DELHI_AREAS[toKey];
  if (!from || !to) return mode === 'metro' ? 40 : 30;
  const dist = Math.sqrt(Math.pow((from.lat - to.lat) * 111, 2) + Math.pow((from.lng - to.lng) * 111, 2));
  if (mode === 'metro') {
    if (dist < 5) return 20; if (dist < 12) return 30; if (dist < 21) return 40; return 50;
  } else {
    if (dist < 5) return 15; if (dist < 12) return 25; if (dist < 21) return 30; return 40;
  }
}

// Estimate duration based on distance
function estimateDuration(fromKey: string, toKey: string, mode: 'bus'|'metro'): number {
  const from = DELHI_AREAS[fromKey];
  const to = DELHI_AREAS[toKey];
  if (!from || !to) return mode === 'metro' ? 30 : 50;
  const dist = Math.sqrt(Math.pow((from.lat - to.lat) * 111, 2) + Math.pow((from.lng - to.lng) * 111, 2));
  const speed = mode === 'metro' ? 35 : 18; // km/h avg
  return Math.max(10, Math.round((dist / speed) * 60));
}

// Generate schedules for any route (every 15-20 mins 7am-9pm)
function generateSchedules(startHour = 7, endHour = 21, intervalMins = 20): string[] {
  const schedules: string[] = [];
  let mins = startHour * 60;
  while (mins <= endHour * 60) {
    schedules.push(`${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`);
    mins += intervalMins + Math.floor(Math.random() * 5); // slight variation
  }
  return schedules;
}

export function getRouteOptions(
  fromInput: string,
  toInput: string,
  afterTime: string,
  cancelledTripIds: string[] = []
): RouteOption[] {
  const fromKey = resolveArea(fromInput);
  const toKey = resolveArea(toInput);
  const afterMins = timeToMins(afterTime);
  const fromArea = DELHI_AREAS[fromKey] || DELHI_AREAS['cp'];
  const toArea = DELHI_AREAS[toKey] || DELHI_AREAS['cp'];

  // Find direct routes in database
  const directRoutes = ROUTE_DATABASE.filter(r => r.fromKey === fromKey && r.toKey === toKey);

  // If no direct routes, generate synthetic routes
  const allRoutes = directRoutes.length > 0 ? directRoutes : [
    {
      id: `BUS_${fromKey.toUpperCase()}_${toKey.toUpperCase()}`,
      name: `Bus Service`,
      mode: 'bus' as const,
      fromKey, toKey,
      schedules: generateSchedules(),
      baseFareINR: estimateFare(fromKey, toKey, 'bus'),
      durationMins: estimateDuration(fromKey, toKey, 'bus'),
    },
    {
      id: `METRO_${fromKey.toUpperCase()}_${toKey.toUpperCase()}`,
      name: `Delhi Metro`,
      mode: 'metro' as const,
      fromKey, toKey,
      schedules: generateSchedules(6, 23, 10),
      baseFareINR: estimateFare(fromKey, toKey, 'metro'),
      durationMins: estimateDuration(fromKey, toKey, 'metro'),
    },
  ];

  const options: RouteOption[] = [];

  for (const route of allRoutes) {
    if (cancelledTripIds.includes(route.id)) continue;
    const walkToStop = route.mode === 'metro' ? fromArea.walkToMetroMeters : fromArea.walkToBusMeters;
    const walkFromStop = route.mode === 'metro' ? toArea.walkToMetroMeters : toArea.walkToBusMeters;

    // Find next departures after afterTime + walk time
    const walkToStopMins = Math.ceil(walkToStop / 80); // 80m per min walk speed
    const earliestDep = afterMins + walkToStopMins;

    const nextDeps = route.schedules
      .filter(dep => timeToMins(dep) >= earliestDep)
      .slice(0, 3); // up to 3 departure options per route

    for (const dep of nextDeps) {
      const depMins = timeToMins(dep);
      const arrMins = depMins + route.durationMins;
      const arrTime = `${String(Math.floor(arrMins/60)%24).padStart(2,'0')}:${String(arrMins%60).padStart(2,'0')}`;

      options.push({
        id: `${route.id}_${dep.replace(':','')}`,
        tripId: route.id,
        routeId: route.id,
        routeName: route.name,
        mode: route.mode,
        fromStop: fromArea.nearestBusStop,
        toStop: toArea.nearestBusStop,
        departureTime: dep,
        arrivalTime: arrTime,
        durationMins: route.durationMins,
        fareINR: route.baseFareINR,
        walkToStopMeters: walkToStop,
        walkFromStopMeters: walkFromStop,
        transfers: 0,
        sourceType: 'scheduled',
      });
    }
  }

  // Sort by departure time, return top 5
  options.sort((a, b) => timeToMins(a.departureTime) - timeToMins(b.departureTime));
  return options.slice(0, 6);
}

export function getCancelledTrips(): string[] {
  return []; // notices system - returns empty for now
}
