import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { checkAdminAuth } from '@/lib/auth';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ライセンス用の動画一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const licenseId = params.id;
    const supabase = getSupabaseAdminClient();

    // ライセンスの存在確認
    // @ts-ignore - Supabase type inference issue
    const { data: license, error: licenseError } = await (supabase
      .from('licenses') as any)
      .select('id')
      .eq('id', licenseId)
      .single();

    if (licenseError || !license) {
      console.error('[License Videos API] ライセンス取得エラー:', licenseError);
      return NextResponse.json(
        { error: 'ライセンスが見つかりません', details: licenseError },
        { status: 404 }
      );
    }

    // このライセンス専用の動画と全ライセンス共通の動画を取得
    // @ts-ignore - Supabase type inference issue
    const { data: videos, error: videosError } = await (supabase
      .from('videos') as any)
      .select('*')
      .or(`license_id.eq.${licenseId},license_id.is.null`)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (videosError) {
      console.error('[License Videos API] 動画取得エラー:', videosError);
      return NextResponse.json(
        { error: '動画の取得に失敗しました', details: videosError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      videos: videos || [],
    });
  } catch (error) {
    console.error('[License Videos API] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '動画の取得に失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

// ライセンス用の動画アップロード
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
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '動画ファイルが指定されていません' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'タイトルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック (100MB制限)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '動画ファイルは100MB以下にしてください' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // ライセンスの存在確認
    // @ts-ignore - Supabase type inference issue
    const { data: license, error: licenseError } = await (supabase
      .from('licenses') as any)
      .select('id')
      .eq('id', licenseId)
      .single();

    if (licenseError || !license) {
      console.error('[License Videos API] ライセンス取得エラー:', licenseError);
      return NextResponse.json(
        { error: 'ライセンスが見つかりません', details: licenseError },
        { status: 404 }
      );
    }

    // 動画ファイルをVercel Blobにアップロード
    const timestamp = Date.now();
    const videoFileName = `${licenseId}-${timestamp}-${file.name}`;
    const videoBlob = await put(videoFileName, file, {
      access: 'public',
    });

    let thumbnailUrl: string | null = null;

    // サムネイルがある場合はアップロード
    if (thumbnailFile) {
      const thumbnailFileName = `${licenseId}-${timestamp}-thumbnail-${thumbnailFile.name}`;
      const thumbnailBlob = await put(thumbnailFileName, thumbnailFile, {
        access: 'public',
      });
      thumbnailUrl = thumbnailBlob.url;
    }

    // 最大のdisplay_orderを取得
    // @ts-ignore - Supabase type inference issue
    const { data: maxOrderData } = await (supabase
      .from('videos') as any)
      .select('display_order')
      .eq('license_id', licenseId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const displayOrder = maxOrderData ? maxOrderData.display_order + 1 : 0;

    // データベースに保存
    // @ts-ignore - Supabase type inference issue
    const { data: video, error: insertError } = await (supabase
      .from('videos') as any)
      .insert({
        title,
        description: description || null,
        video_url: videoBlob.url,
        thumbnail_url: thumbnailUrl,
        display_order: displayOrder,
        is_active: true,
        license_id: licenseId, // このライセンス専用
      })
      .select()
      .single();

    if (insertError) {
      console.error('[License Videos API] DB挿入エラー:', insertError);
      return NextResponse.json(
        { error: 'データベースへの保存に失敗しました', details: insertError },
        { status: 500 }
      );
    }

    console.log('[License Videos API] 動画アップロード成功:', video);
    return NextResponse.json({
      success: true,
      video,
      message: '動画をアップロードしました',
    });
  } catch (error) {
    console.error('[License Videos API] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '動画のアップロードに失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
