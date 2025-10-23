import { NextResponse } from 'next/server';
import type { ChatMessage, LicensePayload, VoiceStatus } from '@/lib/types';
import { chatWithAssistant } from '@/lib/openai-assistant';

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

  try {
    // 最後のユーザーメッセージを取得
    const lastMessage = body.messages.filter((msg) => msg.role === 'user').at(-1);

    if (!lastMessage) {
      return NextResponse.json({ message: 'メッセージがありません。' }, { status: 400 });
    }

    // OpenAI Assistantで回答を生成
    const result = await chatWithAssistant(lastMessage.content, body.threadId);

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
    return NextResponse.json(
      { message: 'チャット処理中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
