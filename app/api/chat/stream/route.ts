import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type { ChatMessage, LicensePayload, VoiceStatus } from '@/lib/types';
import { chatWithAssistant } from '@/lib/openai-assistant';
import { checkChatRateLimit, logError } from '@/lib/supabase/rate-limit';
import { logUsage } from '@/lib/supabase/licenses';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages: ChatMessage[];
    locale: string;
    license: LicensePayload;
    voice: VoiceStatus;
    threadId?: string;
  };

  if (!body.license?.features?.chat) {
    return NextResponse.json({ message: 'チャット機能が無効です。' }, { status: 403 });
  }

  // Rate Limitチェック
  if (body.license?.companyId) {
    try {
      const rateLimitStatus = await checkChatRateLimit(body.license.companyId);

      if (!rateLimitStatus.allowed) {
        // Rate Limit超過をログに記録
        const headersList = headers();
        await logError({
          errorType: 'rate_limit_exceeded',
          errorMessage: `チャット月間制限を超過しました (${rateLimitStatus.currentUsage}/${rateLimitStatus.limit})`,
          errorData: { rateLimitStatus },
          requestPath: '/api/chat/stream',
          userAgent: headersList.get('user-agent') || undefined,
          ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
        });

        return NextResponse.json(
          {
            message: `月間チャット回数の上限に達しました。\n現在の使用量: ${rateLimitStatus.currentUsage}/${rateLimitStatus.limit}\nリセット日: ${rateLimitStatus.resetDate.toLocaleDateString('ja-JP')}`,
          },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('Rate Limitチェックエラー:', error);
      // Rate Limitチェックが失敗してもチャットは続行（フェイルオープン）
    }
  }

  try {
    // 最後のユーザーメッセージを取得
    const lastMessage = body.messages.filter((msg) => msg.role === 'user').at(-1);

    if (!lastMessage) {
      return NextResponse.json({ message: 'メッセージがありません。' }, { status: 400 });
    }

    // OpenAI Assistantで回答を生成
    const result = await chatWithAssistant(
      lastMessage.content,
      body.license?.companyId,
      body.threadId
    );

    // チャット使用ログを記録
    if (body.license?.companyId) {
      const headersList = headers();
      await logUsage({
        license_id: body.license.companyId, // ここは実際にはlicense_idが必要
        event_type: 'chat',
        event_data: {
          message_length: lastMessage.content.length,
          response_length: result.response.length,
          thread_id: result.threadId,
        },
        user_language: body.locale,
        user_agent: headersList.get('user-agent') || undefined,
        ip_address: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
      });
    }

    // ストリーミング形式でレスポンスを返す（互換性のため）
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // レスポンスを複数チャンクに分割してストリーミング風に返す
        const chunkSize = Math.ceil(result.response.length / 3);
        const chunks = [
          JSON.stringify({ delta: result.response.slice(0, chunkSize), threadId: result.threadId }),
          JSON.stringify({ delta: result.response.slice(chunkSize, chunkSize * 2) }),
          JSON.stringify({ delta: result.response.slice(chunkSize * 2) }),
          JSON.stringify({
            citations: result.citations.map((fileId) => ({ title: `File: ${fileId}` })),
            done: true,
            threadId: result.threadId,
          }),
        ];

        chunks.forEach((chunk, index) => {
          setTimeout(() => controller.enqueue(encoder.encode(`${chunk}\n`)), index * 100);
        });

        setTimeout(() => controller.close(), chunks.length * 120);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/jsonl; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('チャットエラー:', error);

    // エラーログを記録
    const headersList = headers();
    await logError({
      errorType: 'openai_error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorData: { error: String(error) },
      requestPath: '/api/chat/stream',
      userAgent: headersList.get('user-agent') || undefined,
      ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
    });

    return NextResponse.json(
      { message: 'チャット処理中にエラーが発生しました。しばらくしてからもう一度お試しください。' },
      { status: 500 }
    );
  }
}
