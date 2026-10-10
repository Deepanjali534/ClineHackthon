/**
 * Zero-dependency in-memory database using plain JavaScript objects.
 * Works on ALL platforms (Windows/Mac/Linux) with NO native compilation.
 * Data persists in memory during the server session.
 * For hackathon use - all Delhi transit data is seeded on startup.
 */

import { randomUUID } from 'crypto';

// ─── In-memory tables ─────────────────────────────────────────────
interface Row { [key: string]: any; }
const tables: Record<string, Row[]> = {
  stops: [], routes: [], trips: [], stop_times: [], fares: [],
  plans: [], plan_versions: [], notices: [], agent_runs: [], trips_plan: [],
};

let seeded = false;

// ─── Query engine ─────────────────────────────────────────────────
function matchWhere(row: Row, where: string, params: any[]): boolean {
  // Simple WHERE parser for patterns used in this app
  let p = 0;
  const conditions = where.split(/\s+AND\s+/i);
  return conditions.every(cond => {
    const m = cond.trim().match(/^(\w+)\s*=\s*\?$/);
    if (m) return row[m[1]] == params[p++];
    const m2 = cond.trim().match(/^(\w+)\s*=\s*'([^']*)'$/);
    if (m2) return row[m2[1]] == m2[2];
    return true;
  });
}

function parseSQL(sql: string, params: any[]) {
  const s = sql.trim();

  // INSERT OR IGNORE INTO table VALUES (?,?,...)
  const insertM = s.match(/^INSERT(?:\s+OR\s+IGNORE)?\s+INTO\s+(\w+)(?:\s*\(([^)]+)\))?\s+VALUES\s*\(([^)]+)\)/i);
  if (insertM) {
    const table = insertM[1];
    const colStr = insertM[2];
    const cols = colStr ? colStr.split(',').map(c => c.trim()) : null;
    if (!tables[table]) tables[table] = [];
    const row: Row = { id: params[0] };
    const allCols = cols || Object.keys(tables[table][0] || {});
    allCols.forEach((col, i) => { row[col] = params[i]; });
    if (!tables[table].find(r => r.id === row.id)) {
      if (!row.id && !cols?.includes('id')) row._autoId = tables[table].length + 1;
      tables[table].push(row);
    }
    return { type: 'insert' };
  }

  // UPDATE table SET col=?, col2=? WHERE id=?
  const updateM = s.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)$/i);
  if (updateM) {
    const table = updateM[1];
    const setPart = updateM[2];
    const wherePart = updateM[3];
    const setCols = setPart.split(',').map(p => p.trim().split(/\s*=\s*\?/)[0]);
    const pCount = (setPart.match(/\?/g) || []).length;
    const setParams = params.slice(0, pCount);
    const whereParams = params.slice(pCount);
    if (tables[table]) {
      tables[table].forEach(row => {
        if (matchWhere(row, wherePart, whereParams)) {
          setCols.forEach((col, i) => { row[col] = setParams[i]; });
        }
      });
    }
    return { type: 'update' };
  }

  // SELECT * FROM table WHERE ... ORDER BY ... LIMIT ...
  const selectM = s.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+(?:JOIN.+?)*)?(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);
  if (selectM) {
    const table = selectM[2].split(/\s+/)[0]; // handle JOIN - just use first table
    const wherePart = selectM[3];
    const orderPart = selectM[4];
    const limit = selectM[5] ? parseInt(selectM[5]) : undefined;
    let rows = (tables[table] || []).filter(row =>
      wherePart ? matchWhere(row, wherePart, params) : true
    );
    if (orderPart) {
      const [col, dir] = orderPart.trim().split(/\s+/);
      rows.sort((a, b) => {
        const av = a[col], bv = b[col];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return dir?.toUpperCase() === 'DESC' ? -cmp : cmp;
      });
    }
    if (limit !== undefined) rows = rows.slice(0, limit);
    return { type: 'select', rows };
  }

  return { type: 'unknown', rows: [] };
}

// ─── Public API (mirrors better-sqlite3 interface) ─────────────────
export function getDb() {
  if (!seeded) initAndSeed();
  return {
    prepare: (sql: string) => ({
      run: (...params: any[]) => {
        parseSQL(sql, params.flat());
        return { changes: 1, lastInsertRowid: tables['plans']?.length || 0 };
      },
      get: (...params: any[]) => {
        const result = parseSQL(sql, params.flat());
        return result.rows?.[0];
      },
      all: (...params: any[]) => {
        const result = parseSQL(sql, params.flat());
        return result.rows || [];
      },
    }),
    exec: (sql: string) => {
      // DDL - skip, we manage tables in memory
    },
  };
}

export async function initDb() {
  if (!seeded) initAndSeed();
}

function initAndSeed() {
  if (seeded) return;
  seeded = true;
  seedDelhi();
}

