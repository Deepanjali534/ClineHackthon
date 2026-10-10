
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "travel.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema();
    seedData();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stops (id TEXT PRIMARY KEY, name TEXT NOT NULL, lat REAL NOT NULL, lng REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS routes (id TEXT PRIMARY KEY, name TEXT NOT NULL, operator TEXT NOT NULL, mode TEXT NOT NULL DEFAULT 'bus');
    CREATE TABLE IF NOT EXISTS trips (id TEXT PRIMARY KEY, route_id TEXT NOT NULL, service_days TEXT NOT NULL DEFAULT 'mon,tue,wed,thu,fri,sat,sun', direction INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS stop_times (id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id TEXT NOT NULL, stop_id TEXT NOT NULL, arrival TEXT NOT NULL, departure TEXT NOT NULL, sequence INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS fares (id INTEGER PRIMARY KEY AUTOINCREMENT, route_id TEXT NOT NULL, from_stop TEXT NOT NULL, to_stop TEXT NOT NULL, amount_inr REAL NOT NULL);
    CREATE TABLE IF NOT EXISTS plans (id TEXT PRIMARY KEY, request_json TEXT NOT NULL, plan_json TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS plan_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, plan_id TEXT NOT NULL, version INTEGER NOT NULL, plan_json TEXT NOT NULL, trigger TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS notices (id TEXT PRIMARY KEY, raw_text TEXT NOT NULL, extracted_json TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT (datetime('now')), reviewed_at TEXT);
    CREATE TABLE IF NOT EXISTS agent_runs (id TEXT PRIMARY KEY, plan_id TEXT, events_json TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'running', created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS trips_plan (id TEXT PRIMARY KEY, request_json TEXT NOT NULL, plan_json TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT (datetime('now')));
  `);
}

function seedData() {
  const count = db.prepare("SELECT COUNT(*) as c FROM stops").get() as { c: number };
  if (count.c > 0) return;
  // Stops
  const iS = db.prepare("INSERT OR IGNORE INTO stops VALUES (?,?,?,?)");
  [["LAJPAT_BUS","Lajpat Nagar Bus Stand",28.57,77.241],["RING_ROAD","Ring Road Junction",28.58,77.23],["INA_MARKET","INA Market Stop",28.575,77.21],["SAFDARJUNG","Safdarjung Hospital Stop",28.57,77.205],["RK_ASHRAM","RK Ashram Marg Stop",28.635,77.21],["CP_OUTER","Connaught Place Outer Circle",28.6315,77.2167],["LAJPAT_METRO","Lajpat Nagar Metro",28.5689,77.2437],["CP_METRO","Rajiv Chowk Metro",28.633,77.2192]].forEach(s => iS.run(...s));
  // Routes
  const iR = db.prepare("INSERT OR IGNORE INTO routes VALUES (?,?,?,?)");
  [["R615","Route 615","DTC","bus"],["R423","Route 423","DTC","bus"],["PINK_LINE","Pink Line Metro","DMRC","metro"]].forEach(r => iR.run(...r));
  // Trips
  const iT = db.prepare("INSERT OR IGNORE INTO trips VALUES (?,?,?,?)");
  const days = "mon,tue,wed,thu,fri,sat,sun";
  [["T615_0745","R615",days,0],["T615_0800","R615",days,0],["T615_0830","R615",days,0],["T615_0845","R615",days,0],["T615_0900","R615",days,0],["T615_R1800","R615",days,1],["T615_R1815","R615",days,1],["T615_R1845","R615",days,1],["T615_R1900","R615",days,1],["T423_0815","R423",days,0],["T423_0850","R423",days,0],["T423_R1830","R423",days,1],["METRO_PINK_0750","PINK_LINE",days,0],["METRO_PINK_0810","PINK_LINE",days,0],["METRO_PINK_R1800","PINK_LINE",days,1]].forEach(t => iT.run(...t));
  // Stop times
  const iST = db.prepare("INSERT OR IGNORE INTO stop_times (trip_id,stop_id,arrival,departure,sequence) VALUES (?,?,?,?,?)");
  [["T615_0745","LAJPAT_BUS","07:45","07:45",1],["T615_0745","RING_ROAD","07:55","07:56",2],["T615_0745","INA_MARKET","08:10","08:11",3],["T615_0745","CP_OUTER","08:28","08:28",4],["T615_0800","LAJPAT_BUS","08:00","08:00",1],["T615_0800","RING_ROAD","08:10","08:11",2],["T615_0800","INA_MARKET","08:25","08:26",3],["T615_0800","CP_OUTER","08:47","08:47",4],["T615_0830","LAJPAT_BUS","08:30","08:30",1],["T615_0830","RING_ROAD","08:40","08:41",2],["T615_0830","INA_MARKET","08:55","08:56",3],["T615_0830","CP_OUTER","09:17","09:17",4],["T615_0845","LAJPAT_BUS","08:45","08:45",1],["T615_0845","RING_ROAD","08:55","08:56",2],["T615_0845","INA_MARKET","09:10","09:11",3],["T615_0845","CP_OUTER","09:32","09:32",4],["T615_0900","LAJPAT_BUS","09:00","09:00",1],["T615_0900","RING_ROAD","09:12","09:13",2],["T615_0900","INA_MARKET","09:28","09:29",3],["T615_0900","CP_OUTER","09:50","09:50",4],["T615_R1800","CP_OUTER","18:00","18:00",1],["T615_R1800","INA_MARKET","18:20","18:21",2],["T615_R1800","RING_ROAD","18:35","18:36",3],["T615_R1800","LAJPAT_BUS","18:48","18:48",4],["T615_R1815","CP_OUTER","18:15","18:15",1],["T615_R1815","INA_MARKET","18:35","18:36",2],["T615_R1815","RING_ROAD","18:50","18:51",3],["T615_R1815","LAJPAT_BUS","19:03","19:03",4],["T615_R1845","CP_OUTER","18:45","18:45",1],["T615_R1845","INA_MARKET","19:05","19:06",2],["T615_R1845","RING_ROAD","19:20","19:21",3],["T615_R1845","LAJPAT_BUS","19:33","19:33",4],["T615_R1900","CP_OUTER","19:00","19:00",1],["T615_R1900","INA_MARKET","19:20","19:21",2],["T615_R1900","RING_ROAD","19:35","19:36",3],["T615_R1900","LAJPAT_BUS","19:48","19:48",4],["T423_0815","LAJPAT_BUS","08:15","08:15",1],["T423_0815","SAFDARJUNG","08:30","08:31",2],["T423_0815","RK_ASHRAM","08:48","08:49",3],["T423_0815","CP_OUTER","09:00","09:00",4],["T423_0850","LAJPAT_BUS","08:50","08:50",1],["T423_0850","SAFDARJUNG","09:05","09:06",2],["T423_0850","RK_ASHRAM","09:23","09:24",3],["T423_0850","CP_OUTER","09:35","09:35",4],["T423_R1830","CP_OUTER","18:30","18:30",1],["T423_R1830","RK_ASHRAM","18:42","18:43",2],["T423_R1830","SAFDARJUNG","19:00","19:01",3],["T423_R1830","LAJPAT_BUS","19:15","19:15",4],["METRO_PINK_0750","LAJPAT_METRO","07:50","07:50",1],["METRO_PINK_0750","CP_METRO","08:15","08:15",2],["METRO_PINK_0810","LAJPAT_METRO","08:10","08:10",1],["METRO_PINK_0810","CP_METRO","08:35","08:35",2],["METRO_PINK_R1800","CP_METRO","18:00","18:00",1],["METRO_PINK_R1800","LAJPAT_METRO","18:25","18:25",2]].forEach(st => iST.run(...st));
  // Fares
  const iF = db.prepare("INSERT OR IGNORE INTO fares (route_id,from_stop,to_stop,amount_inr) VALUES (?,?,?,?)");
  [["R615","LAJPAT_BUS","CP_OUTER",30],["R615","CP_OUTER","LAJPAT_BUS",30],["R423","LAJPAT_BUS","CP_OUTER",25],["R423","CP_OUTER","LAJPAT_BUS",25],["PINK_LINE","LAJPAT_METRO","CP_METRO",40],["PINK_LINE","CP_METRO","LAJPAT_METRO",40]].forEach(f => iF.run(...f));
}
