import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './config';

let db: Database.Database;

export function initDb(): void {
  const dbPath = path.resolve(config.databasePath);
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[DB] Created data directory: ${dir}`);
  }

  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS seen_videos (
      video_id   TEXT PRIMARY KEY,
      title      TEXT,
      published_at TEXT,
      notified_at  TEXT
    )
  `);

  console.log(`[DB] Initialized at ${dbPath}`);
}

export function isVideoSeen(videoId: string): boolean {
  const row = db.prepare('SELECT 1 FROM seen_videos WHERE video_id = ?').get(videoId);
  return row !== undefined;
}

export function markVideoSeen(videoId: string, title: string, publishedAt: string, notified: boolean): void {
  db.prepare(`
    INSERT OR IGNORE INTO seen_videos (video_id, title, published_at, notified_at)
    VALUES (?, ?, ?, ?)
  `).run(videoId, title, publishedAt, notified ? new Date().toISOString() : null);
}

export function isFirstRun(): boolean {
  const row = db.prepare('SELECT COUNT(*) as count FROM seen_videos').get() as { count: number };
  return row.count === 0;
}
