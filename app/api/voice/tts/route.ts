import { NextResponse } from 'next/server';
import type { LicensePayload } from '@/lib/types';

export const runtime = 'nodejs';

const SILENT_MP3 = Buffer.from(
  'SUQzBAAAAAAAF1RTU0UAAAAPAAADTGF2ZjU2LjMxLjEwMAAAAAAAAAAAAAAA//uQZAAAAAAD6AAAAnEAAACcQAAAAnEAAACcQoUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
  'base64',
);

export async function POST(request: Request) {
  const { text, license } = (await request.json()) as {
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

  return new Response(SILENT_MP3, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-cache',
    },
  });
}
