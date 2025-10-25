import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { checkAdminAuth } from '@/lib/auth';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// YouTube URLからビデオIDを抽出する関数
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// YouTube埋め込みURLを生成
function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// YouTubeサムネイルURLを生成
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

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

// ライセンス用の動画追加（YouTube URL or ファイルアップロード）
export async function POST(
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

    // Content-Typeを確認して処理を分岐
    const contentType = request.headers.get('content-type') || '';

    let videoUrl: string;
    let thumbnailUrl: string | null = null;
    let videoType: 'youtube' | 'file';
    let title: string;
    let description: string | null = null;

    if (contentType.includes('application/json')) {
      // YouTube URL方式
      const body = await request.json();
      const { youtube_url, title: bodyTitle, description: bodyDescription } = body;

      if (!youtube_url) {
        return NextResponse.json(
          { error: 'YouTube URLが指定されていません' },
          { status: 400 }
        );
      }

      if (!bodyTitle) {
        return NextResponse.json(
          { error: 'タイトルが指定されていません' },
          { status: 400 }
        );
      }

      // YouTube URLからビデオIDを抽出
      const videoId = extractYouTubeId(youtube_url);
      if (!videoId) {
        return NextResponse.json(
          { error: '有効なYouTube URLを入力してください' },
          { status: 400 }
        );
      }

      title = bodyTitle;
      description = bodyDescription || null;
      videoUrl = getYouTubeEmbedUrl(videoId);
      thumbnailUrl = getYouTubeThumbnail(videoId);
      videoType = 'youtube';

      console.log('[License Videos API] YouTube動画追加:', { title, videoUrl });
    } else {
      // ファイルアップロード方式
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const bodyTitle = formData.get('title') as string;
      const bodyDescription = formData.get('description') as string | null;
      const thumbnailFile = formData.get('thumbnail') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: '動画ファイルが指定されていません' },
          { status: 400 }
        );
      }

      if (!bodyTitle) {
        return NextResponse.json(
          { error: 'タイトルが指定されていません' },
          { status: 400 }
        );
      }

      // ファイルサイズチェック (500MB制限)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: '動画ファイルは500MB以下にしてください（Vercel Proプラン制限）' },
          { status: 400 }
        );
      }

      title = bodyTitle;
      description = bodyDescription || null;

      // 動画ファイルをVercel Blobにアップロード
      const timestamp = Date.now();
      const videoFileName = `${licenseId}-${timestamp}-${file.name}`;
      const videoBlob = await put(videoFileName, file, {
        access: 'public',
      });
      videoUrl = videoBlob.url;

      // サムネイルがある場合はアップロード
      if (thumbnailFile) {
        const thumbnailFileName = `${licenseId}-${timestamp}-thumbnail-${thumbnailFile.name}`;
        const thumbnailBlob = await put(thumbnailFileName, thumbnailFile, {
          access: 'public',
        });
        thumbnailUrl = thumbnailBlob.url;
      }

      videoType = 'file';

      console.log('[License Videos API] ファイルアップロード成功:', { title, videoUrl, size: file.size });
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
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        display_order: displayOrder,
        is_active: true,
        license_id: licenseId,
        video_type: videoType,
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

    console.log('[License Videos API] 動画追加成功:', video);
    return NextResponse.json({
      success: true,
      video,
      message: videoType === 'youtube' ? 'YouTube動画を追加しました' : '動画ファイルをアップロードしました',
    });
  } catch (error) {
    console.error('[License Videos API] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : '動画の追加に失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
