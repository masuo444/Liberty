/**
 * ElevenLabs Text-to-Speech API統合
 * プレミアム音声オプション用
 */

export type ElevenLabsVoiceId =
  | 'Rachel' // 女性、アメリカ英語、落ち着いた
  | 'Domi'   // 女性、アメリカ英語、元気
  | 'Bella'  // 女性、アメリカ英語、若い
  | 'Antoni' // 男性、アメリカ英語、よく通る
  | 'Elli'   // 女性、アメリカ英語、感情的
  | 'Josh'   // 男性、アメリカ英語、深い
  | 'Arnold' // 男性、アメリカ英語、クリスプ
  | 'Adam'   // 男性、アメリカ英語、深い
  | 'Sam';   // 男性、アメリカ英語、若い

// Voice IDマッピング（実際のElevenLabs Voice ID）
const VOICE_ID_MAP: Record<ElevenLabsVoiceId, string> = {
  'Rachel': '21m00Tcm4TlvDq8ikWAM',
  'Domi': 'AZnzlk1XvdvUeBnXmlld',
  'Bella': 'EXAVITQu4vr4xnSDxMaL',
  'Antoni': 'ErXwobaYiN019PkySvjV',
  'Elli': 'MF3mGyEYCl7XYWbV9V6O',
  'Josh': 'TxGEqnHWrfWFTfGW9XjX',
  'Arnold': 'VR6AewLTigWG4xSOukaG',
  'Adam': 'pNInz6obpgDQGcFmaJgB',
  'Sam': 'yoZ06aMxZJJ28mfd3POQ',
};

/**
 * ロケールに応じたデフォルトボイスを取得
 */
export function getDefaultVoiceForLocale(locale: string): ElevenLabsVoiceId {
  const localePrefix = locale.split('-')[0];

  switch (localePrefix) {
    case 'ja':
      return 'Bella'; // 日本語: 女性の優しい声
    case 'en':
      return 'Rachel'; // 英語: 落ち着いた女性
    case 'zh':
      return 'Domi'; // 中国語: 元気な女性
    case 'ko':
      return 'Elli'; // 韓国語: 感情的な女性
    default:
      return 'Rachel';
  }
}

/**
 * ElevenLabs APIで音声を生成
 */
export async function generateElevenLabsSpeech(
  text: string,
  voiceId: ElevenLabsVoiceId = 'Rachel',
  options: {
    stability?: number;      // 0-1: 安定性（高いほど一貫性）
    similarityBoost?: number; // 0-1: 類似性ブースト（高いほど元の声に近い）
    style?: number;           // 0-1: スタイルの強さ
    useSpeakerBoost?: boolean; // スピーカーブースト
  } = {}
): Promise<ReadableStream> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is not set');
  }

  const actualVoiceId = VOICE_ID_MAP[voiceId];

  const {
    stability = 0.5,
    similarityBoost = 0.75,
    style = 0,
    useSpeakerBoost = true,
  } = options;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // 多言語対応モデル
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: useSpeakerBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body;
}

/**
 * 利用可能な音声の一覧を取得
 */
export function getAvailableVoices(): Array<{
  id: ElevenLabsVoiceId;
  name: string;
  gender: 'male' | 'female';
  description: string;
}> {
  return [
    {
      id: 'Rachel',
      name: 'Rachel',
      gender: 'female',
      description: '落ち着いた、プロフェッショナルな女性の声',
    },
    {
      id: 'Domi',
      name: 'Domi',
      gender: 'female',
      description: '元気で明るい女性の声',
    },
    {
      id: 'Bella',
      name: 'Bella',
      gender: 'female',
      description: '若々しく優しい女性の声',
    },
    {
      id: 'Antoni',
      name: 'Antoni',
      gender: 'male',
      description: 'よく通る、信頼感のある男性の声',
    },
    {
      id: 'Elli',
      name: 'Elli',
      gender: 'female',
      description: '感情豊かな女性の声',
    },
    {
      id: 'Josh',
      name: 'Josh',
      gender: 'male',
      description: '深みのある、落ち着いた男性の声',
    },
    {
      id: 'Arnold',
      name: 'Arnold',
      gender: 'male',
      description: 'クリアで聞き取りやすい男性の声',
    },
    {
      id: 'Adam',
      name: 'Adam',
      gender: 'male',
      description: '深く、ドラマティックな男性の声',
    },
    {
      id: 'Sam',
      name: 'Sam',
      gender: 'male',
      description: '若々しく親しみやすい男性の声',
    },
  ];
}
