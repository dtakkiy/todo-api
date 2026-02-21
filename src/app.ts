import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import todosRouter from './routes/todos';

const app = new Hono();

app.use(logger());
app.use('*', secureHeaders());
app.use('*', cors());

app.route('/api/todos', todosRouter);

app.all('*', (c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  if (err instanceof SyntaxError) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
