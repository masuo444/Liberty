import { NextResponse } from 'next/server';
import { uploadFileToVectorStore } from '@/lib/openai-assistant';

// ライセンス別ファイルアップロード
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: licenseId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // サポートされているファイル形式をチェック
    const supportedExtensions = ['.pdf', '.txt', '.md', '.doc', '.docx', '.csv', '.json'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!supportedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        {
          error: `サポートされていないファイル形式です。対応形式: ${supportedExtensions.join(', ')}`
        },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（50MB制限）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（最大50MB）' },
        { status: 400 }
      );
    }

    const result = await uploadFileToVectorStore(file, undefined, licenseId);

    return NextResponse.json({
      message: 'ファイルをアップロードしました',
      file: result,
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
}
