import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { HttpStatus } from './constants/httpStatus';
import todosRouter from './routes/todos';

const app = new Hono();

app.use(logger());
app.use('*', secureHeaders());
app.use('*', cors());

app.route('/api/todos', todosRouter);

app.all('*', (c) => c.json({ error: 'Not found' }, HttpStatus.NOT_FOUND));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error(err);
  return c.json({ error: 'Internal server error' }, HttpStatus.INTERNAL_SERVER_ERROR);
});

export type AppType = typeof app;
export default app;
