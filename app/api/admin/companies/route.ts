import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { checkAdminAuth } from '@/lib/auth';


// Next.jsに動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 企業一覧取得
export async function GET() {
  try {
    console.log('[Companies API] 企業一覧を取得中...');
    console.log('[Companies API] 環境変数チェック:', {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SERVICE_ROLE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    });

    const supabase = getSupabaseAdminClient();
    console.log('[Companies API] Supabaseクライアント取得成功');

    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        licenses:licenses(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Companies API] Supabaseクエリエラー:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: '企業一覧の取得に失敗しました', supabaseError: error },
        { status: 500 }
      );
    }

    console.log('[Companies API] 取得成功:', data?.length || 0, '件');
    return NextResponse.json({ companies: data });
  } catch (error) {
    console.error('[Companies API] catchエラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'サーバーエラーが発生しました';
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { error: errorMessage, details: String(error), stack },
      { status: 500 }
    );
  }
}
