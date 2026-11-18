import fs from 'node:fs';
import path from 'node:path';
import type { Response } from 'express';
import { createInitialDatabase } from './seed.ts';
import type { DbActivityLog, VeloraDatabase } from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'velora-db.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let cachedDb: VeloraDatabase | null = null;
const sseClients = new Set<Response>();

function ensureDirectories(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function getDatabase(): VeloraDatabase {
  if (cachedDb) return cachedDb;
  ensureDirectories();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw) as VeloraDatabase;
      if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.orders)) {
        cachedDb = parsed;
        return cachedDb;
      }
    } catch (err) {
      console.error('Failed to read existing database, re-seeding:', err);
    }
  }
  cachedDb = createInitialDatabase();
  saveDatabase(cachedDb);
  return cachedDb;
}

export function saveDatabase(db: VeloraDatabase): void {
  ensureDirectories();
  cachedDb = db;
  const tmpPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_FILE);
}

export function logActivity(
  db: VeloraDatabase,
  entry: Omit<DbActivityLog, 'id' | 'createdAt'>
): void {
  db.activityLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  if (db.activityLogs.length > 250) {
    db.activityLogs = db.activityLogs.slice(0, 250);
  }
}

export function subscribeSseClient(res: Response): () => void {
  sseClients.add(res);
  return () => {
    sseClients.delete(res);
  };
}

export function broadcastEvent(event: string, payload: Record<string, unknown> = {}): void {
  const data = JSON.stringify({ event, timestamp: Date.now(), ...payload });
  for (const client of sseClients) {
    try {
      client.write(`event: ${event}\ndata: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}
