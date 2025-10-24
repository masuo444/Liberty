import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { checkAdminAuth } from '@/lib/auth';
import { validateImageFile, sanitizeFilename } from '@/lib/file-security';

// Next.jsに動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// コンパニオン画像アップロード（ライセンス別）
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdminClient();
    const { id: licenseId } = params;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // セキュリティ検証（MIME type、拡張子、ファイル名のサニタイズ）
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（5MB制限）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '画像サイズが大きすぎます（最大5MB）' },
        { status: 400 }
      );
    }

    // ファイルを保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ファイル名を生成（ライセンスIDベース + サニタイズ済み拡張子）
    const sanitizedName = sanitizeFilename(file.name);
    const extension = sanitizedName.substring(sanitizedName.lastIndexOf('.')).toLowerCase();
    const filename = `license-${licenseId}-${Date.now()}${extension}`;
    const filepath = join(process.cwd(), 'public', 'uploads', 'companions', filename);

    // ディレクトリが存在しない場合は作成
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'companions');
    if (!existsSync(uploadsDir)) {
      const { mkdirSync } = require('fs');
      mkdirSync(uploadsDir, { recursive: true });
    }

    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/companions/${filename}`;

    // 既存の画像を削除（もしあれば）
    const { data: license } = await supabase
      .from('licenses')
      .select('companion_image_url')
      .eq('id', licenseId)
      .single<{ companion_image_url: string | null }>();

    if (license?.companion_image_url) {
      try {
        const oldFilepath = join(process.cwd(), 'public', license.companion_image_url);
        if (existsSync(oldFilepath)) {
          await unlink(oldFilepath);
        }
      } catch (error) {
        console.error('旧画像削除エラー:', error);
      }
    }

    // データベースを更新
    const { error } = await (supabase
      .from('licenses') as any)
      .update({ companion_image_url: imageUrl })
      .eq('id', licenseId);

    if (error) {
      console.error('画像URL保存エラー:', error);
      return NextResponse.json(
        { error: '画像URLの保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'コンパニオン画像をアップロードしました',
      imageUrl,
    });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました' },
      { status: 500 }
    );
  }
}

// コンパニオン画像削除（ライセンス別）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdminClient();
    const { id: licenseId } = params;

    // 現在の画像URLを取得
    const { data: license } = await supabase
      .from('licenses')
      .select('companion_image_url')
      .eq('id', licenseId)
      .single<{ companion_image_url: string | null }>();

    if (!license?.companion_image_url) {
      return NextResponse.json(
        { error: '削除する画像がありません' },
        { status: 404 }
      );
    }

    // ファイルを削除
    try {
      const filepath = join(process.cwd(), 'public', license.companion_image_url);
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    } catch (error) {
      console.error('画像ファイル削除エラー:', error);
    }

    // データベースを更新
    const { error } = await (supabase
      .from('licenses') as any)
      .update({ companion_image_url: null })
      .eq('id', licenseId);

    if (error) {
      console.error('画像URL削除エラー:', error);
      return NextResponse.json(
        { error: '画像URLの削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'コンパニオン画像を削除しました',
    });
  } catch (error) {
    console.error('画像削除エラー:', error);
    return NextResponse.json(
      { error: '画像の削除に失敗しました' },
      { status: 500 }
    );
  }
}
