# Todo API

Hono + TypeScript + SQLite の Todo REST API。

## 使用技術

- **ランタイム**: Node.js
- **フレームワーク**: Hono
- **言語**: TypeScript
- **データベース**: SQLite
- **ORM**: Drizzle ORM
- **バリデーション**: Zod
- **パッケージマネージャー**: pnpm
- **リンター / フォーマッター**: Biome
- **テスト**: Vitest
- **Git フック**: Husky

## セットアップ

```bash
pnpm install
```

`.env` を作成:

```env
PORT=3000
DB_PATH=./todos.db
```

## 起動

```bash
pnpm dev    # 開発
pnpm build  # ビルド
pnpm start  # 本番
```

## Hono RPC

API の型定義をクライアント側で利用できます。

```ts
import { hc } from 'hono/client';
import type { AppType } from '@/api/app'; // サーバー側の app.ts を参照

const client = hc<AppType>('http://localhost:3000');

// 型安全なリクエスト
const res = await client.api.todos.$get();
const todos = await res.json();

const created = await client.api.todos.$post({
  json: { title: 'Buy milk' },
});
```

エンドポイントの追加・変更はサーバー側の型定義がクライアントに即時反映されます。

## エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/todos` | 一覧取得 (`?completed=true/false`) |
| GET | `/api/todos/:id` | 1件取得 |
| POST | `/api/todos` | 作成 |
| PUT | `/api/todos/:id` | 更新 |
| PATCH | `/api/todos/:id` | 部分更新 |
| DELETE | `/api/todos/:id` | 削除 |
