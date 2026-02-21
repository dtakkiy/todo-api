import { type Hook, zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { Context, Env } from 'hono';
import { HttpStatus } from '../constants/httpStatus';
import { todoRepository } from '../repositories/todoRepository';
import {
  completedQuerySchema,
  createTodoSchema,
  idParamSchema,
  replaceTodoSchema,
  todoListSchema,
  todoSchema,
  updateTodoSchema,
} from '../schemas/todoSchema';

const paramErrorHandler: Hook<{ id: number }, Env, string, 'param'> = (result, c) => {
  if (!result.success) return c.json({ error: 'Invalid ID' }, HttpStatus.BAD_REQUEST);
};

const notFound = (c: Context) => c.json({ error: 'Todo not found' }, HttpStatus.NOT_FOUND);

const router = new Hono()
  .get('/', zValidator('query', completedQuerySchema), (c) => {
    const { completed } = c.req.valid('query');
    const filter = completed !== undefined ? completed === 'true' : undefined;
    return c.json(todoListSchema.parse(todoRepository.findAll(filter)));
  })
  .get('/:id', zValidator('param', idParamSchema, paramErrorHandler), (c) => {
    const { id } = c.req.valid('param');
    const todo = todoRepository.findById(id);
    if (!todo) return notFound(c);
    return c.json(todoSchema.parse(todo));
  })
  .post('/', zValidator('json', createTodoSchema), (c) => {
    const { title, description } = c.req.valid('json');
    return c.json(
      todoSchema.parse(todoRepository.create(title, description ?? null)),
      HttpStatus.CREATED,
    );
  })
  .put(
    '/:id',
    zValidator('param', idParamSchema, paramErrorHandler),
    zValidator('json', replaceTodoSchema),
    (c) => {
      const { id } = c.req.valid('param');

      const existing = todoRepository.findById(id);
      if (!existing) return notFound(c);

      return c.json(todoSchema.parse(todoRepository.replace(id, c.req.valid('json'))));
    },
  )
  .patch(
    '/:id',
    zValidator('param', idParamSchema, paramErrorHandler),
    zValidator('json', updateTodoSchema),
    (c) => {
      const { id } = c.req.valid('param');

      const existing = todoRepository.findById(id);
      if (!existing) return notFound(c);

      return c.json(todoSchema.parse(todoRepository.update(id, c.req.valid('json'), existing)));
    },
  )
  .delete('/:id', zValidator('param', idParamSchema, paramErrorHandler), (c) => {
    const { id } = c.req.valid('param');

    const deleted = todoRepository.remove(id);
    if (!deleted) return notFound(c);

    return c.body(null, HttpStatus.NO_CONTENT);
  });

export default router;
