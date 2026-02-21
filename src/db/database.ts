import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

const DB_PATH = process.env.DB_PATH ?? './todos.db';

let sqlite: Database.Database;
try {
  sqlite = DB_PATH === ':memory:' ? new Database(':memory:') : new Database(path.resolve(DB_PATH));
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
} catch (err) {
  console.error('Database initialization failed:', err);
  process.exit(1);
}

export { sqlite };

export const db = drizzle(sqlite, { schema });
try {
  migrate(db, {
    migrationsFolder: process.env.MIGRATIONS_PATH ?? path.join(process.cwd(), 'drizzle'),
  });
} catch (err) {
  console.error('Migration failed:', err);
  process.exit(1);
}

export default db;
