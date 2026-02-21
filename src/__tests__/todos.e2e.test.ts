import { afterEach, describe, expect, it } from 'vitest';
import app from '../app';
import { sqlite } from '../db/database';

// biome-ignore lint/suspicious/noExplicitAny: test helper
type AnyJson = any;

function req(method: string, path: string, body?: unknown) {
  return app.request(path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function json(res: Response): Promise<AnyJson> {
  return res.json();
}

// 各テスト後にテーブルをリセットする
afterEach(() => {
  sqlite.prepare('DELETE FROM todos').run();
  // AUTOINCREMENT のカウンターもリセット
  sqlite.prepare("DELETE FROM sqlite_sequence WHERE name = 'todos'").run();
});

describe('GET /api/todos', () => {
  it('Todoが存在しない場合は空配列を返す', async () => {
    const res = await req('GET', '/api/todos');

    expect(res.status).toBe(200);
    expect(await json(res)).toEqual([]);
  });

  it('作成済みの全Todoを返す', async () => {
    await req('POST', '/api/todos', { title: 'Todo 1' });
    await req('POST', '/api/todos', { title: 'Todo 2' });

    const res = await req('GET', '/api/todos');
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body.map((t: { title: string }) => t.title)).toEqual(
      expect.arrayContaining(['Todo 1', 'Todo 2']),
    );
  });

  it('completed=true でフィルタリングできる', async () => {
    await req('POST', '/api/todos', { title: '未完了Todo' });
    const createdBody = await json(await req('POST', '/api/todos', { title: '完了済みTodo' }));
    await req('PATCH', `/api/todos/${createdBody.id}`, { completed: true });

    const res = await req('GET', '/api/todos?completed=true');
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe('完了済みTodo');
    expect(body[0].completed).toBe(true);
  });

  it('completed=false でフィルタリングできる', async () => {
    await req('POST', '/api/todos', { title: '未完了Todo' });
    const createdBody = await json(await req('POST', '/api/todos', { title: '完了済みTodo' }));
    await req('PATCH', `/api/todos/${createdBody.id}`, { completed: true });

    const res = await req('GET', '/api/todos?completed=false');
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].title).toBe('未完了Todo');
    expect(body[0].completed).toBe(false);
  });
});

describe('GET /api/todos/:id', () => {
  it('指定したIDのTodoを返す', async () => {
    const createdBody = await json(
      await req('POST', '/api/todos', { title: 'テストTodo', description: '詳細テキスト' }),
    );

    const res = await req('GET', `/api/todos/${createdBody.id}`);
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      id: createdBody.id,
      title: 'テストTodo',
      description: '詳細テキスト',
      completed: false,
    });
    expect(body.created_at).toBeDefined();
    expect(body.updated_at).toBeDefined();
  });
});

describe('POST /api/todos', () => {
  it('titleだけでTodoを作成できる', async () => {
    const res = await req('POST', '/api/todos', { title: '新しいTodo' });
    const body = await json(res);

    expect(res.status).toBe(201);
    expect(body).toMatchObject({
      title: '新しいTodo',
      description: null,
      completed: false,
    });
    expect(body.id).toBeTypeOf('number');
    expect(body.created_at).toBeDefined();
    expect(body.updated_at).toBeDefined();
  });

  it('titleとdescriptionでTodoを作成できる', async () => {
    const res = await req('POST', '/api/todos', { title: 'タイトル', description: '説明文' });
    const body = await json(res);

    expect(res.status).toBe(201);
    expect(body).toMatchObject({
      title: 'タイトル',
      description: '説明文',
      completed: false,
    });
  });
});

describe('PUT /api/todos/:id', () => {
  it('Todoを全フィールド更新できる', async () => {
    const createdBody = await json(
      await req('POST', '/api/todos', { title: '元のタイトル', description: '元の説明' }),
    );

    const res = await req('PUT', `/api/todos/${createdBody.id}`, {
      title: '更新済みタイトル',
      description: '更新済み説明',
      completed: true,
    });
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      id: createdBody.id,
      title: '更新済みタイトル',
      description: '更新済み説明',
      completed: true,
    });
  });

  it('titleだけを指定して更新すると他フィールドは変わらない', async () => {
    const createdBody = await json(
      await req('POST', '/api/todos', { title: '元のタイトル', description: '元の説明' }),
    );

    const res = await req('PUT', `/api/todos/${createdBody.id}`, { title: '新しいタイトル' });
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      title: '新しいタイトル',
      description: '元の説明',
      completed: false,
    });
  });
});

describe('PATCH /api/todos/:id', () => {
  it('completedフラグだけ更新できる', async () => {
    const createdBody = await json(await req('POST', '/api/todos', { title: 'テストTodo' }));

    const res = await req('PATCH', `/api/todos/${createdBody.id}`, { completed: true });
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body.completed).toBe(true);
    expect(body.title).toBe('テストTodo');
  });

  it('descriptionをnullに更新できる', async () => {
    const createdBody = await json(
      await req('POST', '/api/todos', { title: 'テストTodo', description: '削除される説明' }),
    );

    const res = await req('PATCH', `/api/todos/${createdBody.id}`, { description: null });
    const body = await json(res);

    expect(res.status).toBe(200);
    expect(body.description).toBeNull();
    expect(body.title).toBe('テストTodo');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('Todoを削除すると204を返す', async () => {
    const createdBody = await json(await req('POST', '/api/todos', { title: '削除対象Todo' }));

    const res = await req('DELETE', `/api/todos/${createdBody.id}`);

    expect(res.status).toBe(204);
  });

  it('削除後にGETすると404になる', async () => {
    const createdBody = await json(await req('POST', '/api/todos', { title: '削除対象Todo' }));
    await req('DELETE', `/api/todos/${createdBody.id}`);

    const res = await req('GET', `/api/todos/${createdBody.id}`);

    expect(res.status).toBe(404);
  });
});
