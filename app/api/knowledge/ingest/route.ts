import { NextResponse } from 'next/server';
import type { KnowledgeSource } from '@/lib/types';

export async function POST(request: Request) {
  const { title, type } = (await request.json()) as Partial<KnowledgeSource>;

  if (!title || !type) {
    return NextResponse.json({ message: 'title と type が必要です。' }, { status: 400 });
  }

  // 実際にはアップロードされた PDF や URL を処理し、ベクトルインデックスを更新する
  const mockSource: KnowledgeSource = {
    id: crypto.randomUUID(),
    title,
    type,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ ok: true, source: mockSource });
}
