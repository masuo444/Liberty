import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { put } from '@vercel/blob';
import type { Video, VideoInsert } from '@/lib/supabase/types';

// 動画一覧取得（管理者用）
export async function GET() {
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('動画一覧取得エラー:', error);
      return NextResponse.json(
        { error: '動画の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ videos: data as Video[] });
  } catch (error) {
    console.error('動画一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// 動画アップロード
export async function POST(request: Request) {
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;

    if (!videoFile || !title) {
      return NextResponse.json(
        { error: '動画ファイルとタイトルは必須です' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（100MB制限）
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは100MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: '動画ファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // Vercel Blobにアップロード
    const blob = await put(`videos/${Date.now()}-${videoFile.name}`, videoFile, {
      access: 'public',
      contentType: videoFile.type,
    });

    // Supabaseに保存
    const supabase = getSupabaseAdminClient();
    const videoData: VideoInsert = {
      title,
      description,
      video_url: blob.url,
      display_order: displayOrder,
      is_active: true,
    };

    // @ts-ignore - Supabase type inference issue
    const { data, error } = await (supabase
      .from('videos') as any)
      .insert(videoData)
      .select()
      .single();

    if (error) {
      console.error('動画情報保存エラー:', error);
      return NextResponse.json(
        { error: '動画情報の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      video: data as Video,
      message: '動画をアップロードしました',
    });
  } catch (error) {
    console.error('動画アップロードエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
