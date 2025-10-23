/**
 * よく聞かれる質問（FAQ）のデータ
 * オフラインでも即座に回答できるように事前定義
 */

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'product' | 'support' | 'other';
  locale: string;
};

// 日本語FAQ
const jaFAQs: FAQ[] = [
  {
    id: 'ja-1',
    question: 'この製品の特徴は何ですか？',
    answer: 'この製品は、AI技術を活用した高度なコミュニケーションツールです。音声認識、自然言語処理、音声合成などの最新技術を組み合わせ、スムーズな対話体験を提供します。',
    category: 'product',
    locale: 'ja',
  },
  {
    id: 'ja-2',
    question: '利用料金はいくらですか？',
    answer: 'ライセンス形態によって異なります。詳細な料金プランについては、管理者にお問い合わせください。企業向けカスタマイズプランもご用意しております。',
    category: 'general',
    locale: 'ja',
  },
  {
    id: 'ja-3',
    question: 'オフラインでも使えますか？',
    answer: 'よく聞かれる質問については、オフラインでも即座に回答できます。ただし、知識ベースを活用した詳細な回答や、最新情報については、オンライン接続が必要です。',
    category: 'support',
    locale: 'ja',
  },
  {
    id: 'ja-4',
    question: 'サポート窓口はありますか？',
    answer: 'はい、専用のサポート窓口をご用意しております。技術的な質問やトラブルシューティングについては、メールまたはチャットサポートをご利用ください。',
    category: 'support',
    locale: 'ja',
  },
  {
    id: 'ja-5',
    question: 'どんな機能がありますか？',
    answer: 'チャット機能、音声会話、動画生成、コンパニオンモード、知識ベース検索など、多彩な機能を搭載しています。ライセンスによって利用可能な機能が異なります。',
    category: 'product',
    locale: 'ja',
  },
];

// 英語FAQ
const enFAQs: FAQ[] = [
  {
    id: 'en-1',
    question: 'What are the key features?',
    answer: 'This product is an advanced communication tool powered by AI technology. It combines voice recognition, natural language processing, and speech synthesis to provide a seamless conversational experience.',
    category: 'product',
    locale: 'en',
  },
  {
    id: 'en-2',
    question: 'How much does it cost?',
    answer: 'Pricing varies depending on the license type. Please contact your administrator for detailed pricing plans. We also offer customized enterprise plans.',
    category: 'general',
    locale: 'en',
  },
  {
    id: 'en-3',
    question: 'Can I use it offline?',
    answer: 'Yes, frequently asked questions can be answered instantly even offline. However, detailed answers using the knowledge base and the latest information require an online connection.',
    category: 'support',
    locale: 'en',
  },
  {
    id: 'en-4',
    question: 'Is there support available?',
    answer: 'Yes, we provide dedicated support. For technical questions and troubleshooting, please use our email or chat support services.',
    category: 'support',
    locale: 'en',
  },
  {
    id: 'en-5',
    question: 'What features are available?',
    answer: 'We offer various features including chat, voice conversation, video generation, companion mode, and knowledge base search. Available features vary by license type.',
    category: 'product',
    locale: 'en',
  },
];

/**
 * ロケールに応じたFAQを取得
 */
export function getFAQsByLocale(locale: string): FAQ[] {
  const localePrefix = locale.split('-')[0];

  switch (localePrefix) {
    case 'ja':
      return jaFAQs;
    case 'en':
      return enFAQs;
    default:
      return enFAQs; // デフォルトは英語
  }
}

/**
 * カテゴリ別にFAQをグループ化
 */
export function groupFAQsByCategory(faqs: FAQ[]): Record<string, FAQ[]> {
  return faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);
}

/**
 * カテゴリ名の翻訳
 */
export function getCategoryLabel(category: string, locale: string): string {
  const localePrefix = locale.split('-')[0];

  const translations: Record<string, Record<string, string>> = {
    ja: {
      general: '一般',
      product: '製品',
      support: 'サポート',
      other: 'その他',
    },
    en: {
      general: 'General',
      product: 'Product',
      support: 'Support',
      other: 'Other',
    },
  };

  return translations[localePrefix]?.[category] || category;
}
