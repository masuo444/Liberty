import { NextResponse } from 'next/server';
import type { ChatMessage, LicensePayload, VoiceStatus } from '@/lib/types';

function mockAnswer(messages: ChatMessage[]): { text: string; citations: ChatMessage['citations'] } {
  const lastMessage = messages.filter((msg) => msg.role === 'user').at(-1);
  const baseText = lastMessage?.content ?? 'ご質問にお答えする準備ができました。';
  return {
    text: `こちらはデモ応答です。「${baseText}」に関する情報は登録された資料から提供されます。`,
    citations: [
      { title: '商品カタログ2025.pdf' },
      { title: 'ブランドヒストリー記事', url: 'https://example.com/history' },
    ],
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages: ChatMessage[];
    locale: string;
    license: LicensePayload;
    voice: VoiceStatus;
  };

  if (!body.license?.features?.chat) {
    return NextResponse.json({ message: 'チャット機能が無効です。' }, { status: 403 });
  }

  const { text, citations } = mockAnswer(body.messages ?? []);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const chunks = [
        JSON.stringify({ delta: text.slice(0, Math.floor(text.length / 2)) }),
        JSON.stringify({ delta: text.slice(Math.floor(text.length / 2)) }),
        JSON.stringify({ citations, done: true }),
      ];

      chunks.forEach((chunk, index) => {
        setTimeout(() => controller.enqueue(encoder.encode(`${chunk}\n`)), index * 200);
      });

      setTimeout(() => controller.close(), chunks.length * 220);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/jsonl; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
