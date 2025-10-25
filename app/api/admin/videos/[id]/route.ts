import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { del } from '@vercel/blob';
import type { VideoUpdate } from '@/lib/supabase/types';

// 動画更新
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, displayOrder, isActive } = body;

    const supabase = getSupabaseAdminClient();

    const updateData: VideoUpdate = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.display_order = displayOrder;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    // @ts-ignore - Supabase type inference issue
    const { data, error } = await (supabase
      .from('videos') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('動画更新エラー:', error);
      return NextResponse.json(
        { error: '動画の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      video: data,
      message: '動画を更新しました',
    });
  } catch (error) {
    console.error('動画更新エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 動画削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const { id } = params;
    const supabase = getSupabaseAdminClient();

    // 動画情報を取得
    // @ts-ignore - Supabase type inference issue
    const { data: video, error: fetchError } = await (supabase
      .from('videos') as any)
      .select('video_url')
      .eq('id', id)
      .single();

    if (fetchError || !video) {
      return NextResponse.json(
        { error: '動画が見つかりません' },
        { status: 404 }
      );
    }

    // Vercel Blobから削除
    try {
      await del(video.video_url);
    } catch (blobError) {
      console.error('Blob削除エラー:', blobError);
      // Blob削除エラーは続行（データベースからは削除する）
    }

    // データベースから削除
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('動画削除エラー:', deleteError);
      return NextResponse.json(
        { error: '動画の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '動画を削除しました',
    });
  } catch (error) {
    console.error('動画削除エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
