import { checkAdminAuth } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/types';

// @ts-nocheck

type LicenseInsert = Database['public']['Tables']['licenses']['Insert'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];

// ライセンス一覧取得
export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from('licenses')
      .select(`
        *,
        company:companies(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('ライセンス一覧取得エラー:', error);
      return NextResponse.json(
        { error: 'ライセンス一覧の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ licenses: data });
  } catch (error) {
    console.error('ライセンス一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ライセンス作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      companyDisplayName,
      companyEmail,
      companyPhone,
      licenseKey,
      expiresAt,
      maxUsers,
      features,
    } = body;

    // バリデーション
    if (!companyName || !companyDisplayName || !licenseKey || !expiresAt) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // 1. 企業を作成
    const companyData: CompanyInsert = {
      name: companyName,
      display_name: companyDisplayName,
      email: companyEmail || null,
      phone: companyPhone || null,
    };

    const { data: company, error: companyError } = await (supabase
      .from('companies') as any)
      .insert(companyData)
      .select()
      .single();

    if (companyError || !company) {
      console.error('企業作成エラー:', companyError);
      return NextResponse.json(
        { error: '企業の作成に失敗しました' },
        { status: 500 }
      );
    }

    // 2. ライセンスを作成
    const licenseData: LicenseInsert = {
      company_id: company.id,
      license_key: licenseKey,
      expires_at: expiresAt,
      max_users: maxUsers || 100,
      is_active: true,
      features: features || {
        chat: true,
        video: true,
        companion: true,
        exhibition: true,
        tts: true,
        stt: true,
        knowledge_upload: true,
        analytics: true,
      },
    };

    const { data: license, error: licenseError } = await (supabase
      .from('licenses') as any)
      .insert(licenseData)
      .select(`
        *,
        company:companies(*)
      `)
      .single();

    if (licenseError || !license) {
      console.error('ライセンス作成エラー:', licenseError);

      // 企業も削除（ロールバック）
      await supabase.from('companies').delete().eq('id', company.id);

      return NextResponse.json(
        { error: 'ライセンスの作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { license, message: 'ライセンスを作成しました' },
      { status: 201 }
    );
  } catch (error) {
    console.error('ライセンス作成エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
