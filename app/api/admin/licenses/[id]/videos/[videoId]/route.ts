import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { checkAdminAuth } from '@/lib/auth';
import { del } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ライセンス用の動画削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const licenseId = params.id;
    const videoId = params.videoId;
    const supabase = getSupabaseAdminClient();

    // 動画情報を取得
    // @ts-ignore - Supabase type inference issue
    const { data: video, error: videoError } = await (supabase
      .from('videos') as any)
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      console.error('[License Video Delete API] 動画取得エラー:', videoError);
      return NextResponse.json(
        { error: '動画が見つかりません', details: videoError },
        { status: 404 }
      );
    }

    // このライセンスの動画かチェック（license_idがnullの場合は削除不可）
    if (video.license_id !== licenseId) {
      return NextResponse.json(
        { error: 'この動画を削除する権限がありません' },
        { status: 403 }
      );
    }

    // Vercel Blobから動画ファイルを削除
    try {
      await del(video.video_url);
      console.log('[License Video Delete API] 動画ファイル削除:', video.video_url);
    } catch (error) {
      console.error('[License Video Delete API] 動画ファイル削除エラー:', error);
      // ファイル削除エラーでも続行
    }

    // サムネイルがある場合は削除
    if (video.thumbnail_url) {
      try {
        await del(video.thumbnail_url);
        console.log('[License Video Delete API] サムネイル削除:', video.thumbnail_url);
      } catch (error) {
        console.error('[License Video Delete API] サムネイル削除エラー:', error);
        // ファイル削除エラーでも続行
      }
    }

    // データベースから削除
    // @ts-ignore - Supabase type inference issue
    const { error: deleteError } = await (supabase
      .from('videos') as any)
      .delete()
      .eq('id', videoId);

    if (deleteError) {
      console.error('[License Video Delete API] DB削除エラー:', deleteError);
      return NextResponse.json(
        { error: 'データベースからの削除に失敗しました', details: deleteError },
        { status: 500 }
      );
    }

    console.log('[License Video Delete API] 動画削除成功:', videoId);
    return NextResponse.json({
      success: true,
      message: '動画を削除しました',
    });
  } catch (error) {
    console.error('[License Video Delete API] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '動画の削除に失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

// ライセンス用の動画更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const licenseId = params.id;
    const videoId = params.videoId;
    const body = await request.json();
    const supabase = getSupabaseAdminClient();

    // 動画情報を取得
    // @ts-ignore - Supabase type inference issue
    const { data: video, error: videoError } = await (supabase
      .from('videos') as any)
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      console.error('[License Video Update API] 動画取得エラー:', videoError);
      return NextResponse.json(
        { error: '動画が見つかりません', details: videoError },
        { status: 404 }
      );
    }

    // このライセンスの動画かチェック
    if (video.license_id !== licenseId) {
      return NextResponse.json(
        { error: 'この動画を更新する権限がありません' },
        { status: 403 }
      );
    }

    // 更新可能なフィールド
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.display_order !== undefined) updateData.display_order = body.display_order;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // データベースを更新
    // @ts-ignore - Supabase type inference issue
    const { data: updatedVideo, error: updateError } = await (supabase
      .from('videos') as any)
      .update(updateData)
      .eq('id', videoId)
      .select()
      .single();

    if (updateError) {
      console.error('[License Video Update API] DB更新エラー:', updateError);
      return NextResponse.json(
        { error: 'データベースの更新に失敗しました', details: updateError },
        { status: 500 }
      );
    }

    console.log('[License Video Update API] 動画更新成功:', updatedVideo);
    return NextResponse.json({
      success: true,
      video: updatedVideo,
      message: '動画を更新しました',
    });
  } catch (error) {
    console.error('[License Video Update API] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '動画の更新に失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
