import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

// 企業一覧取得
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        licenses:licenses(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('企業一覧取得エラー:', error);
      return NextResponse.json(
        { error: '企業一覧の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ companies: data });
  } catch (error) {
    console.error('企業一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
