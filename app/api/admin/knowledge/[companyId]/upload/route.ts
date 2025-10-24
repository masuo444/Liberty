import { NextResponse } from 'next/server';
import { uploadFileToVectorStore } from '@/lib/openai-assistant';
import { checkAdminAuth } from '@/lib/auth';
import { validateDocumentFile } from '@/lib/file-security';

// 企業別ファイルアップロード
export async function POST(
  request: Request,
  { params }: { params: { companyId: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

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

    // セキュリティ検証（MIME type、拡張子、ファイル名のサニタイズ）
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
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
