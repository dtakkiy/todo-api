import type { Context } from 'hono';
import { todoRepository } from '../repositories/todoRepository';
import { createTodoSchema, updateTodoSchema } from '../schemas/todoSchema';

const parseId = (raw: string): number | null => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export const getAllTodos = (c: Context): Response => {
  const completed = c.req.query('completed');
  const filter = completed === 'true' ? true : completed === 'false' ? false : undefined;
  return c.json(todoRepository.findAll(filter));
};

export const getTodoById = (c: Context): Response => {
  const id = parseId(c.req.param('id'));
  if (id === null) return c.json({ error: 'Invalid ID' }, 400);

  const todo = todoRepository.findById(id);
  if (!todo) return c.json({ error: 'Todo not found' }, 404);

  return c.json(todo);
};

export const createTodo = async (c: Context): Promise<Response> => {
  const body = await c.req.json();
  const result = createTodoSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: 'Validation failed', details: result.error.flatten() }, 400);
  }

  const { title, description } = result.data;
  return c.json(todoRepository.create(title, description ?? null), 201);
};

export const updateTodo = async (c: Context): Promise<Response> => {
  const id = parseId(c.req.param('id'));
  if (id === null) return c.json({ error: 'Invalid ID' }, 400);

  const existing = todoRepository.findById(id);
  if (!existing) return c.json({ error: 'Todo not found' }, 404);

  const body = await c.req.json();
  const result = updateTodoSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: 'Validation failed', details: result.error.flatten() }, 400);
  }

  return c.json(todoRepository.update(id, result.data, existing));
};

export const patchTodo = async (c: Context): Promise<Response> => {
  return updateTodo(c);
};

export const deleteTodo = (c: Context): Response => {
  const id = parseId(c.req.param('id'));
  if (id === null) return c.json({ error: 'Invalid ID' }, 400);

  const deleted = todoRepository.remove(id);
  if (!deleted) return c.json({ error: 'Todo not found' }, 404);

  return c.body(null, 204);
};
