import { desc, eq, sql } from 'drizzle-orm';
import db from '../infrastructure/database';
import { type TodoRow, todos } from '../infrastructure/schema';

type UpdateInput = {
  title?: string;
  description?: string | null;
  completed?: boolean;
};

export const todoRepository = {
  findAll(completed?: boolean): TodoRow[] {
    const query = db.select().from(todos);
    if (completed === true) {
      return query.where(eq(todos.completed, true)).orderBy(desc(todos.created_at)).all();
    }
    if (completed === false) {
      return query.where(eq(todos.completed, false)).orderBy(desc(todos.created_at)).all();
    }
    return query.orderBy(desc(todos.created_at)).all();
  },

  findById(id: number): TodoRow | undefined {
    return db.select().from(todos).where(eq(todos.id, id)).get();
  },

  create(title: string, description: string | null): TodoRow {
    return db.insert(todos).values({ title, description }).returning().all()[0];
  },

  update(id: number, data: UpdateInput, existing: TodoRow): TodoRow {
    return db
      .update(todos)
      .set({
        title: data.title ?? existing.title,
        description: data.description !== undefined ? data.description : existing.description,
        completed: data.completed !== undefined ? data.completed : existing.completed,
        updated_at: sql`(datetime('now'))`,
      })
      .where(eq(todos.id, id))
      .returning()
      .all()[0];
  },

  replace(
    id: number,
    data: { title: string; description?: string | null; completed?: boolean },
  ): TodoRow {
    return db
      .update(todos)
      .set({
        title: data.title,
        description: data.description ?? null,
        completed: data.completed ?? false,
        updated_at: sql`(datetime('now'))`,
      })
      .where(eq(todos.id, id))
      .returning()
      .all()[0];
  },

  remove(id: number): boolean {
    const info = db.delete(todos).where(eq(todos.id, id)).run();
    return info.changes > 0;
  },
};
