export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  price?: string;
  image?: string;
  brochureUrl?: string;
}

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Liberty AI Platform',
    category: 'AIソフトウェア',
    description: '多言語対応の次世代AIプレゼンテーションプラットフォーム。音声認識、テキスト生成、知識ベース統合により、世界中の顧客とのコミュニケーションを革新します。',
    features: [
      '28言語対応の音声認識・音声合成',
      'OpenAI GPT-4による高精度な回答',
      'ドラッグ&ドロップで簡単な知識登録',
      '動画ライブラリとチャットの統合',
      'PWA対応でオフラインでも動作',
    ],
    specifications: [
      { label: '対応言語', value: '28言語（日本語、英語、中国語など）' },
      { label: 'AI モデル', value: 'GPT-4o' },
      { label: 'プラットフォーム', value: 'Web（PWA対応）' },
      { label: '動作環境', value: 'Chrome, Edge, Safari' },
    ],
    price: 'お問い合わせください',
    image: '/companion-character.png',
  },
  {
    id: '2',
    name: 'コンパニオンモード',
    category: '音声AIアシスタント',
    description: '音声で対話できるAIコンパニオン。展示会やショールームで来場者との自然な会話を実現します。',
    features: [
      '音声による自然な対話',
      'リアルタイム音声認識',
      'キャラクターアニメーション',
      '会話履歴の自動記録',
      'カスタマイズ可能なキャラクター',
    ],
    specifications: [
      { label: '音声認識', value: 'Web Speech API' },
      { label: '音声合成', value: 'TTS対応' },
      { label: '応答速度', value: '平均2-3秒' },
      { label: 'カスタマイズ', value: 'キャラクター画像変更可能' },
    ],
    price: '月額 ¥50,000〜',
  },
  {
    id: '3',
    name: '知識Box管理システム',
    category: 'ナレッジマネジメント',
    description: '企業の知識を一元管理し、AIが自動的に学習。チャットボットが適切な情報を瞬時に提供します。',
    features: [
      '複数ファイル一括アップロード',
      'PDF、テキスト、Markdown対応',
      'ドラッグ&ドロップ対応',
      'OpenAI Vector Store統合',
      '高速検索とセマンティック検索',
    ],
    specifications: [
      { label: '対応形式', value: 'PDF, TXT, MD, JSON' },
      { label: 'ファイルサイズ', value: '最大10MB/ファイル' },
      { label: '同時アップロード', value: '無制限' },
      { label: 'ストレージ', value: 'クラウドベース' },
    ],
    price: '基本料金に含まれる',
  },
  {
    id: '4',
    name: '動画ライブラリ',
    category: 'コンテンツ管理',
    description: '最大10本の動画を管理・配信。フルスクリーン再生とスムーズなナビゲーションで、製品やサービスを魅力的に紹介します。',
    features: [
      '10動画まで登録可能',
      'フルスクリーンモーダル',
      'キーボードショートカット対応',
      'サムネイルナビゲーション',
      '自動再生機能',
    ],
    specifications: [
      { label: '動画数', value: '最大10本' },
      { label: '対応形式', value: 'MP4, WebM' },
      { label: '解像度', value: 'フルHD対応' },
      { label: '操作', value: 'キーボード/マウス/タッチ' },
    ],
    price: '基本料金に含まれる',
  },
  {
    id: '5',
    name: '多言語チャットボット',
    category: 'カスタマーサポート',
    description: '世界中の顧客と母国語でコミュニケーション。28言語に対応し、リアルタイムで自動翻訳・応答します。',
    features: [
      '28言語のリアルタイム対応',
      'ストリーミングレスポンス',
      '会話履歴の保持',
      '引用ソースの表示',
      '自動リセット機能',
    ],
    specifications: [
      { label: '対応言語', value: '28言語' },
      { label: '応答形式', value: 'ストリーミング' },
      { label: '会話保持', value: '60秒間のアイドル時間' },
      { label: 'カスタマイズ', value: 'プロンプト調整可能' },
    ],
    price: '従量課金制',
  },
];
