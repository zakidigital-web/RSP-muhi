
import { drizzle } from 'drizzle-orm/libsql';
import { createClient, Client } from '@libsql/client';
import * as schema from '@/db/schema';

let cachedDb: ReturnType<typeof drizzle<Client>> | null = null;

export function getDb() {
  if (cachedDb) return cachedDb;
  const url = process.env.TURSO_CONNECTION_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error('Missing database configuration: TURSO_CONNECTION_URL/TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  }
  const client = createClient({ url, authToken });
  cachedDb = drizzle(client, { schema });
  return cachedDb;
}

export type Database = ReturnType<typeof getDb>;
