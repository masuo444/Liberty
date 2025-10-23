// @ts-nocheck
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import type { LicenseUpdate } from '@/lib/supabase/types';

// ライセンス編集
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { expiresAt, maxUsers, features, isActive } = body;

    const supabase = getSupabaseAdminClient();

    // 更新データを構築
    const updateData: LicenseUpdate = {};
    if (expiresAt !== undefined) updateData.expires_at = expiresAt;
    if (maxUsers !== undefined) updateData.max_users = maxUsers;
    if (features !== undefined) updateData.features = features;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    // @ts-ignore - Supabase type inference issue
    const { data, error } = await supabase
      .from('licenses')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        company:companies(*)
      `)
      .single();

    if (error || !data) {
      console.error('ライセンス更新エラー:', error);
      return NextResponse.json(
        { error: 'ライセンスの更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      license: data,
      message: 'ライセンスを更新しました',
    });
  } catch (error) {
    console.error('ライセンス更新エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ライセンス削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getSupabaseAdminClient();

    // ライセンスを取得して企業IDを確認
    const { data: license, error: fetchError } = await supabase
      .from('licenses')
      .select('company_id')
      .eq('id', id)
      .single();

    if (fetchError || !license) {
      console.error('ライセンス取得エラー:', fetchError);
      return NextResponse.json(
        { error: 'ライセンスが見つかりません' },
        { status: 404 }
      );
    }

    const companyId = license.company_id;

    // ライセンスを削除
    const { error: deleteError } = await supabase
      .from('licenses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('ライセンス削除エラー:', deleteError);
      return NextResponse.json(
        { error: 'ライセンスの削除に失敗しました' },
        { status: 500 }
      );
    }

    // この企業の他のライセンスがあるか確認
    const { data: otherLicenses, error: checkError } = await supabase
      .from('licenses')
      .select('id')
      .eq('company_id', companyId);

    if (checkError) {
      console.error('他のライセンス確認エラー:', checkError);
    }

    // 他のライセンスがなければ企業も削除
    if (!otherLicenses || otherLicenses.length === 0) {
      const { error: deleteCompanyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (deleteCompanyError) {
        console.error('企業削除エラー:', deleteCompanyError);
      }
    }

    return NextResponse.json({
      message: 'ライセンスを削除しました',
    });
  } catch (error) {
    console.error('ライセンス削除エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
