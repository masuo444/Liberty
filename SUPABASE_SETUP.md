# Supabaseセットアップガイド

このガイドでは、Libertyアプリ用のSupabaseプロジェクトを設定します。

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. プロジェクト名: `liberty` (任意)
4. データベースパスワードを設定（安全なパスワードを生成してメモ）
5. リージョン: `Tokyo (Northeast Asia)` を推奨
6. 「Create new project」をクリック

## 2. データベーステーブルの作成

1. 左サイドバーから「SQL Editor」を選択
2. 「+ New query」をクリック
3. `supabase-schema.sql` の内容を全てコピー＆ペースト
4. 「Run」をクリックしてSQLを実行

これで以下のテーブルが作成されます：
- `companies` - 企業情報
- `licenses` - ライセンス情報
- `usage_logs` - 利用ログ

## 3. API認証情報の取得

### 3.1 プロジェクトURL
1. 左サイドバーの「Project Settings」（歯車アイコン）をクリック
2. 「API」タブを選択
3. 「Project URL」をコピー
   - 例: `https://abcdefghijk.supabase.co`

### 3.2 Anon Key（公開鍵）
1. 同じ「API」タブ内の「Project API keys」セクション
2. 「anon public」キーをコピー
   - `eyJ...` で始まる長い文字列

### 3.3 Service Role Key（秘密鍵）
1. 同じセクション内の「service_role」キーを表示
2. **注意**: このキーは秘密にして、サーバーサイドでのみ使用
3. キーをコピー

## 4. 環境変数の設定

### ローカル開発環境

`.env.local` ファイルを作成（既に存在する場合は追記）：

```bash
# OpenAI API（既存）
OPENAI_API_KEY=sk-...

# Supabase（新規追加）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional: グローバルAssistant ID
OPENAI_ASSISTANT_ID=asst_...
```

### Vercel本番環境

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」
3. 以下の変数を追加：

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |
| `OPENAI_API_KEY` | `sk-...` |
| `OPENAI_ASSISTANT_ID` | `asst_...` （オプション） |

## 5. 初期データの確認

SQLエディタで以下のクエリを実行して、サンプルデータが作成されたか確認：

```sql
-- 企業一覧
SELECT * FROM companies;

-- ライセンス一覧
SELECT * FROM licenses;
```

デフォルトで以下が作成されているはずです：
- 企業: FOMUS株式会社
- ライセンスキー: `LIBERTY-DEMO-2024-FOMUS`
- 有効期限: 2026年12月31日

## 6. Row Level Security (RLS) の設定（オプション）

セキュリティを強化する場合は、RLSを有効化します：

```sql
-- companiesテーブルのRLS有効化
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Service Roleキーからのアクセスを許可（サーバーサイドのみ）
CREATE POLICY "Service role can do anything" ON companies
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can do anything" ON licenses
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can do anything" ON usage_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

## 7. 動作確認

1. ローカル開発サーバーを起動：
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` を開く

3. ライセンスキー `LIBERTY-DEMO-2024-FOMUS` でログイン

4. Supabaseダッシュボードで「Table Editor」→「usage_logs」を確認
   - ログインログが記録されているはず

5. 知識ファイルをアップロードしてみる
   - 企業別のVector Storeが自動作成される
   - `companies`テーブルの`openai_vector_store_id`に保存される

## トラブルシューティング

### エラー: "Supabase環境変数が設定されていません"

- `.env.local` に正しく環境変数が設定されているか確認
- サーバーを再起動（`Ctrl+C` → `npm run dev`）

### エラー: "relation 'companies' does not exist"

- SQLスキーマが正しく実行されたか確認
- Supabaseダッシュボードの「Table Editor」でテーブルの存在を確認

### ライセンスが認証されない

- `licenses`テーブルでライセンスキーを確認
- `is_active = true` であることを確認
- `expires_at` が未来の日付であることを確認

## 次のステップ

- 管理者ダッシュボード (`/admin`) でライセンスを管理
- 新しい企業とライセンスを追加
- 利用統計を確認
