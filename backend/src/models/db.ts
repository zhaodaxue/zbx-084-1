import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../data/water.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    await initDb(db);
  }
  return db;
}

async function initDb(database: Database): Promise<void> {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS water_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      station_id TEXT NOT NULL,
      turbidity_ntu REAL NOT NULL,
      ph REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_date_station ON water_records (date, station_id);
  `);

  await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_station ON water_records (station_id);
  `);
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}
