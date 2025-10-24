import { NextResponse } from 'next/server';
import { listVectorStoreFiles, deleteFileFromVectorStore } from '@/lib/openai-assistant';
import { checkAdminAuth } from '@/lib/auth';

// ライセンス別ファイル一覧取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const { id: licenseId } = params;

    const files = await listVectorStoreFiles(undefined, licenseId);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('ファイル一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// ライセンス別ファイル削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const { id: licenseId } = params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'ファイルIDが指定されていません' },
        { status: 400 }
      );
    }

    await deleteFileFromVectorStore(fileId, undefined, licenseId);

    return NextResponse.json({ message: 'ファイルを削除しました' });
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    return NextResponse.json(
      { error: 'ファイルの削除に失敗しました' },
      { status: 500 }
    );
  }
}
