import { NextResponse } from 'next/server';
import { uploadFileToVectorStore } from '@/lib/openai-assistant';

// 企業別ファイルアップロード
export async function POST(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (50MB制限)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（最大50MB）' },
        { status: 400 }
      );
    }

    // 対応ファイル形式チェック
    const allowedExtensions = ['.pdf', '.txt', '.md', '.doc', '.docx', '.csv', '.json'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `対応していないファイル形式です（対応: ${allowedExtensions.join(', ')}）` },
        { status: 400 }
      );
    }

    const result = await uploadFileToVectorStore(file, companyId);

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
