import { desc, eq, sql } from 'drizzle-orm';
import type { Context } from 'hono';
import db from '../db/database';
import { type TodoRow, todos } from '../db/schema';
import { createTodoSchema, updateTodoSchema } from '../schemas/todoSchema';

const parseId = (raw: string): number | null => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const getAllTodos = (c: Context): Response => {
  const completed = c.req.query('completed');

  const query = db.select().from(todos);

  if (completed === 'true') {
    return c.json(query.where(eq(todos.completed, true)).orderBy(desc(todos.created_at)).all());
  }
  if (completed === 'false') {
    return c.json(query.where(eq(todos.completed, false)).orderBy(desc(todos.created_at)).all());
  }
  return c.json(query.orderBy(desc(todos.created_at)).all());
};

export const getTodoById = (c: Context): Response => {
  const id = parseId(c.req.param('id'));
  if (id === null) {
    return c.json({ error: 'Invalid ID' }, 400);
  }
  const row = db.select().from(todos).where(eq(todos.id, id)).get();

  if (!row) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json(row);
};

export const createTodo = async (c: Context): Promise<Response> => {
  const body = await c.req.json();
  const result = createTodoSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: 'Validation failed', details: result.error.flatten() }, 400);
  }

  const { title, description } = result.data;
  const rows = db
    .insert(todos)
    .values({ title, description: description ?? null })
    .returning()
    .all();

  return c.json(rows[0], 201);
};

export const updateTodo = async (c: Context): Promise<Response> => {
  const id = parseId(c.req.param('id'));
  if (id === null) {
    return c.json({ error: 'Invalid ID' }, 400);
  }
  const existing = db.select().from(todos).where(eq(todos.id, id)).get();

  if (!existing) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  const body = await c.req.json();
  const result = updateTodoSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: 'Validation failed', details: result.error.flatten() }, 400);
  }

  const data = result.data;
  const rows = db
    .update(todos)
    .set({
      title: data.title ?? existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      completed: data.completed !== undefined ? data.completed : existing.completed,
      updated_at: sql`(datetime('now'))`,
    })
    .where(eq(todos.id, id))
    .returning()
    .all();

  return c.json(rows[0]);
};

export const patchTodo = async (c: Context): Promise<Response> => {
  return updateTodo(c);
};

export const deleteTodo = (c: Context): Response => {
  const id = parseId(c.req.param('id'));
  if (id === null) {
    return c.json({ error: 'Invalid ID' }, 400);
  }
  const info = db.delete(todos).where(eq(todos.id, id)).run();

  if (info.changes === 0) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.body(null, 204);
};
