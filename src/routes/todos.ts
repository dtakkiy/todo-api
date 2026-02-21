import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HttpStatus } from '../constants/httpStatus';
import { todoRepository } from '../repositories/todoRepository';
import { createTodoSchema, updateTodoSchema } from '../schemas/todoSchema';

const parseId = (raw: string): number | null => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const router = new Hono()
  .get('/', (c) => {
    const completed = c.req.query('completed');
    const filter = completed === 'true' ? true : completed === 'false' ? false : undefined;
    return c.json(todoRepository.findAll(filter));
  })
  .get('/:id', (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, HttpStatus.BAD_REQUEST);

    const todo = todoRepository.findById(id);
    if (!todo) return c.json({ error: 'Todo not found' }, HttpStatus.NOT_FOUND);

    return c.json(todo);
  })
  .post('/', zValidator('json', createTodoSchema), (c) => {
    const { title, description } = c.req.valid('json');
    return c.json(todoRepository.create(title, description ?? null), HttpStatus.CREATED);
  })
  .put('/:id', zValidator('json', updateTodoSchema), (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, HttpStatus.BAD_REQUEST);

    const existing = todoRepository.findById(id);
    if (!existing) return c.json({ error: 'Todo not found' }, HttpStatus.NOT_FOUND);

    return c.json(todoRepository.update(id, c.req.valid('json'), existing));
  })
  .patch('/:id', zValidator('json', updateTodoSchema), (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, HttpStatus.BAD_REQUEST);

    const existing = todoRepository.findById(id);
    if (!existing) return c.json({ error: 'Todo not found' }, HttpStatus.NOT_FOUND);

    return c.json(todoRepository.update(id, c.req.valid('json'), existing));
  })
  .delete('/:id', (c) => {
    const id = parseId(c.req.param('id'));
    if (id === null) return c.json({ error: 'Invalid ID' }, HttpStatus.BAD_REQUEST);

    const deleted = todoRepository.remove(id);
    if (!deleted) return c.json({ error: 'Todo not found' }, HttpStatus.NOT_FOUND);

    return c.body(null, HttpStatus.NO_CONTENT);
  });

export default router;
