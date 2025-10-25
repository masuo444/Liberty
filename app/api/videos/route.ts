import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import type { Video } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

// 動画一覧取得（公開API）
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminClient();

    // URLパラメータからlicense_keyを取得
    const { searchParams } = new URL(request.url);
    const licenseKey = searchParams.get('license_key');

    let licenseId: string | null = null;

    // license_keyが指定されている場合、ライセンスIDを取得
    if (licenseKey) {
      // @ts-ignore - Supabase type inference issue
      const { data: license, error: licenseError } = await (supabase
        .from('licenses') as any)
        .select('id')
        .eq('license_key', licenseKey)
        .eq('is_active', true)
        .single();

      if (licenseError) {
        console.error('ライセンス取得エラー:', licenseError);
        // ライセンスが無効な場合は空の配列を返す
        return NextResponse.json({ videos: [] });
      }

      licenseId = license?.id || null;
    }

    // 動画を取得
    // license_keyが指定されている場合: そのライセンス専用の動画 + 全体共有動画
    // license_keyが指定されていない場合: 全体共有動画のみ
    let query = supabase
      .from('videos')
      .select('*')
      .eq('is_active', true);

    if (licenseId) {
      // @ts-ignore - Supabase type inference issue
      query = query.or(`license_id.eq.${licenseId},license_id.is.null`);
    } else {
      // @ts-ignore - Supabase type inference issue
      query = query.is('license_id', null);
    }

    const { data, error } = await query.order('display_order', { ascending: true });

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
