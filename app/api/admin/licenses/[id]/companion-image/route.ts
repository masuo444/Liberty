import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { checkAdminAuth } from '@/lib/auth';
import { validateImageFile, sanitizeFilename } from '@/lib/file-security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// コンパニオン画像アップロード（ライセンス経由）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const licenseId = params.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '画像ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // セキュリティ検証
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (5MB制限)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '画像ファイルは5MB以下にしてください' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // ライセンスと企業情報を取得
    // @ts-ignore - Supabase type inference issue
    const { data: license, error: licenseError } = await (supabase
      .from('licenses') as any)
      .select('id, company_id, companies(id, name, companion_image_url)')
      .eq('id', licenseId)
      .single();

    if (licenseError || !license) {
      return NextResponse.json(
        { error: 'ライセンスが見つかりません' },
        { status: 404 }
      );
    }

    const company = license.companies as any;
    const companyId = company.id;

    // 古い画像を削除（存在する場合）
    if (company.companion_image_url) {
      try {
        const oldPath = company.companion_image_url.split('/companion-images/')[1];
        if (oldPath) {
          await supabase.storage
            .from('companion-images')
            .remove([oldPath]);
          console.log('[License Companion Image API] 古い画像を削除:', oldPath);
        }
      } catch (error) {
        console.error('[License Companion Image API] 古い画像の削除エラー:', error);
      }
    }

    // ファイル名を生成
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(file.name);
    const extension = sanitizedName.substring(sanitizedName.lastIndexOf('.')).toLowerCase();
    const sanitizedCompanyName = sanitizeFilename(company.name);
    const fileName = `${sanitizedCompanyName}-${timestamp}${extension}`;
    const filePath = `${companyId}/${fileName}`;

    // ファイルをArrayBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Supabase Storageにアップロード
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('companion-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[License Companion Image API] アップロードエラー:', uploadError);
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました', details: uploadError },
        { status: 500 }
      );
    }

    // 公開URLを取得
    const { data: publicUrlData } = supabase.storage
      .from('companion-images')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // 企業のデータベースを更新
    const { error: updateError } = await (supabase
      .from('companies') as any)
      .update({ companion_image_url: imageUrl })
      .eq('id', companyId);

    if (updateError) {
      console.error('[License Companion Image API] DB更新エラー:', updateError);
      // アップロードした画像を削除
      await supabase.storage.from('companion-images').remove([filePath]);
      return NextResponse.json(
        { error: 'データベースの更新に失敗しました', details: updateError },
        { status: 500 }
      );
    }

    console.log('[License Companion Image API] 画像アップロード成功:', imageUrl);
    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'コンパニオン画像をアップロードしました',
    });
  } catch (error) {
    console.error('[License Companion Image API] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '画像のアップロードに失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

// コンパニオン画像削除（ライセンス経由）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const licenseId = params.id;
    const supabase = getSupabaseAdminClient();

    // ライセンスと企業情報を取得
    // @ts-ignore - Supabase type inference issue
    const { data: license, error: licenseError } = await (supabase
      .from('licenses') as any)
      .select('id, company_id, companies(id, companion_image_url)')
      .eq('id', licenseId)
      .single();

    if (licenseError || !license) {
      return NextResponse.json(
        { error: 'ライセンスが見つかりません' },
        { status: 404 }
      );
    }

    const company = license.companies as any;
    const companyId = company.id;

    if (!company.companion_image_url) {
      return NextResponse.json(
        { error: '削除する画像がありません' },
        { status: 404 }
      );
    }

    // URLからファイルパスを抽出
    const filePath = company.companion_image_url.split('/companion-images/')[1];
    if (!filePath) {
      return NextResponse.json(
        { error: '画像のパスが無効です' },
        { status: 400 }
      );
    }

    // Storageから削除
    const { error: deleteError } = await supabase.storage
      .from('companion-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('[License Companion Image API] 削除エラー:', deleteError);
      return NextResponse.json(
        { error: '画像の削除に失敗しました', details: deleteError },
        { status: 500 }
      );
    }

    // 企業のデータベースを更新
    const { error: updateError } = await (supabase
      .from('companies') as any)
      .update({ companion_image_url: null })
      .eq('id', companyId);

    if (updateError) {
      console.error('[License Companion Image API] DB更新エラー:', updateError);
      return NextResponse.json(
        { error: 'データベースの更新に失敗しました', details: updateError },
        { status: 500 }
      );
    }

    console.log('[License Companion Image API] 画像削除成功');
    return NextResponse.json({
      success: true,
      message: 'コンパニオン画像を削除しました',
    });
  } catch (error) {
    console.error('[License Companion Image API] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '画像の削除に失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
