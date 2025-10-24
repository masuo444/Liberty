import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';

// Next.jsに動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 企業一覧取得
export async function GET() {
  try {
    console.log('[Companies API] 企業一覧を取得中...');
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        licenses:licenses(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Companies API] 企業一覧取得エラー:', error);
      return NextResponse.json(
        { error: '企業一覧の取得に失敗しました' },
        { status: 500 }
      );
    }

    console.log('[Companies API] 取得成功:', data?.length || 0, '件');
    return NextResponse.json({ companies: data });
  } catch (error) {
    console.error('[Companies API] catchエラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'サーバーエラーが発生しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
