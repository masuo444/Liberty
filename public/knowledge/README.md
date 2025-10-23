# 📚 知識Box（Knowledge Base）

このフォルダにAIが学習する資料を配置します。

## 📁 フォルダ構造

```
public/knowledge/
├── documents/     # PDFファイルなどのドキュメント
│   ├── company-profile.pdf
│   ├── product-catalog.pdf
│   └── faq.pdf
└── data/          # テキストファイルやJSONデータ
    ├── about.txt
    ├── products.json
    └── history.txt
```

## 📄 対応ファイル形式（実装予定）

### 現在対応予定の形式

- **PDF** (.pdf) - 商品カタログ、会社案内、マニュアルなど
- **テキスト** (.txt, .md) - FAQ、説明文など
- **JSON** (.json) - 構造化されたデータ
- **URL** - ウェブサイトのコンテンツを自動取得

## 🎯 使い方

### ステップ1: ファイルを配置

以下のフォルダに資料ファイルをコピーします：

```bash
# PDFファイルの場合
public/knowledge/documents/

# テキストファイルの場合
public/knowledge/data/
```

### ステップ2: APIでインデックス作成（実装予定）

ファイルを配置した後、管理画面から「知識を更新」ボタンを押すか、
以下のAPIを呼び出してAIに学習させます：

```bash
POST /api/knowledge/ingest
{
  "title": "商品カタログ",
  "type": "pdf",
  "path": "/knowledge/documents/product-catalog.pdf"
}
```

### ステップ3: AIが自動的に参照

チャットでユーザーが質問すると、AIが知識Boxの内容を検索して、
正確な情報をもとに回答します。

## 🔧 技術仕様

### 使用予定の技術

- **OpenAI File Search API** - PDFやドキュメントの内容を理解
- **Vector Database** - 高速な検索のためのベクトルインデックス
- **Supabase Storage** - ファイルの永続化（オプション）

### 現在の実装状況

⚠️ **注意**: 現在はモック実装です。実際の知識検索機能は開発中です。

- ✅ APIエンドポイント作成済み (`/api/knowledge/ingest`)
- 🔜 OpenAI File Search API統合
- 🔜 PDFアップロード機能
- 🔜 URLからのコンテンツ取得
- 🔜 管理画面UI

## 📝 サンプルファイル

### サンプル: `about.txt`

```txt
私たちは、伝統的な日本酒造りを守りながら、
世界中の人々に日本の文化を伝えることを使命としています。

創業: 1850年
所在地: 新潟県
主な商品: 純米大吟醸「雪月花」、本醸造「越後の誉」

おすすめの飲み方:
- 冷酒: 5-10℃で香りを楽しむ
- 常温: 米の旨味を感じる
- 燗酒: 40℃で深い味わい
```

### サンプル: `products.json`

```json
{
  "products": [
    {
      "name": "純米大吟醸「雪月花」",
      "price": "5000円",
      "description": "新潟県産コシヒカリを50%まで磨いた最高級酒",
      "alcohol": "16%",
      "recommended": "冷酒"
    },
    {
      "name": "本醸造「越後の誉」",
      "price": "2000円",
      "description": "毎日楽しめる飲み飽きしない味わい",
      "alcohol": "15%",
      "recommended": "常温または燗"
    }
  ]
}
```

## 🚀 今後の機能

1. **ドラッグ&ドロップアップロード** - ブラウザから簡単にファイル追加
2. **自動更新** - ファイルが変更されたら自動的に再インデックス
3. **引用表示** - AIの回答にどの資料から引用したか表示
4. **多言語対応** - 日本語の資料から英語で質問しても回答可能

---

## 💡 ヒント

- ファイルサイズは1ファイル10MB以下を推奨
- PDFは文字情報が含まれているもの（画像PDFは要OCR処理）
- 定期的に内容を更新してAIの回答精度を向上
