import fs from 'fs';
import path from 'path';
import { config } from './config';

interface Store {
  seenVideoIds: string[];
}

let store: Store = { seenVideoIds: [] };
let storePath: string;

export function initDb(): void {
  storePath = path.resolve(config.databasePath);
  const dir = path.dirname(storePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(storePath)) {
    store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  } else {
    persist();
  }

  console.log(`[DB] Initialized at ${storePath} (${store.seenVideoIds.length} videos seen)`);
}

function persist(): void {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function isVideoSeen(videoId: string): boolean {
  return store.seenVideoIds.includes(videoId);
}

export function markVideoSeen(videoId: string): void {
  if (!store.seenVideoIds.includes(videoId)) {
    store.seenVideoIds.push(videoId);
    persist();
  }
}

export function isFirstRun(): boolean {
  return store.seenVideoIds.length === 0;
}
