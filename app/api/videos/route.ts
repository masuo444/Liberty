import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import type { Video } from '@/lib/supabase/types';

// 動画一覧取得（公開API）
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
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
