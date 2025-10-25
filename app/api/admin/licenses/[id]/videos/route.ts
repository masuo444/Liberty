import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { checkAdminAuth } from '@/lib/auth';

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

// ライセンス用の動画追加（YouTube URL）
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const licenseId = params.id;
    const body = await request.json();
    const { youtube_url, title, description } = body;

    if (!youtube_url) {
      return NextResponse.json(
        { error: 'YouTube URLが指定されていません' },
        { status: 400 }
      );
    }

    if (!title) {
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

    // YouTube埋め込みURLとサムネイルURLを生成
    const embedUrl = getYouTubeEmbedUrl(videoId);
    const thumbnailUrl = getYouTubeThumbnail(videoId);

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
        video_url: embedUrl,
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

    console.log('[License Videos API] 動画追加成功:', video);
    return NextResponse.json({
      success: true,
      video,
      message: '動画を追加しました',
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
