import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const formData = await request.formData();
  const locale = formData.get('locale');

  if (typeof locale !== 'string') {
    return NextResponse.json({ message: 'locale が必要です。' }, { status: 400 });
  }

  // 実際は Whisper API 等に転送する
  return NextResponse.json({ text: `${locale.toUpperCase()} デモ：音声が認識されました。` });
}
