import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
dotenv.config();

export default defineConfig({
  schema: './src/infrastructure/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: { url: process.env.DB_PATH ?? './todos.db' },
});
