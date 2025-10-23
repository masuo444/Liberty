import { NextResponse } from 'next/server';
import { uploadFileToVectorStore } from '@/lib/openai-assistant';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (10MB制限)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // 対応ファイル形式チェック
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/json',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '対応していないファイル形式です。PDF、TXT、MD、JSONのみ対応しています。' },
        { status: 400 }
      );
    }

    // OpenAI Vector Storeにアップロード
    const result = await uploadFileToVectorStore(file);

    return NextResponse.json({
      ok: true,
      source: {
        id: result.fileId,
        title: result.fileName,
        type: file.type,
        vectorStoreId: result.vectorStoreId,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
