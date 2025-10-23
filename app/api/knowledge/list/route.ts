import { NextResponse } from 'next/server';
import { listVectorStoreFiles, initializeKnowledgeBase } from '@/lib/openai-assistant';

export async function GET() {
  try {
    // 知識ベースを初期化
    await initializeKnowledgeBase();

    // ファイル一覧を取得
    const files = await listVectorStoreFiles();

    return NextResponse.json({
      ok: true,
      files: files.map((file: any) => ({
        id: file.id,
        status: file.status,
        createdAt: file.created_at,
        filename: file.filename || 'Unknown',
      })),
      count: files.length,
    });
  } catch (error) {
    console.error('ファイル一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
