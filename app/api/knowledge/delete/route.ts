import { NextResponse } from 'next/server';
import { getOpenAIClient, getOrCreateVectorStore } from '@/lib/openai-assistant';

export async function DELETE(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'ファイルIDが見つかりません' },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();
    const vectorStore = await getOrCreateVectorStore();

    // Vector Storeからファイルを削除
    await client.beta.vectorStores.files.del(vectorStore.id, fileId);

    // OpenAIからファイルを削除
    try {
      await client.files.del(fileId);
    } catch (error) {
      console.warn('ファイル削除エラー（既に削除済みの可能性）:', error);
    }

    return NextResponse.json({
      ok: true,
      message: 'ファイルを削除しました',
    });
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    return NextResponse.json(
      { error: 'ファイルの削除に失敗しました' },
      { status: 500 }
    );
  }
}
