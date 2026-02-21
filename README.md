# Todo API

Express + TypeScript + SQLite の Todo REST API。

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

## エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | `/api/todos` | 一覧取得 (`?completed=true/false`) |
| GET | `/api/todos/:id` | 1件取得 |
| POST | `/api/todos` | 作成 |
| PUT | `/api/todos/:id` | 更新 |
| PATCH | `/api/todos/:id` | 部分更新 |
| DELETE | `/api/todos/:id` | 削除 |
