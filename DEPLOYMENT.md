# Liberty PWA - デプロイ手順書

このドキュメントは、Liberty AIチャットアプリケーションをVercelにデプロイし、スマートフォンにインストール可能なPWA（Progressive Web App）として公開する手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubでサインアップ可能）
- 必要な環境変数の値
  - OpenAI API Key
  - Supabase認証情報
  - ElevenLabs API Key（プレミアム音声機能を使用する場合）
  - 管理者パスワード

## 🚀 デプロイ手順

### 1. GitHubリポジトリの作成

1. GitHubにログイン
2. 新しいリポジトリを作成
   - リポジトリ名: `liberty-pwa`（任意）
   - プライベートリポジトリを推奨
   - README、.gitignore、ライセンスは不要（既存のファイルを使用）

### 2. ローカルリポジトリをGitHubにプッシュ

ターミナルでプロジェクトディレクトリに移動し、以下を実行：

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/liberty-pwa.git

# ブランチ名をmainに設定
git branch -M main

# すべてのファイルを追加
git add .

# コミット
git commit -m "Initial commit: Liberty PWA"

# GitHubにプッシュ
git push -u origin main
```

### 3. Vercelでプロジェクトをインポート

1. [Vercel](https://vercel.com)にアクセスし、GitHubアカウントでログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリ一覧から `liberty-pwa` を選択
4. 「Import」をクリック

### 4. 環境変数の設定

プロジェクトの設定画面で、以下の環境変数を追加：

#### 必須の環境変数

```
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 管理者認証
ADMIN_PASSWORD=your-secure-password

# Node環境
NODE_ENV=production
```

#### オプションの環境変数

```
# ElevenLabs（プレミアム音声機能）
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### 5. デプロイ

1. 環境変数設定後、「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（約3-5分）
3. デプロイ完了後、URLが発行されます
   - 例: `https://liberty-pwa.vercel.app`

## 📱 PWAとしてスマートフォンにインストール

### iPhoneの場合

1. Safariブラウザで `https://your-app.vercel.app` にアクセス
2. 画面下部の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」をタップ
4. アプリ名を確認して「追加」をタップ
5. ホーム画面にLibertyアイコンが追加されます

### Androidの場合

1. Chrome ブラウザで `https://your-app.vercel.app` にアクセス
2. 画面右上のメニュー（⋮）をタップ
3. 「ホーム画面に追加」または「アプリをインストール」をタップ
4. 「インストール」をタップ
5. ホーム画面にLibertyアイコンが追加されます

## 🔄 更新とデプロイ

コードを更新した場合、以下の手順で再デプロイ：

```bash
# 変更をコミット
git add .
git commit -m "Update: 変更内容の説明"

# GitHubにプッシュ
git push origin main
```

GitHubにプッシュすると、Vercelが自動的に再ビルド・再デプロイを実行します。

## ⚙️ ビルドの設定

Vercelプロジェクト設定で以下が自動検出されます：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x以上

## 🔒 環境変数の更新

環境変数を更新する場合：

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Environment Variables」に移動
3. 変更したい変数を編集
4. 「Redeploy」タブから最新のデプロイメントを再デプロイ

## 🐛 トラブルシューティング

### ビルドエラーが発生する場合

1. ローカルで `npm run build` を実行し、エラーを確認
2. 環境変数が正しく設定されているか確認
3. `package.json` の依存関係が最新か確認

### PWAがインストールできない場合

1. HTTPSでアクセスしているか確認（Vercelは自動的にHTTPS）
2. Service Workerが正しく登録されているか確認
   - ブラウザの開発者ツール → Application → Service Workers
3. `manifest.json` が正しく読み込まれているか確認

### 音声機能が動作しない場合

1. ブラウザでマイク・スピーカーのアクセス許可を確認
2. HTTPSでアクセスしているか確認（音声APIはHTTPS必須）
3. OpenAI API / ElevenLabs APIキーが正しく設定されているか確認

## 📊 パフォーマンス監視

Vercelダッシュボードで以下を監視できます：

- デプロイメント履歴
- ビルド時間
- パフォーマンスメトリクス
- アクセスログ
- エラーログ

## 🔐 セキュリティ

- 環境変数は必ずVercelの環境変数設定を使用（コードにハードコードしない）
- 管理者パスワードは強力なものを使用
- Supabase Service Role Keyは絶対にクライアントサイドで使用しない
- 本番環境では必ずHTTPSを使用

## 📝 デプロイ後のチェックリスト

- [ ] PWAがスマートフォンにインストールできることを確認
- [ ] ライセンス認証が機能することを確認
- [ ] チャット機能が動作することを確認
- [ ] 音声入出力（TTS/STT）が動作することを確認
- [ ] 管理ダッシュボードにログインできることを確認
- [ ] ライセンス作成・編集ができることを確認
- [ ] 知識ベースのアップロードが機能することを確認

## 🌐 カスタムドメインの設定（オプション）

1. Vercelダッシュボードで「Settings」→「Domains」に移動
2. カスタムドメインを追加（例: `liberty.fomus.jp`）
3. DNSレコードを設定（VercelのUIに表示される手順に従う）
4. SSL証明書が自動的に発行されます

## 💡 運用のヒント

- 定期的にログを確認し、エラーを監視
- 使用量に応じてOpenAI APIの制限を調整
- Supabaseの無料枠の制限に注意
- PWAのキャッシュ戦略を定期的に見直し

---

## 📞 サポート

問題が発生した場合：

1. Vercelのビルドログを確認
2. ブラウザの開発者ツールでエラーを確認
3. 環境変数が正しく設定されているか再確認

以上でデプロイは完了です。Liberty PWAをお楽しみください！
