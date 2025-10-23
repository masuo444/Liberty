import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai-assistant';
import { generateElevenLabsSpeech, getDefaultVoiceForLocale } from '@/lib/elevenlabs-tts';
import type { LicensePayload } from '@/lib/types';
import { logError } from '@/lib/supabase/rate-limit';
import { headers } from 'next/headers';

export const runtime = 'nodejs';

// ロケールから音声を選択
function getVoiceForLocale(locale: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
  const voiceMap: Record<string, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
    'ja': 'alloy',    // 日本語: alloy（ニュートラル）
    'en': 'nova',     // 英語: nova（女性的）
    'zh': 'shimmer',  // 中国語: shimmer（明るい）
    'ko': 'echo',     // 韓国語: echo（男性的）
  };
  return voiceMap[locale] || 'alloy';
}

export async function POST(request: Request) {
  const { text, locale, license } = (await request.json()) as {
    text: string;
    locale: string;
    license: LicensePayload;
  };

  if (!license?.features?.tts) {
    return NextResponse.json({ message: '音声機能がロックされています。' }, { status: 403 });
  }

  if (!text) {
    return NextResponse.json({ message: 'text が必要です。' }, { status: 400 });
  }

  try {
    // プレミアム音声が有効ならElevenLabs、そうでなければOpenAI
    const usePremiumVoice = license?.features?.premium_voice === true;

    let stream: ReadableStream;

    if (usePremiumVoice) {
      // ElevenLabs TTS（プレミアム）
      const voiceId = getDefaultVoiceForLocale(locale);
      stream = await generateElevenLabsSpeech(text, voiceId, {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.3,
        useSpeakerBoost: true,
      });
    } else {
      // OpenAI TTS（標準）
      const openai = getOpenAIClient();
      const mp3Stream = await openai.audio.speech.create({
        model: 'tts-1', // 高速モデル（tts-1-hdより2倍速い）
        voice: getVoiceForLocale(locale),
        input: text,
        speed: 1.2, // 1.2倍速で再生（より高速化）
        response_format: 'mp3',
      });
      stream = mp3Stream.body!;
    }

    // ストリーミングレスポンスとして返す（チャンク単位で即座に送信開始）
    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
        'X-Voice-Provider': usePremiumVoice ? 'elevenlabs' : 'openai',
      },
    });
  } catch (error) {
    console.error('TTS エラー:', error);

    // エラーログを記録
    const headersList = headers();
    await logError({
      errorType: 'tts_error',
      errorMessage: error instanceof Error ? error.message : 'Unknown TTS error',
      errorData: { text: text.substring(0, 100), locale },
      requestPath: '/api/voice/tts',
      userAgent: headersList.get('user-agent') || undefined,
      ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
    });

    return NextResponse.json(
      { message: '音声生成中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