function seedDelhi() {
  // Stops
  tables.stops = [
    { id:'LAJPAT_BUS', name:'Lajpat Nagar Bus Stand', lat:28.57, lng:77.241 },
    { id:'RING_ROAD', name:'Ring Road Junction', lat:28.58, lng:77.23 },
    { id:'INA_MARKET', name:'INA Market Stop', lat:28.575, lng:77.21 },
    { id:'SAFDARJUNG', name:'Safdarjung Hospital Stop', lat:28.57, lng:77.205 },
    { id:'RK_ASHRAM', name:'RK Ashram Marg Stop', lat:28.635, lng:77.21 },
    { id:'CP_OUTER', name:'Connaught Place Outer Circle', lat:28.6315, lng:77.2167 },
    { id:'LAJPAT_METRO', name:'Lajpat Nagar Metro', lat:28.5689, lng:77.2437 },
    { id:'CP_METRO', name:'Rajiv Chowk Metro', lat:28.633, lng:77.2192 },
  ];

  // Routes
  tables.routes = [
    { id:'R615', name:'Route 615', operator:'DTC', mode:'bus' },
    { id:'R423', name:'Route 423', operator:'DTC', mode:'bus' },
    { id:'PINK_LINE', name:'Pink Line Metro', operator:'DMRC', mode:'metro' },
  ];

  // Trips
  const days = 'mon,tue,wed,thu,fri,sat,sun';
  tables.trips = [
    { id:'T615_0745', route_id:'R615', service_days:days, direction:0 },
    { id:'T615_0800', route_id:'R615', service_days:days, direction:0 },
    { id:'T615_0830', route_id:'R615', service_days:days, direction:0 },
    { id:'T615_R1800', route_id:'R615', service_days:days, direction:1 },
    { id:'T615_R1815', route_id:'R615', service_days:days, direction:1 },
    { id:'T615_R1845', route_id:'R615', service_days:days, direction:1 },
    { id:'T423_0815', route_id:'R423', service_days:days, direction:0 },
    { id:'T423_R1830', route_id:'R423', service_days:days, direction:1 },
    { id:'METRO_PINK_0750', route_id:'PINK_LINE', service_days:days, direction:0 },
    { id:'METRO_PINK_0810', route_id:'PINK_LINE', service_days:days, direction:0 },
    { id:'METRO_PINK_R1800', route_id:'PINK_LINE', service_days:days, direction:1 },
  ];

  // Stop times
  let stId = 1;
  const stData = [
    ['T615_0745','LAJPAT_BUS','07:45','07:45',1],['T615_0745','RING_ROAD','07:55','07:56',2],['T615_0745','INA_MARKET','08:10','08:11',3],['T615_0745','CP_OUTER','08:28','08:28',4],
    ['T615_0800','LAJPAT_BUS','08:00','08:00',1],['T615_0800','RING_ROAD','08:10','08:11',2],['T615_0800','INA_MARKET','08:25','08:26',3],['T615_0800','CP_OUTER','08:47','08:47',4],
    ['T615_0830','LAJPAT_BUS','08:30','08:30',1],['T615_0830','RING_ROAD','08:40','08:41',2],['T615_0830','INA_MARKET','08:55','08:56',3],['T615_0830','CP_OUTER','09:17','09:17',4],
    ['T615_R1800','CP_OUTER','18:00','18:00',1],['T615_R1800','INA_MARKET','18:20','18:21',2],['T615_R1800','RING_ROAD','18:35','18:36',3],['T615_R1800','LAJPAT_BUS','18:48','18:48',4],
    ['T615_R1815','CP_OUTER','18:15','18:15',1],['T615_R1815','INA_MARKET','18:35','18:36',2],['T615_R1815','RING_ROAD','18:50','18:51',3],['T615_R1815','LAJPAT_BUS','19:03','19:03',4],
    ['T615_R1845','CP_OUTER','18:45','18:45',1],['T615_R1845','INA_MARKET','19:05','19:06',2],['T615_R1845','RING_ROAD','19:20','19:21',3],['T615_R1845','LAJPAT_BUS','19:33','19:33',4],
    ['T423_0815','LAJPAT_BUS','08:15','08:15',1],['T423_0815','SAFDARJUNG','08:30','08:31',2],['T423_0815','RK_ASHRAM','08:48','08:49',3],['T423_0815','CP_OUTER','09:00','09:00',4],
    ['T423_R1830','CP_OUTER','18:30','18:30',1],['T423_R1830','RK_ASHRAM','18:42','18:43',2],['T423_R1830','SAFDARJUNG','19:00','19:01',3],['T423_R1830','LAJPAT_BUS','19:15','19:15',4],
    ['METRO_PINK_0750','LAJPAT_METRO','07:50','07:50',1],['METRO_PINK_0750','CP_METRO','08:15','08:15',2],
    ['METRO_PINK_0810','LAJPAT_METRO','08:10','08:10',1],['METRO_PINK_0810','CP_METRO','08:35','08:35',2],
    ['METRO_PINK_R1800','CP_METRO','18:00','18:00',1],['METRO_PINK_R1800','LAJPAT_METRO','18:25','18:25',2],
  ];
  tables.stop_times = stData.map(([trip_id,stop_id,arrival,departure,sequence]) =>
    ({ id: stId++, trip_id, stop_id, arrival, departure, sequence })
  );

  // Fares
  tables.fares = [
    { id:1, route_id:'R615', from_stop:'LAJPAT_BUS', to_stop:'CP_OUTER', amount_inr:30 },
    { id:2, route_id:'R615', from_stop:'CP_OUTER', to_stop:'LAJPAT_BUS', amount_inr:30 },
    { id:3, route_id:'R423', from_stop:'LAJPAT_BUS', to_stop:'CP_OUTER', amount_inr:25 },
    { id:4, route_id:'R423', from_stop:'CP_OUTER', to_stop:'LAJPAT_BUS', amount_inr:25 },
    { id:5, route_id:'PINK_LINE', from_stop:'LAJPAT_METRO', to_stop:'CP_METRO', amount_inr:40 },
    { id:6, route_id:'PINK_LINE', from_stop:'CP_METRO', to_stop:'LAJPAT_METRO', amount_inr:40 },
  ];
}
