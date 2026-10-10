// Geocoder using Nominatim (OpenStreetMap) — free, no API key needed
export interface GeoLocation {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
}

export interface NearestStop {
  stopId: string;
  stopName: string;
  lat: number;
  lng: number;
  walkMeters: number;
  walkMins: number;
}

// Delhi bounding box to keep results relevant
const DELHI_BOUNDS = 'viewbox=76.8,28.4,77.4,28.9&bounded=1';

export async function geocode(placeName: string): Promise<GeoLocation | null> {
  try {
    const query = encodeURIComponent(`${placeName}, Delhi, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&${DELHI_BOUNDS}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'YatraSathi/1.0 (hackathon project)' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) {
      // Try without Delhi bounds
      const url2 = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
      const res2 = await fetch(url2, {
        headers: { 'User-Agent': 'YatraSathi/1.0' },
        signal: AbortSignal.timeout(5000),
      });
      const data2 = await res2.json();
      if (!data2.length) return null;
      return {
        name: placeName,
        lat: parseFloat(data2[0].lat),
        lng: parseFloat(data2[0].lon),
        displayName: data2[0].display_name,
      };
    }

    return {
      name: placeName,
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

// Haversine distance in meters
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// All known stops with coordinates
const KNOWN_STOPS = [
  { id: 'LAJPAT_BUS', name: 'Lajpat Nagar Bus Stand', lat: 28.5700, lng: 77.2410 },
  { id: 'LAJPAT_METRO', name: 'Lajpat Nagar Metro', lat: 28.5689, lng: 77.2437 },
  { id: 'CP_OUTER', name: 'Connaught Place Bus Stop', lat: 28.6315, lng: 77.2167 },
  { id: 'CP_METRO', name: 'Rajiv Chowk Metro', lat: 28.6330, lng: 77.2192 },
  { id: 'INA_MARKET', name: 'INA Market Stop', lat: 28.5750, lng: 77.2100 },
  { id: 'SAFDARJUNG', name: 'Safdarjung Hospital Stop', lat: 28.5700, lng: 77.2050 },
  { id: 'RK_ASHRAM', name: 'RK Ashram Marg Stop', lat: 28.6350, lng: 77.2100 },
  { id: 'RING_ROAD', name: 'Ring Road Junction', lat: 28.5800, lng: 77.2300 },
];

export function findNearestStops(lat: number, lng: number, count = 3): NearestStop[] {
  return KNOWN_STOPS
    .map(stop => {
      const walkMeters = Math.round(haversineMeters(lat, lng, stop.lat, stop.lng));
      return {
        stopId: stop.id,
        stopName: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        walkMeters,
        walkMins: Math.ceil(walkMeters / 80), // 80m/min walking speed
      };
    })
    .sort((a, b) => a.walkMeters - b.walkMeters)
    .slice(0, count);
}

// Calculate travel time using OSRM (free routing engine)
export async function getWalkingDistance(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<{ distanceMeters: number; durationMins: number }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('OSRM failed');
    const data = await res.json();
    if (data.code !== 'Ok') throw new Error('No route');
    const route = data.routes[0];
    return {
      distanceMeters: Math.round(route.distance),
      durationMins: Math.ceil(route.duration / 60),
    };
  } catch {
    // Fallback: haversine estimate
    const dist = haversineMeters(fromLat, fromLng, toLat, toLng);
    return { distanceMeters: Math.round(dist), durationMins: Math.ceil(dist / 80) };
  }
}

// Estimate travel time by road (for auto/cab)
export async function getDrivingTime(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<{ distanceMeters: number; durationMins: number; fareEstimateINR: number }> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('OSRM failed');
    const data = await res.json();
    if (data.code !== 'Ok') throw new Error('No route');
    const route = data.routes[0];
    const distKm = route.distance / 1000;
    // Auto fare estimate: ₹25 base + ₹12/km
    const fareEstimateINR = Math.round(25 + distKm * 12);
    return {
      distanceMeters: Math.round(route.distance),
      durationMins: Math.ceil(route.duration / 60),
      fareEstimateINR,
    };
  } catch {
    const dist = haversineMeters(fromLat, fromLng, toLat, toLng);
    const distKm = dist / 1000;
    return {
      distanceMeters: Math.round(dist),
      durationMins: Math.ceil(dist / 300),
      fareEstimateINR: Math.round(25 + distKm * 12),
    };
  }
}
