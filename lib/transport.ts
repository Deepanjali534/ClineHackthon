// Transport adapter — queries SQLite for routes, schedules, fares
import { getDb } from './db';
import { RouteOption } from './types';

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export function getRouteOptions(
  fromArea: 'lajpat' | 'cp',
  toArea: 'lajpat' | 'cp',
  afterTime: string, // HH:MM
  cancelledTripIds: string[] = []
): RouteOption[] {
  const db = getDb();
  const afterMins = timeToMins(afterTime);

  // Determine direction: 0 = Lajpat->CP, 1 = CP->Lajpat
  const direction = fromArea === 'lajpat' ? 0 : 1;
  const fromStop = direction === 0 ? 'LAJPAT_BUS' : 'CP_OUTER';
  const toStop = direction === 0 ? 'CP_OUTER' : 'LAJPAT_BUS';
  const fromMetroStop = direction === 0 ? 'LAJPAT_METRO' : 'CP_METRO';
  const toMetroStop = direction === 0 ? 'CP_METRO' : 'LAJPAT_METRO';

  // Bus options
  const busSql = `
    SELECT t.id as trip_id, r.id as route_id, r.name as route_name, r.mode,
           st1.departure as dep_time, st2.arrival as arr_time,
           COALESCE(f.amount_inr, 30) as fare
    FROM trips t
    JOIN routes r ON r.id = t.route_id
    JOIN stop_times st1 ON st1.trip_id = t.id AND st1.stop_id = ?
    JOIN stop_times st2 ON st2.trip_id = t.id AND st2.stop_id = ?
    LEFT JOIN fares f ON f.route_id = r.id AND f.from_stop = ? AND f.to_stop = ?
    WHERE t.direction = ? AND r.mode = 'bus'
    ORDER BY st1.departure ASC
  `;

  const busRows = db.prepare(busSql).all(fromStop, toStop, fromStop, toStop, direction) as any[];

  const metroSql = `
    SELECT t.id as trip_id, r.id as route_id, r.name as route_name, r.mode,
           st1.departure as dep_time, st2.arrival as arr_time,
           COALESCE(f.amount_inr, 40) as fare
    FROM trips t
    JOIN routes r ON r.id = t.route_id
    JOIN stop_times st1 ON st1.trip_id = t.id AND st1.stop_id = ?
    JOIN stop_times st2 ON st2.trip_id = t.id AND st2.stop_id = ?
    LEFT JOIN fares f ON f.route_id = r.id AND f.from_stop = ? AND f.to_stop = ?
    WHERE t.direction = ? AND r.mode = 'metro'
    ORDER BY st1.departure ASC
  `;

  const metroRows = db.prepare(metroSql).all(fromMetroStop, toMetroStop, fromMetroStop, toMetroStop, direction) as any[];

  const allRows = [...busRows, ...metroRows];
  const options: RouteOption[] = [];

  for (const row of allRows) {
    if (cancelledTripIds.includes(row.trip_id)) continue;
    const depMins = timeToMins(row.dep_time);
    // Need at least 10 mins to reach stop (walk buffer)
    if (depMins < afterMins + 10) continue;

    const walkToStop = row.mode === 'metro' ? 350 : 400;
    const walkFromStop = row.mode === 'metro' ? 300 : 350;
    const durMins = timeToMins(row.arr_time) - depMins;

    options.push({
      id: `${row.trip_id}_opt`,
      tripId: row.trip_id,
      routeId: row.route_id,
      routeName: row.route_name,
      mode: row.mode,
      fromStop,
      toStop,
      departureTime: row.dep_time,
      arrivalTime: row.arr_time,
      durationMins: durMins,
      fareINR: row.fare,
      walkToStopMeters: walkToStop,
      walkFromStopMeters: walkFromStop,
      transfers: 0,
      sourceType: 'scheduled',
    });
  }

  return options.slice(0, 5); // Top 5 options
}

export function getCancelledTrips(): string[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT json_extract(extracted_json, '$.tripId') as trip_id
    FROM notices WHERE status = 'approved'
    AND json_extract(extracted_json, '$.changeType') = 'cancellation'
    AND date(json_extract(extracted_json, '$.effectiveDate')) = date('now')
  `).all() as any[];
  return rows.map(r => r.trip_id).filter(Boolean);
}
