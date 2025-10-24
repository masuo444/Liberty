import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { checkAdminAuth } from '@/lib/auth';


// Next.jsに動的レンダリングを強制
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 企業削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 認証チェック
  const authError = await checkAdminAuth();
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdminClient();
    const companyId = params.id;

    // 企業に関連するライセンスを確認
    const { data: licenses } = await supabase
      .from('licenses')
      .select('id')
      .eq('company_id', companyId);

    if (licenses && licenses.length > 0) {
      return NextResponse.json(
        {
          error: 'この企業にはライセンスが紐付いています。先にライセンスを削除してください。',
          licenseCount: licenses.length
        },
        { status: 400 }
      );
    }

    // 企業を削除（カスケードで関連データも削除される）
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) {
      console.error('企業削除エラー:', error);
      return NextResponse.json(
        { error: '企業の削除に失敗しました', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '企業を削除しました'
    });
  } catch (error) {
    console.error('企業削除エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
