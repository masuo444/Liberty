import { NextResponse } from 'next/server';
import { initializeKnowledgeBase } from '@/lib/openai-assistant';

/**
 * 初期化エンドポイント
 * 一度だけ実行して、Assistant IDとVector Store IDを取得する
 */
export async function GET() {
  try {
    const result = await initializeKnowledgeBase();

    return NextResponse.json({
      success: true,
      message: '知識ベースを初期化しました',
      ...result,
      instructions: [
        '以下の環境変数をVercelに追加してください:',
        `OPENAI_ASSISTANT_ID=${result.assistantId || 'N/A'}`,
        `OPENAI_VECTOR_STORE_ID=${result.vectorStoreId || 'N/A'}`,
        '',
        '設定後、このエンドポイントは削除してください。',
      ].join('\n'),
    });
  } catch (error) {
    console.error('初期化エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '初期化に失敗しました'
      },
      { status: 500 }
    );
  }
}
