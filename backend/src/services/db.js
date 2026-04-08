import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

let db;

function runMigrations(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      clan_id TEXT DEFAULT 'Pulse United',
      card_tier TEXT DEFAULT 'Bronze',
      xp_total INTEGER DEFAULT 0,
      profile_picture TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      pace INTEGER DEFAULT 60,
      shooting INTEGER DEFAULT 60,
      passing INTEGER DEFAULT 60,
      dribbling INTEGER DEFAULT 60,
      defense INTEGER DEFAULT 60,
      physical INTEGER DEFAULT 60,
      weekly_gain INTEGER DEFAULT 0,
      last_activity_timestamp TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exercise_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      duration_minutes INTEGER,
      reps INTEGER,
      proof_text TEXT,
      ai_confidence REAL NOT NULL,
      ai_verdict TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);
}

export function connectDb() {
  const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'backend', 'data', 'rise-tempo.sqlite');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  runMigrations(db);
  console.log(`SQLite connected at ${dbPath}`);
  return db;
}

export function getDb() {
  if (!db) return connectDb();
  return db;
}
