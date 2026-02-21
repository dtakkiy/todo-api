import path from 'node:path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

dotenv.config();

const DB_PATH = process.env.DB_PATH ?? './todos.db';

export const sqlite =
  DB_PATH === ':memory:' ? new Database(':memory:') : new Database(path.resolve(DB_PATH));

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
migrate(db, { migrationsFolder: path.resolve(__dirname, '../../drizzle') });

export default db;
