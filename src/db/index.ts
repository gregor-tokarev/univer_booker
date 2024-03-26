import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';

if (!process.env.DATABASE_URL) {
  throw new Error("No DATABASE_URL env variable")
}

export const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_TOKEN });

export const db = drizzle(client);
