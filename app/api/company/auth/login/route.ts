import { NextRequest, NextResponse } from 'next/server';
import { verifyLicense } from '@/lib/supabase/licenses';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { licenseKey } = await request.json();

    if (!licenseKey || typeof licenseKey !== 'string') {
      return NextResponse.json(
        { error: 'ライセンスキーが必要です' },
        { status: 400 }
      );
    }

    // ライセンスを検証
    const licenseData = await verifyLicense(licenseKey.trim());

    if (!licenseData) {
      return NextResponse.json(
        { error: '無効なライセンスキーまたは期限切れです' },
        { status: 401 }
      );
    }

    // セッションCookieを設定（7日間有効）
    const cookieStore = cookies();
    cookieStore.set('company_license_key', licenseKey.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    });

    return NextResponse.json({
      success: true,
      company: {
        id: licenseData.company_id,
        name: licenseData.company.display_name,
        companionImageUrl: licenseData.company.companion_image_url,
      },
    });
  } catch (error) {
    console.error('[Company Login API] エラー:', error);
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    );
  }
}
