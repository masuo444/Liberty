# Liberty (リバティ)

FOMUS が構想する多言語 AI プレゼンテーション PWA「Liberty」の Next.js スターターです。ライセンスキー入力、動画プレイヤー、チャット UI、音声機能トグル、60 秒自動リセット、QR 表示といったコア UX をひととおり体感できます。

## 主な機能

- **ライセンスゲート**: 6 桁キーで機能アンロック。サンプルとして `LIB-123456`（TTS 無効）と `LIB-654321`（TTS 有効）を同梱。
- **多言語チャット UI**: 自動言語判定（ブラウザの `navigator.language`）とストリーミング表示。資料出典を付与する想定のモック実装付き。
- **動画×チャット 2 カラム**: 企業 PV とチャットを同一画面で提示。展示利用を想定したダークトーンの UI。
- **音声制御トグル**: STT/TTS のライセンス状態を反映し、トグルで状態を切り替え。
- **60 秒自動クリア**: 入力が無い場合にチャット履歴を初期化。
- **PWA 対応準備**: `manifest.json` と `next-pwa` 設定を追加済み。Vercel へそのままデプロイ可能。

## 開発を始める

```bash
npm install
npm run dev
```

`http://localhost:3000` にアクセスしてライセンスキーを入力してください。

## 環境変数

`.env.example` を参考に `.env.local` を作成し、以下を設定します。

- `OPENAI_API_KEY`: GPT-4o / File Search などに利用。
- `ELEVENLABS_API_KEY`: 音声合成（TTS）に利用。
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: 会話ログやドキュメント管理を行う場合に利用。
- `LICENSE_API_BASE`: 別管理のライセンス API に接続する場合に利用。

現在はスタブ API を使用しているため未設定でも動作します。

## API ルート構成

- `POST /api/license/verify`: ライセンスキーを検証し、利用可能な機能を返す。現在はモック実装。
- `POST /api/chat/stream`: チャット補完のストリーミング応答。OpenAI File Search + GPT-4o 連携を想定したスタブ。
- `POST /api/voice/stt`: 音声入力をテキスト化。Whisper または ElevenLabs API にフォワードする想定。
- `POST /api/voice/tts`: テキストを音声化。現在はサイレント MP3 を返すダミー。
- `POST /api/knowledge/ingest`: PDF/URL/テキストを受け取り、RAG の知識ベースに登録する想定。

## 次のステップ

1. 実 API と接続：`app/api` 以下のスタブを、FOMUS 管理サーバーや Supabase Edge Functions に置き換える。
2. RAG 実装：OpenAI File Search や pgvector を組み合わせ、`/api/chat/stream` で引用付き応答を返す。
3. 音声 I/O：`requestTranscription` / `requestSpeech` を EleventLabs / Whisper API に接続し、チャット応答の再生まで自動化。
4. Electron ラッパー：展示会向けにキオスクモードで動く Electron ランチャーを整備。

## ライセンス

MIT License
