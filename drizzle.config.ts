
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

const dbConfig: Config = defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: (process.env.TURSO_CONNECTION_URL ?? process.env.TURSO_DATABASE_URL)!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

export default dbConfig;
